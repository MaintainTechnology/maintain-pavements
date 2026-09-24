/** Node-only Veo runner. Never import this file from src/ or the Remotion bundle. */
import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync, unlinkSync, openSync, closeSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseEnv } from 'node:util';
import { execFileSync } from 'node:child_process';

const studio = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const aiDir = resolve(studio, 'public/ai');
const stateDir = resolve(studio, '.veo');
const ledgerPath = resolve(stateDir, 'superbase-test.json');
const MODEL = 'veo-3.1-fast-generate-preview';
const CAP = 4;
const SECONDS = 8;
const RATE = 0.12;
const BASE = 'https://generativelanguage.googleapis.com/v1beta';
const PRICING = 'https://ai.google.dev/gemini-api/docs/pricing';
const COMMON = 'Natural documentary industrial site atmosphere. One continuous restrained shot, realistic texture and light, no dramatic transformation, no finished-surface claim, no new signage or captions, no speech or music. Preserve machinery geometry. This will be visibly labelled AI-generated illustrative footage in the edit.';
const shots = [
  { id: 'before-yard', prompt: 'Portrait 9:16 documentary establishing shot of a potholed, muddy gravel industrial yard after rain. Uneven aggregate, shallow puddles and wheel ruts, a plain corrugated industrial shed in the distance. No people, no branding, no identifiable customer. Slow forward camera drift, overcast Australian daylight, understated and realistic. No repairs or before-after transformation. Quiet yard ambience. ' + COMMON },
  { id: 'prepare-atmosphere', source: 'V01', second: 2, prompt: 'Animate this initial reference frame as a restrained portrait industrial atmosphere shot. Maintain the shed, track loader and rough base exactly as shown. Very slight handheld camera drift, subtle engine vibration and natural light. Do not show a completed job or invent a construction stage. ' + COMMON },
  { id: 'dose-atmosphere', source: 'V02A', second: 20, prompt: 'Animate this initial reference frame as a restrained portrait industrial atmosphere shot. Preserve the water cart, hose and yard texture. Preserve the framing and the plain dark upper and lower margins if present. Only subtle camera drift and a little natural water movement. Do not imply a coating is the completed treatment and do not transform the yard. ' + COMMON },
  { id: 'roll-atmosphere', source: 'V03A', second: 7, prompt: 'Animate this initial reference frame as a restrained portrait atmosphere shot of the roller and canopy in low sunlight. Preserve the roller, ground texture and shed geometry. Minimal camera drift and engine vibration, gentle dust in the light. No change from unfinished to finished ground, no trucks trafficking a claimed finished surface. ' + COMMON },
];

