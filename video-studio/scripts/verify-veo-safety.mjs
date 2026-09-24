/** Offline runner tests: a VM executes generate-veo with fake credentials and fetch. */
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const scriptPath = resolve(dirname(fileURLToPath(import.meta.url)), 'generate-veo.mjs');
const source = fs.readFileSync(scriptPath, 'utf8')
  .replace(/^import .*;\r?\n/gm, '')
  .replace(/^const studio = .*;$/m, 'const studio = fixture;');
const compiled = new vm.Script(`(async () => {${source}\n})()`, { filename: 'generate-veo-under-test.mjs' });
const fakeKey = 'OFFLINE_TEST_CREDENTIAL_NEVER_REAL';
const roots = [];
function fixture() {
  const root = fs.mkdtempSync(join(tmpdir(), 'superbase-veo-offline-'));
  roots.push(root);
  const dir = join(root, 'video-studio');
  fs.mkdirSync(join(dir, 'public/footage'), { recursive: true });
  for (const id of ['V01', 'V02A', 'V03A']) fs.writeFileSync(join(dir, `public/footage/${id}.mp4`), 'fake');
  for (const file of [
    'videos/01-prepare/WhatsApp Video 2026-08-16 at 18.41.33.mp4',
    'videos/02-dose-and-mix/WhatsApp Video 2026-08-14 at 11.39.44.mp4',
    'videos/03-roll-and-compact/WhatsApp Video 2026-08-22 at 13.10.35.mp4',
  ]) {
    fs.mkdirSync(dirname(join(root, file)), { recursive: true });
    fs.writeFileSync(join(root, file), 'fake original');
  }
  fs.writeFileSync(join(dir, '.env'), 'GEMINI_API_KEY=OFFLINE_TEST_CREDENTIAL_NEVER_REAL\n');
  return dir;
}
const ledger = (dir) => JSON.parse(fs.readFileSync(join(dir, '.veo/superbase-test.json'), 'utf8'));
async function run(dir, { rejectPost = false, ambiguousPost = false, failPoll = false, redirectDownload = false } = {}) {
  let postCount = 0;
  let pollCount = 0;
  let downloadCount = 0;
  const logs = [];
  const requests = [];
  const processMock = { argv: ['node', scriptPath, '--generate'], env: {}, pid: 987654, exitCode: 0, exit: () => { throw new Error('Unexpected early exit'); } };
  const mp4 = Buffer.alloc(1024);
  mp4.write('ftyp', 4);
  const context = vm.createContext({
    ...fs, resolve, dirname, fileURLToPath, fixture: dir, Buffer, URL, AbortSignal,
    process: processMock,
    parseEnv: () => ({ GEMINI_API_KEY: fakeKey }),
    execFileSync: (_command, args) => fs.writeFileSync(args.at(-1), 'fake seed'),
    console: { log: (...args) => logs.push(args.join(' ')), error: (...args) => logs.push(args.join(' ')) },
    setTimeout: (fn) => { fn(); return 0; },
    fetch: async (url, options) => {
      requests.push({ url, options });
      if (options.method === 'POST') {
        postCount++;
        assert.equal(options.redirect, 'error', 'authenticated API calls must not redirect credentials');
        const body = JSON.parse(options.body);
        assert.equal(body.parameters.sampleCount, 1);
        assert.equal(body.parameters.durationSeconds, 8);
        assert.equal(body.parameters.aspectRatio, '9:16');
        assert.equal(body.parameters.resolution, '1080p');
        assert.equal(ledger(dir).requests.length, postCount, 'reservation must be persisted before POST');
        if (ambiguousPost) throw new Error(`connection lost ${fakeKey}`);
        if (rejectPost) return { ok: false, status: 429, json: async () => ({ error: { message: `quota ${fakeKey}` } }) };
        return { ok: true, json: async () => ({ name: `models/veo-3.1-fast-generate-preview/operations/offline-${postCount}` }) };
      }
      if (url.endsWith('/models/veo-3.1-fast-generate-preview')) {
        return { ok: true, json: async () => ({ name: 'models/veo-3.1-fast-generate-preview' }) };
      }
      if (url.includes('/operations/')) {
        pollCount++;
        if (failPoll) throw new Error('offline transient poll failure');
        return { ok: true, json: async () => ({ done: true, response: { generateVideoResponse: { generatedSamples: [{ video: { uri: 'https://generativelanguage.googleapis.com/download/fake' } }] } } }) };
      }
      if (url.includes('/download/')) {
        downloadCount++;
        if (redirectDownload && new URL(url).hostname === 'generativelanguage.googleapis.com') {
          return { status: 302, headers: { get: () => 'https://storage.googleapis.com/download/fake' } };
        }
        assert.equal(options.headers['x-goog-api-key'], new URL(url).hostname === 'generativelanguage.googleapis.com' ? fakeKey : undefined);
        return { ok: true, status: 200, arrayBuffer: async () => mp4 };
      }
      throw new Error('Unexpected offline URL');
    },
  });
  await compiled.runInContext(context, { timeout: 3000 });
  assert.ok(!logs.join('\n').includes(fakeKey), 'credential leaked into logs');
  const manifestPath = join(dir, 'public/ai/manifest.json');
  if (fs.existsSync(manifestPath)) assert.ok(!fs.readFileSync(manifestPath, 'utf8').includes(fakeKey), 'credential leaked into public manifest');
  return { postCount, pollCount, downloadCount, requests, logs, exitCode: processMock.exitCode };
}

