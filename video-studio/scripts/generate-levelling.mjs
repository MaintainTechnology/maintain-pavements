/** One new, explicitly requested grading illustration. Node only; never import in src/. */
import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync, copyFileSync, openSync, closeSync, unlinkSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseEnv } from 'node:util';

const studio = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const stateDir = resolve(studio, '.veo');
const aiDir = resolve(studio, 'public/ai');
const ledgerPath = resolve(stateDir, 'superbase-levelling.json');
const lockPath = resolve(stateDir, 'levelling.lock');
const reference = resolve(aiDir, 'seeds/grade-reference.png');
const output = resolve(aiDir, 'grade-levelling.mp4');
const MODEL = 'veo-3.1-generate-preview';
const SECONDS = 8;
const RATE = 0.40;
const BASE = 'https://generativelanguage.googleapis.com/v1beta';
const prompt = 'Create one continuous eight-second 9:16 portrait documentary shot using this supplied photograph as the initial frame. The subject is the yellow compact tracked loader with its wide rectangular open steel levelling frame, under this same steel industrial canopy. Preserve the loader, tracks, front attachment, canopy columns, rough grey aggregate, sunlit bushland and site geometry. Start with the attachment raised as in the reference. During the first two seconds the hydraulic arms naturally lower this existing steel levelling attachment until its bottom edge rests flat on the loose aggregate. Then the loader moves slowly backwards for a short straight pass, dragging this same attachment across the aggregate and leaving a modest visibly flatter strip of granular material. The attachment stays physically connected to the hydraulic arms throughout, tracks roll naturally and contact the ground. Keep machine size and structure consistent; no morphing or floating. A steady operator-eye-level camera watches the movement, with only subtle handheld motion. Keep the adult worker well clear of the machine path. Ground remains aggregate, not concrete, asphalt, wet coating or magically completed pavement. No new vehicles, no dramatic dust, no camera cuts, no text overlays, no new logos, no narration, no music; only restrained machinery ambience. This is an illustrative explanation of the levelling action, not evidence of a completed or tested SuperBase result. The editor will add a clear AI-generated illustrative label.';
const args = process.argv.slice(2);
const refIndex = args.indexOf('--reference');
const referenceInput = refIndex >= 0 ? args[refIndex + 1] : undefined;
if (refIndex >= 0 && (!referenceInput || referenceInput.startsWith('--'))) throw new Error('--reference requires the source image path.');
const switches = refIndex >= 0 ? args.filter((_, index) => index !== refIndex && index !== refIndex + 1) : args;
if (switches.some((arg) => !['--generate', '--status', '--preflight'].includes(arg))) throw new Error('Use --generate, --status, --preflight, and optional --reference <photo>.');
mkdirSync(stateDir, { recursive: true });
mkdirSync(dirname(reference), { recursive: true });
const initial = { version: 1, job: 'superbase-complete-levelling', model: MODEL, cap: 1, seconds: SECONDS, aspectRatio: '9:16', resolution: '1080p', usdPerSecond: RATE, pricingSource: 'https://ai.google.dev/gemini-api/docs/pricing', pricingCheckedOn: '2026-09-24', billedCostUSD: null, requests: [] };
let ledger = existsSync(ledgerPath) ? JSON.parse(readFileSync(ledgerPath, 'utf8')) : initial;
const validate = () => { if (ledger.model !== MODEL || ledger.cap !== 1 || !Array.isArray(ledger.requests) || ledger.requests.length > 1) throw new Error('Unexpected grading ledger. Preserve it; generation refused.'); };
validate();
const summary = () => ({ generationRequests: ledger.requests.length, completedClips: ledger.requests.filter((r) => r.downloaded).length, estimatedGeneratedCostUSD: ledger.requests.some((r) => r.generated) ? SECONDS * RATE : 0, maximumPlanCostUSD: SECONDS * RATE, billedCostUSD: null });
function save() {
  ledger.updatedAt = new Date().toISOString(); ledger.cost = summary();
  writeFileSync(ledgerPath + '.tmp', JSON.stringify(ledger, null, 2) + '\n'); renameSync(ledgerPath + '.tmp', ledgerPath);
  writeFileSync(resolve(aiDir, 'grade-manifest.json'), JSON.stringify({ model: MODEL, label: 'AI-generated · illustrative', file: 'ai/grade-levelling.mp4', reference: 'ai/seeds/grade-reference.png', status: ledger.requests[0]?.status ?? 'not-submitted', referenceSha256: ledger.requests[0]?.referenceSha256, prompt, cost: summary(), pricingSource: initial.pricingSource }, null, 2) + '\n');
}
if (switches.includes('--status')) { console.log(JSON.stringify(summary(), null, 2)); process.exit(0); }
if (!switches.includes('--generate') && !switches.includes('--preflight')) { console.log(JSON.stringify({ model: MODEL, prompt, ...summary(), usage: 'Pass --generate --reference <photo.png>. Reruns resume the same one-request ledger.' }, null, 2)); process.exit(0); }
const env = parseEnv(readFileSync(resolve(studio, '.env'), 'utf8'));
const key = env.GEMINI_API_KEY;
if (!key) throw new Error('GEMINI_API_KEY missing; value not displayed.');
const redact = (value) => String(value).split(key).join('[REDACTED]').replace(/AIza[A-Za-z0-9_-]+/g, '[REDACTED]').replace(/https?:\/\/\S+/g, '[URL]').slice(0, 500);
async function api(path, body) {
  const response = await fetch(`${BASE}/${path}`, { method: body ? 'POST' : 'GET', redirect: 'error', headers: { 'x-goog-api-key': key, 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(120000) });
  const result = await response.json();
  if (!response.ok) { const error = new Error(`Gemini HTTP ${response.status}: ${redact(result.error?.message)}`); error.httpStatus = response.status; throw error; }
  return result;
}
async function download(uri) {
  for (let count = 0; count < 6; count++) {
    const url = new URL(uri);
    const apiHost = url.hostname === 'generativelanguage.googleapis.com';
    if (url.protocol !== 'https:' || !(apiHost || url.hostname.endsWith('.googleapis.com') || url.hostname.endsWith('.googleusercontent.com'))) throw new Error('Unexpected download host.');
    const response = await fetch(uri, { headers: apiHost ? { 'x-goog-api-key': key } : {}, redirect: 'manual', signal: AbortSignal.timeout(120000) });
    if ([301, 302, 303, 307, 308].includes(response.status)) { uri = new URL(response.headers.get('location'), uri).href; continue; }
    if (!response.ok) throw new Error(`Download HTTP ${response.status}; generation will not be resubmitted.`);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length < 1000 || bytes.subarray(4, 8).toString() !== 'ftyp') throw new Error('Downloaded data is not an MP4.');
    writeFileSync(output + '.tmp', bytes); renameSync(output + '.tmp', output); return;
  }
  throw new Error('Too many download redirects.');
}
let lock;
try {
  const model = await api(`models/${MODEL}`);
  if (!model.name?.endsWith(MODEL)) throw new Error('Unexpected model preflight response.');
  console.log(`Model preflight passed: ${MODEL}.`);
  if (switches.includes('--preflight')) process.exit(0);
  lock = openSync(lockPath, 'wx'); writeFileSync(lock, String(process.pid));
  ledger = existsSync(ledgerPath) ? JSON.parse(readFileSync(ledgerPath, 'utf8')) : initial; validate();
  let record = ledger.requests[0];
  if (record?.downloaded && existsSync(output)) { console.log('Grading clip already saved; no new generation.'); }
  else {
    if (!record) {
      if (referenceInput) copyFileSync(resolve(referenceInput), reference);
      if (!existsSync(reference)) throw new Error('Supply the user reference photo with --reference.');
      const image = readFileSync(reference);
      record = { status: 'reserved', requestedAt: new Date().toISOString(), referenceSha256: createHash('sha256').update(image).digest('hex'), prompt, generated: false, downloaded: false };
      ledger.requests.push(record); save();
      try {
        const operation = await api(`models/${MODEL}:predictLongRunning`, { instances: [{ prompt, image: { bytesBase64Encoded: image.toString('base64'), mimeType: 'image/png' } }], parameters: { aspectRatio: '9:16', durationSeconds: SECONDS, resolution: '1080p', sampleCount: 1, personGeneration: 'allow_adult' } });
        if (!operation.name) throw new Error('No operation returned; ambiguous request will not be repeated.');
        record.operationName = operation.name; record.status = 'pending'; save();
        console.log('Submitted grading clip (1/1). Maximum estimated generation cost: US$3.20.');
      } catch (error) { record.status = error.httpStatus ? 'rejected' : 'unknown'; record.error = redact(error.message); save(); throw error; }
    }
    if (!record.operationName) throw new Error('Existing request has no recoverable operation; one-request cap prevents a new submission.');
    const deadline = Date.now() + 20 * 60 * 1000;
    let operation;
    while (true) {
      operation = await api(record.operationName);
      if (operation.done) break;
      if (Date.now() > deadline) throw new Error('Polling deadline reached. Rerun to resume the existing operation.');
      console.log('Grading clip: waiting for Veo…'); await new Promise((done) => setTimeout(done, 10000));
    }
    if (operation.error) { record.status = 'failed'; record.error = redact(operation.error.message); save(); throw new Error(record.error); }
    const response = operation.response?.generateVideoResponse;
    const video = response?.generatedSamples?.[0]?.video;
    if (!video?.uri) { record.status = 'filtered'; record.error = redact((response?.raiMediaFilteredReasons || ['No generated video']).join('; ')); save(); throw new Error(record.error); }
    record.generated = true; record.status = 'generated'; save();
    await download(video.uri);
    record.downloaded = true; record.status = 'downloaded'; record.completedAt = new Date().toISOString(); save();
    console.log('Saved public/ai/grade-levelling.mp4.');
  }
  console.log(JSON.stringify(summary(), null, 2));
} catch (error) { console.error(redact(error.message)); process.exitCode = 1; }
finally { if (lock !== undefined) { closeSync(lock); unlinkSync(lockPath); } }
