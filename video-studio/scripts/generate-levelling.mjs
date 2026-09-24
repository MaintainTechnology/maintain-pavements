/** Grading illustration with one bounded QA correction. Node only; never import in src/. */
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
const takeOutput = (take) => resolve(aiDir, `grade-levelling-take${take}.mp4`);
const MODEL = 'veo-3.1-generate-preview';
const SECONDS = 8;
const RATE = 0.40;
const BASE = 'https://generativelanguage.googleapis.com/v1beta';
const prompt = 'Create one continuous eight-second 9:16 portrait documentary shot using this supplied photograph as the initial frame. The subject is the yellow compact tracked loader with its wide rectangular open steel levelling frame, under this same steel industrial canopy. Preserve the loader, tracks, front attachment, canopy columns, rough grey aggregate, sunlit bushland and site geometry. Start with the attachment raised as in the reference. During the first two seconds the hydraulic arms naturally lower this existing steel levelling attachment until its bottom edge rests flat on the loose aggregate. Then the loader moves slowly backwards for a short straight pass, dragging this same attachment across the aggregate and leaving a modest visibly flatter strip of granular material. The attachment stays physically connected to the hydraulic arms throughout, tracks roll naturally and contact the ground. Keep machine size and structure consistent; no morphing or floating. A steady operator-eye-level camera watches the movement, with only subtle handheld motion. Keep the adult worker well clear of the machine path. Ground remains aggregate, not concrete, asphalt, wet coating or magically completed pavement. No new vehicles, no dramatic dust, no camera cuts, no text overlays, no new logos, no narration, no music; only restrained machinery ambience. This is an illustrative explanation of the levelling action, not evidence of a completed or tested SuperBase result. The editor will add a clear AI-generated illustrative label.';
const correctivePrompt = 'One continuous eight-second documentary shot from a locked, steady side-view camera. Use this photograph: the same yellow tracked loader, same open rectangular steel grading frame, same canopy and grey aggregate. The loader faces RIGHT throughout. Immediately lower its existing open steel frame flat onto the thin aggregate surface. Then reverse the loader slowly LEFT for the remainder of the shot, dragging that SAME frame along the existing material to leave a modest flatter strip. Show the scraping contact and flatter strip clearly. The frame remains open steel bars of exactly the same shape, physically attached to the loader. Preserve the loader and track geometry. No forward driving. No bucket. No new attachment. No added material, piles or mounds. No camera movement or cuts. Keep the worker outside the machine path. Natural restrained machinery ambience only; no speech, music, text or added logos. This is an AI illustration of ground levelling, not evidence of a real completed result.';
const args = process.argv.slice(2);
const refIndex = args.indexOf('--reference');
const referenceInput = refIndex >= 0 ? args[refIndex + 1] : undefined;
if (refIndex >= 0 && (!referenceInput || referenceInput.startsWith('--'))) throw new Error('--reference requires the source image path.');
const switches = refIndex >= 0 ? args.filter((_, index) => index !== refIndex && index !== refIndex + 1) : args;
if (switches.some((arg) => !['--generate', '--status', '--preflight', '--corrective', '--accept-corrective', '--reject-corrective', '--approve-setup'].includes(arg))) throw new Error('Use --generate, --status, --preflight, --corrective, --accept-corrective, --reject-corrective, --approve-setup, and optional --reference <photo>.');
const corrective = switches.includes('--corrective');
if (corrective && !switches.includes('--generate')) throw new Error('--corrective requires --generate. It permits exactly one second take.');
if (switches.some((arg) => ['--accept-corrective', '--reject-corrective'].includes(arg)) && switches.some((arg) => ['--generate', '--corrective', '--preflight'].includes(arg))) throw new Error('Review the corrective take separately from generation.');
if (switches.includes('--accept-corrective') && switches.includes('--reject-corrective')) throw new Error('Choose one review outcome.');
if (switches.includes('--approve-setup') && switches.some((arg) => ['--generate', '--corrective', '--preflight', '--accept-corrective', '--reject-corrective'].includes(arg))) throw new Error('Approve the bounded setup usage separately.');
mkdirSync(stateDir, { recursive: true });
mkdirSync(dirname(reference), { recursive: true });
const initial = { version: 2, job: 'superbase-complete-levelling', model: MODEL, cap: 2, seconds: SECONDS, aspectRatio: '9:16', resolution: '1080p', usdPerSecond: RATE, pricingSource: 'https://ai.google.dev/gemini-api/docs/pricing', pricingCheckedOn: '2026-09-24', billedCostUSD: null, requests: [] };
let ledger = existsSync(ledgerPath) ? JSON.parse(readFileSync(ledgerPath, 'utf8')) : initial;
const validate = () => { if (ledger.model !== MODEL || ![1, 2].includes(ledger.cap) || !Array.isArray(ledger.requests) || ledger.requests.length > ledger.cap || ledger.requests.length > 2 || ledger.seconds !== SECONDS || ledger.usdPerSecond !== RATE) throw new Error('Unexpected grading ledger. Preserve it; generation refused.'); };
validate();
const summary = () => ({ generationRequests: ledger.requests.length, completedClips: ledger.requests.filter((r) => r.downloaded).length, estimatedGeneratedCostUSD: ledger.requests.filter((r) => r.generated).length * SECONDS * RATE, maximumPlanCostUSD: 2 * SECONDS * RATE, billedCostUSD: null });
function save() {
  ledger.version = 2; ledger.cap = 2;
  ledger.updatedAt = new Date().toISOString(); ledger.cost = summary();
  writeFileSync(ledgerPath + '.tmp', JSON.stringify(ledger, null, 2) + '\n'); renameSync(ledgerPath + '.tmp', ledgerPath);
  const selectedTake = ledger.selectedTake ?? 1;
  const selected = ledger.requests[selectedTake - 1];
  writeFileSync(resolve(aiDir, 'grade-manifest.json'), JSON.stringify({ model: MODEL, label: 'AI-generated · illustrative', file: 'ai/grade-levelling.mp4', reference: 'ai/seeds/grade-reference.png', selectedTake, selectedUsage: ledger.selectedUsage ?? null, fullTakeAccepted: selected?.qa?.status === 'accepted-after-visual-review', status: selected?.status ?? 'not-submitted', referenceSha256: selected?.referenceSha256, prompt: selected?.prompt ?? prompt, takes: ledger.requests.map((record, index) => ({ take: index + 1, file: `ai/grade-levelling-take${index + 1}.mp4`, status: record.status, prompt: record.prompt, referenceSha256: record.referenceSha256, outputSha256: record.outputSha256, qa: record.qa, approvedUsage: record.approvedUsage })), cost: summary(), pricingSource: initial.pricingSource }, null, 2) + '\n');
}
if (switches.includes('--status')) { console.log(JSON.stringify(summary(), null, 2)); process.exit(0); }
if (switches.includes('--approve-setup')) {
  let reviewLock;
  try {
    reviewLock = openSync(lockPath, 'wx'); writeFileSync(reviewLock, String(process.pid));
    ledger = JSON.parse(readFileSync(ledgerPath, 'utf8')); validate();
    const first = ledger.requests[0];
    if (!first?.downloaded || !existsSync(takeOutput(1))) throw new Error('Preserved take1 is missing.');
    const bytes = readFileSync(takeOutput(1));
    if (createHash('sha256').update(bytes).digest('hex') !== first.outputSha256) throw new Error('Preserved take1 hash changed.');
    const usage = {
      take: 1, sourceStartSeconds: 0, durationSeconds: 3, fullTakeAccepted: false,
      purpose: 'AI-generated illustrative loader setup only; followed by a designed grading schematic.',
      review: 'Frames at 0, 1, 2 and 2.917 seconds inspected. Loader, canopy and open attachment remain readable, without invented gravel mound or finished pad. Minor track and attachment geometry drift remains.',
      limitations: 'Neither complete take is accepted. Do not show take1 after 3 seconds. The approved excerpt does not demonstrate a levelling pass or prove site work, levels, cure or performance.',
      evidence: 'out/qa-complete/grade-take1-setup-review.jpg', reviewedAt: new Date().toISOString(),
    };
    first.approvedUsage = usage; ledger.selectedTake = 1; ledger.selectedUsage = usage;
    copyFileSync(takeOutput(1), output); save();
    console.log('Approved take1 0–3s for labelled setup-only use. Both full-take rejections preserved. No generation requested.');
  } finally { if (reviewLock !== undefined) { closeSync(reviewLock); unlinkSync(lockPath); } }
  process.exit(0);
}
if (switches.includes('--accept-corrective') || switches.includes('--reject-corrective')) {
  let acceptanceLock;
  try {
    acceptanceLock = openSync(lockPath, 'wx'); writeFileSync(acceptanceLock, String(process.pid));
    ledger = JSON.parse(readFileSync(ledgerPath, 'utf8')); validate();
    const second = ledger.requests[1];
    if (!second?.downloaded || !existsSync(takeOutput(2))) throw new Error('No downloaded corrective take to accept.');
    const bytes = readFileSync(takeOutput(2));
    if (createHash('sha256').update(bytes).digest('hex') !== second.outputSha256) throw new Error('Corrective file hash changed.');
    if (switches.includes('--reject-corrective')) {
      second.qa = { status: 'rejected-after-visual-review', reviewedAt: new Date().toISOString(), reason: 'Direction improved to reverse left, but the open frame changes into bucket-like plates and the surface becomes an implausibly sharply edged raised rectangular pad. Not accepted as a levelling demonstration.', evidence: ['out/qa-complete/grade-corrective-motion.jpg', 'out/qa-complete/grade-corrective-close4.jpg', 'out/qa-complete/grade-corrective-close7.jpg'] };
      save(); console.log('Recorded corrective rejection. Both takes preserved; selected asset unchanged. No generation requested.');
    } else {
      copyFileSync(takeOutput(2), output); ledger.selectedTake = 2;
      second.qa = { status: 'accepted-after-visual-review', acceptedAt: new Date().toISOString(), caveat: 'AI-generated illustrative process only; not documentary proof.' };
      save(); console.log('Accepted reviewed corrective take as public/ai/grade-levelling.mp4. No generation requested.');
    }
  } finally { if (acceptanceLock !== undefined) { closeSync(acceptanceLock); unlinkSync(lockPath); } }
  process.exit(0);
}
if (!switches.includes('--generate') && !switches.includes('--preflight')) { console.log(JSON.stringify({ model: MODEL, prompt, ...summary(), usage: 'Pass --generate --reference <photo.png> for the initial take. Only explicit --generate --corrective may reserve the second and final take; ordinary reruns never add one. Review take2 before --accept-corrective.' }, null, 2)); process.exit(0); }
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
async function download(uri, target) {
  for (let count = 0; count < 6; count++) {
    const url = new URL(uri);
    const apiHost = url.hostname === 'generativelanguage.googleapis.com';
    if (url.protocol !== 'https:' || !(apiHost || url.hostname.endsWith('.googleapis.com') || url.hostname.endsWith('.googleusercontent.com'))) throw new Error('Unexpected download host.');
    const response = await fetch(uri, { headers: apiHost ? { 'x-goog-api-key': key } : {}, redirect: 'manual', signal: AbortSignal.timeout(120000) });
    if ([301, 302, 303, 307, 308].includes(response.status)) { uri = new URL(response.headers.get('location'), uri).href; continue; }
    if (!response.ok) throw new Error(`Download HTTP ${response.status}; generation will not be resubmitted.`);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length < 1000 || bytes.subarray(4, 8).toString() !== 'ftyp') throw new Error('Downloaded data is not an MP4.');
    writeFileSync(target + '.tmp', bytes); renameSync(target + '.tmp', target); return createHash('sha256').update(bytes).digest('hex');
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
  if (ledger.requests[0]?.downloaded && !existsSync(takeOutput(1))) {
    if (!existsSync(output)) throw new Error('Original downloaded grading clip is missing; cannot preserve take1.');
    copyFileSync(output, takeOutput(1));
    ledger.requests[0].outputSha256 = createHash('sha256').update(readFileSync(takeOutput(1))).digest('hex');
  }
  if (corrective) {
    if (!ledger.requests[0]?.downloaded || !existsSync(takeOutput(1))) throw new Error('Corrective take requires preserved, completed take1.');
    ledger.requests[0].qa = { status: 'rejected-for-levelling-demonstration', reason: 'Attachment developed bucket-like plates; machine drove forward into gravel instead of demonstrating a reverse levelling pass.' };
  }
  const take = corrective ? 2 : Math.max(1, ledger.requests.length);
  let record = ledger.requests[take - 1];
  const target = takeOutput(take);
  if (record?.downloaded && existsSync(target)) { save(); console.log(`Grading take${take} already saved; no new generation.`); }
  else {
    if (!record) {
      if (ledger.requests.length >= 2 || (take === 2 && !corrective)) throw new Error('Two-request cap or missing explicit --corrective flag prevents submission.');
      if (referenceInput && take === 1) copyFileSync(resolve(referenceInput), reference);
      if (!existsSync(reference)) throw new Error('Supply the user reference photo with --reference.');
      const image = readFileSync(reference);
      const referenceSha256 = createHash('sha256').update(image).digest('hex');
      if (take === 2 && referenceSha256 !== ledger.requests[0].referenceSha256) throw new Error('Corrective reference differs from take1. Preserve the supplied photo.');
      const selectedPrompt = take === 2 ? correctivePrompt : prompt;
      record = { take, status: 'reserved', requestedAt: new Date().toISOString(), referenceSha256, prompt: selectedPrompt, generated: false, downloaded: false };
      ledger.requests.push(record); save();
      try {
        const operation = await api(`models/${MODEL}:predictLongRunning`, { instances: [{ prompt: selectedPrompt, image: { bytesBase64Encoded: image.toString('base64'), mimeType: 'image/png' } }], parameters: { aspectRatio: '9:16', durationSeconds: SECONDS, resolution: '1080p', sampleCount: 1, personGeneration: 'allow_adult' } });
        if (!operation.name) throw new Error('No operation returned; ambiguous request will not be repeated.');
        record.operationName = operation.name; record.status = 'pending'; save();
        console.log(`Submitted grading take${take} (${ledger.requests.length}/2). Maximum total estimated generation cost: US$6.40.`);
      } catch (error) { record.status = error.httpStatus ? 'rejected' : 'unknown'; record.error = redact(error.message); save(); throw error; }
    }
    if (!record.operationName) throw new Error('Existing request has no recoverable operation; reserved requests are never resubmitted.');
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
    record.outputSha256 = await download(video.uri, target);
    record.downloaded = true; record.status = 'downloaded'; record.completedAt = new Date().toISOString(); save();
    if (take === 1) copyFileSync(target, output);
    console.log(`Saved public/ai/grade-levelling-take${take}.mp4.${take === 2 ? ' Awaiting visual review before selection.' : ''}`);
  }
  console.log(JSON.stringify(summary(), null, 2));
} catch (error) { console.error(redact(error.message)); process.exitCode = 1; }
finally { if (lock !== undefined) { closeSync(lock); unlinkSync(lockPath); } }