const flags = new Set(process.argv.slice(2));
if ([...flags].some((flag) => !['--generate', '--extract-only', '--status', '--preflight'].includes(flag))) {
  throw new Error('Usage: node scripts/generate-veo.mjs [--generate|--extract-only|--status|--preflight]');
}
mkdirSync(aiDir, { recursive: true });
mkdirSync(stateDir, { recursive: true });
const initial = { version: 1, job: 'superbase-test', model: MODEL, maxGenerationRequests: CAP, requestedSecondsPerClip: SECONDS, resolution: '1080p', aspectRatio: '9:16', usdPerSecond: RATE, pricingSource: PRICING, pricingCheckedOn: '2026-09-24', billedCostUSD: null, billingNote: 'Estimated from published output-second pricing; actual invoice has not been read.', requests: [] };
let ledger = existsSync(ledgerPath) ? JSON.parse(readFileSync(ledgerPath, 'utf8')) : initial;
if (ledger.model !== MODEL || ledger.maxGenerationRequests !== CAP || !Array.isArray(ledger.requests) || ledger.requests.length > CAP) throw new Error('Unexpected ledger. Preserve it and review before any paid request.');
function totals() {
  return { generationRequests: ledger.requests.length, completedClips: ledger.requests.filter((r) => r.generated).length, estimatedGeneratedCostUSD: Number((ledger.requests.filter((r) => r.generated).length * SECONDS * RATE).toFixed(2)), maximumAttemptedCostUSD: Number((ledger.requests.length * SECONDS * RATE).toFixed(2)), maximumPlanCostUSD: Number((CAP * SECONDS * RATE).toFixed(2)), billedCostUSD: null };
}
function save() {
  ledger.updatedAt = new Date().toISOString();
  ledger.cost = totals();
  writeFileSync(ledgerPath + '.tmp', JSON.stringify(ledger, null, 2) + '\n');
  renameSync(ledgerPath + '.tmp', ledgerPath);
  // Only publish sanitised attribution, never API operation responses or URLs.
  writeFileSync(resolve(aiDir, 'manifest.json'), JSON.stringify({ model: MODEL, label: 'AI-generated · illustrative', cost: totals(), pricingSource: PRICING, clips: ledger.requests.map(({ id, status, generated, downloaded, source, second, prompt }) => ({ id, file: `${id}.mp4`, status, generated, downloaded, source, second, prompt })) }, null, 2) + '\n');
}
function extract() {
  mkdirSync(resolve(aiDir, 'seeds'), { recursive: true });
  const ffmpeg = process.env.FFMPEG_PATH || 'ffmpeg';
  const sources = {
    V01: 'videos/01-prepare/WhatsApp Video 2026-08-16 at 18.41.33.mp4',
    V02A: 'videos/02-dose-and-mix/WhatsApp Video 2026-08-14 at 11.39.44.mp4',
    V03A: 'videos/03-roll-and-compact/WhatsApp Video 2026-08-22 at 13.10.35.mp4',
  };
  for (const shot of shots.filter((s) => s.source)) {
    const source = resolve(studio, '..', sources[shot.source]);
    const seed = resolve(aiDir, `seeds/${shot.source}-${shot.second}s.png`);
    if (!existsSync(source)) throw new Error(`Missing original source for ${shot.source}.`);
    // FFmpeg autorotates the original before fit/pad. Landscape sources retain their full view.
    execFileSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-ss', String(shot.second), '-i', source, '-frames:v', '1', '-vf', 'scale=1080:1920:force_original_aspect_ratio=decrease:force_divisible_by=2:flags=lanczos,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=0x25282A,setsar=1', '-update', '1', seed], { stdio: 'pipe', windowsHide: true });
    console.log(`Extracted ${shot.source} at ${shot.second.toFixed(1)}s.`);
  }
}
if (flags.has('--status')) { console.log(JSON.stringify({ ...totals(), requests: ledger.requests.map(({ id, status }) => ({ id, status })) }, null, 2)); process.exit(0); }
if (!flags.has('--generate') && !flags.has('--extract-only') && !flags.has('--preflight')) {
  console.log(JSON.stringify({ model: MODEL, cap: CAP, seconds: SECONDS, resolution: '1080p', aspectRatio: '9:16', estimatedMaximumUSD: CAP * SECONDS * RATE, pricingSource: PRICING, shots, usage: 'Pass --generate to submit/resume this fixed four-shot plan. Failed or uncertain requests consume their slot; no replacement generations.' }, null, 2));
  process.exit(0);
}
if (flags.has('--extract-only')) { extract(); process.exit(0); }
const envPath = resolve(studio, '.env');
const localEnv = existsSync(envPath) ? parseEnv(readFileSync(envPath, 'utf8')) : {};
const key = localEnv.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
if (!key) throw new Error('GEMINI_API_KEY missing in video-studio/.env. Never use a REMOTION_ variable for this key.');
const clean = (value) => String(value).split(key).join('[REDACTED]').replace(/AIza[A-Za-z0-9_-]+/g, '[REDACTED]').replace(/https?:\/\/\S+/g, '[URL]').slice(0, 500);
async function api(path, body) {
  const response = await fetch(`${BASE}/${path}`, { method: body ? 'POST' : 'GET', redirect: 'error', headers: { 'x-goog-api-key': key, 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(120000) });
  const data = await response.json();
  if (!response.ok) { const error = new Error(`HTTP ${response.status}: ${clean(data.error?.message || 'Gemini API request failed')}`); error.httpStatus = response.status; throw error; }
  return data;
}
async function download(url, destination) {
  for (let redirects = 0; redirects < 6; redirects++) {
    const parsed = new URL(url);
    const googleApi = parsed.hostname === 'generativelanguage.googleapis.com';
    const allowed = googleApi || parsed.hostname.endsWith('.googleapis.com') || parsed.hostname.endsWith('.googleusercontent.com');
    if (parsed.protocol !== 'https:' || !allowed) throw new Error('Unexpected video download host; refused to forward credentials.');
    const response = await fetch(url, { headers: googleApi ? { 'x-goog-api-key': key } : {}, redirect: 'manual', signal: AbortSignal.timeout(120000) });
    if ([301, 302, 303, 307, 308].includes(response.status)) { url = new URL(response.headers.get('location'), url).href; continue; }
    if (!response.ok) throw new Error(`Video download HTTP ${response.status}; generation will not be resubmitted.`);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length < 1000 || bytes.subarray(4, 8).toString() !== 'ftyp') throw new Error('Download did not contain an MP4.');
    writeFileSync(destination + '.tmp', bytes); renameSync(destination + '.tmp', destination); return;
  }
  throw new Error('Too many download redirects.');
}
let lock;
try {
  // No model generation is performed by this authenticated read-only preflight.
  const model = await api(`models/${MODEL}`);
  if (!model.name?.endsWith(MODEL)) throw new Error('Unexpected model response.');
  console.log(`Veo model/key preflight passed: ${MODEL}.`);
  if (flags.has('--preflight')) process.exit(0);
  lock = openSync(resolve(stateDir, 'generation.lock'), 'wx');
  writeFileSync(lock, String(process.pid));
  // Reload after taking the lock to guard against a concurrent runner.
  ledger = existsSync(ledgerPath) ? JSON.parse(readFileSync(ledgerPath, 'utf8')) : initial;
  extract();
  save();
  for (const shot of shots) {
    let record = ledger.requests.find((r) => r.id === shot.id);
    if (record?.downloaded && existsSync(resolve(aiDir, `${shot.id}.mp4`))) { console.log(`${shot.id}: already saved; no generation request.`); continue; }
    if (record && !record.operationName) { console.log(`${shot.id}: ${record.status}; reserved slot will not be retried.`); continue; }
    if (!record) {
      if (ledger.requests.length >= CAP) throw new Error('Four-generation cap reached.');
      record = { ...shot, status: 'reserved', requestedAt: new Date().toISOString(), generated: false, downloaded: false };
      ledger.requests.push(record); save(); // Reserve durably BEFORE the POST, including ambiguous failures.
      const instance = { prompt: shot.prompt };
      if (shot.source) instance.image = { bytesBase64Encoded: readFileSync(resolve(aiDir, `seeds/${shot.source}-${shot.second}s.png`)).toString('base64'), mimeType: 'image/png' };
      try {
        const operation = await api(`models/${MODEL}:predictLongRunning`, { instances: [instance], parameters: { aspectRatio: '9:16', durationSeconds: SECONDS, resolution: '1080p', sampleCount: 1, personGeneration: shot.source ? 'allow_adult' : 'allow_all' } });
        if (!operation.name) throw new Error('No operation name returned; request is ambiguous and will not be repeated.');
        record.operationName = operation.name; record.status = 'pending'; save();
        console.log(`${shot.id}: submitted (${ledger.requests.length}/${CAP}); maximum request estimate US$${(SECONDS * RATE).toFixed(2)}.`);
      } catch (error) {
        record.status = error.httpStatus ? 'rejected' : 'unknown'; record.error = clean(error.message); save();
        // Stop on auth/quota/config errors rather than burn the other three slots.
        throw error;
      }
    }
    const deadline = Date.now() + 20 * 60 * 1000;
    let operation;
    do {
      operation = await api(record.operationName);
      if (operation.done) break;
      if (Date.now() > deadline) throw new Error('Polling deadline reached. Rerun to resume the recorded operation, without a new generation.');
      console.log(`${shot.id}: waiting for Veo…`);
      await new Promise((done) => setTimeout(done, 10000));
    } while (true);
    if (operation.error) { record.status = 'failed'; record.error = clean(operation.error.message); save(); console.log(`${shot.id}: failed: ${record.error}`); continue; }
    const response = operation.response?.generateVideoResponse;
    const video = response?.generatedSamples?.[0]?.video;
    if (!video?.uri) { record.status = 'filtered'; record.error = clean((response?.raiMediaFilteredReasons || ['No video returned']).join('; ')); save(); console.log(`${shot.id}: no video returned (${record.error}).`); continue; }
    record.generated = true; record.status = 'generated'; save();
    await download(video.uri, resolve(aiDir, `${shot.id}.mp4`));
    record.downloaded = true; record.status = 'downloaded'; record.completedAt = new Date().toISOString(); save();
    console.log(`${shot.id}: saved to public/ai/${shot.id}.mp4.`);
  }
  console.log(JSON.stringify(totals(), null, 2));
  if (ledger.requests.filter((r) => r.downloaded).length !== CAP) process.exitCode = 1;
} catch (error) {
  console.error(clean(error.message));
  console.error('Existing ledger preserved. Paid creation requests are never automatically retried.');
  process.exitCode = 1;
} finally {
  if (lock !== undefined) { closeSync(lock); unlinkSync(resolve(stateDir, 'generation.lock')); }
}