try {
  const successful = fixture();
  const complete = await run(successful, { redirectDownload: true });
  assert.equal(complete.postCount, 4, complete.logs.join('\n'));
  assert.equal(ledger(successful).cost.maximumPlanCostUSD, 3.84);
  assert.equal(ledger(successful).cost.estimatedGeneratedCostUSD, 3.84);
  assert.equal(ledger(successful).billedCostUSD, null);
  assert.equal((await run(successful)).postCount, 0, 'completed rerun must not generate');

  for (const mode of ['rejectPost', 'ambiguousPost']) {
    const dir = fixture();
    const failed = await run(dir, { [mode]: true });
    assert.equal(failed.postCount, 1);
    const state = ledger(dir);
    assert.equal(state.requests.length, 1);
    assert.equal(state.requests[0].status, mode === 'rejectPost' ? 'rejected' : 'unknown');
    assert.ok(!JSON.stringify(state).includes(fakeKey));
    // Fill remaining slots with reserved ambiguous outcomes without another POST.
    state.requests.push(...['prepare-atmosphere', 'dose-atmosphere', 'roll-atmosphere'].map((id) => ({ id, status: 'unknown', generated: false, downloaded: false })));
    fs.writeFileSync(join(dir, '.veo/superbase-test.json'), JSON.stringify(state));
    assert.equal((await run(dir)).postCount, 0, 'uncertain requests consume cap and must not repeat');
  }

  const pending = fixture();
  assert.equal((await run(pending, { failPoll: true })).postCount, 1);
  const pendingState = ledger(pending);
  assert.ok(pendingState.requests[0].operationName);
  pendingState.requests.push(...['prepare-atmosphere', 'dose-atmosphere', 'roll-atmosphere'].map((id) => ({ id, status: 'unknown', generated: false, downloaded: false })));
  fs.writeFileSync(join(pending, '.veo/superbase-test.json'), JSON.stringify(pendingState));
  const resumed = await run(pending);
  assert.equal(resumed.postCount, 0, 'pending operation must resume without a new POST');
  assert.equal(resumed.pollCount, 1);
  assert.equal(ledger(pending).requests[0].downloaded, true);

  const locked = fixture();
  fs.mkdirSync(join(locked, '.veo'));
  fs.writeFileSync(join(locked, '.veo/generation.lock'), 'another-process');
  assert.equal((await run(locked)).postCount, 0, 'concurrent lock must prohibit generation');
  assert.equal(fs.readFileSync(join(locked, '.veo/generation.lock'), 'utf8'), 'another-process');

  console.log('PASS: offline cap, reservation, rerun, ambiguous/rejected failures, poll resume, concurrent lock, redirect credentials, redaction, and cost estimates. No network requests or real credentials used.');
} finally {
  for (const dir of roots) {
    assert.equal(dirname(dir), resolve(tmpdir()));
    assert.ok(dir.startsWith(join(resolve(tmpdir()), 'superbase-veo-offline-')));
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
