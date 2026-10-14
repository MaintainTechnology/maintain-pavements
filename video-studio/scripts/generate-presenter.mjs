/** Bounded, resumable presenter generation and blind speech QA. Node only. */
import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync, openSync, closeSync, unlinkSync, copyFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createGeminiClient, sha256 } from './presenter/api.mjs';

const studio = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const planBytes = readFileSync(resolve(studio, 'scripts/presenter/plan.json'));
const plan = JSON.parse(planBytes); const planHash = sha256(planBytes);
const state = resolve(studio, '.veo/presenter-reel.json'); const lockPath = `${state}.lock`;
const dir = resolve(studio, 'public/ai/presenter'); const qaDir = resolve(dir, 'qa');
mkdirSync(qaDir, { recursive: true }); mkdirSync(dirname(state), { recursive: true });
const seed = resolve(studio, plan.seed); const seedHash = sha256(readFileSync(seed));
const args = process.argv.slice(2); const switches = new Map();
for (let i = 0; i < args.length; i++) { const arg = args[i]; if (!['--generate', '--status', '--preflight', '--through', '--review', '--approve', '--note', '--retry-transcription', '--transcript-file', '--correct-aspect-rejection', '--cloud-review', '--finalize-through'].includes(arg)) throw new Error(`Unknown option ${arg}`); switches.set(arg, ['--through', '--review', '--approve', '--note', '--transcript-file', '--finalize-through'].includes(arg) ? args[++i] : true); }
const takeFile = (index) => resolve(dir, `cumulative-${String(index + 1).padStart(2, '0')}-${plan.segments[index].id}.mp4`);
let ledger = existsSync(state) ? JSON.parse(readFileSync(state, 'utf8')) : { version: 1, jobId: plan.jobId, model: plan.model, planSha256: planHash, seedSha256: seedHash, maxGenerationRequests: 8, plannedRequests: 7, pricingSource: 'https://ai.google.dev/gemini-api/docs/pricing', pricingCheckedOn: '2026-09-25', billingActualUSD: null, requests: [], transcriptions: [] };
function validate() {
  if (ledger.jobId !== plan.jobId || ledger.model !== plan.model || ledger.planSha256 !== planHash || ledger.seedSha256 !== seedHash || ledger.maxGenerationRequests !== 8 || ledger.requests.length > 8 || plan.maximumGenerationRequests !== 8 || plan.plannedRequests !== 7 || plan.resolution !== '720p' || plan.aspectRatio !== '9:16') throw new Error('Ledger or plan changed. Preserve current state and review before further generation.');
}
validate();
const currentRecord = (index) => ledger.requests.findLast((r) => r.segmentIndex === index);
function cost() {
  const generated = ledger.requests.filter((r) => r.generated);
  return { reservedRequests: ledger.requests.length, generatedRequests: generated.length, plannedRequests: 7, reservedRequestCeiling: 8, backupRequestSlotsRemaining: ledger.requests.some((r) => r.correctedRequestIndex !== undefined) ? 0 : 1, knownNoOutputRequests: ledger.requests.filter((r) => ['rejected', 'failed', 'filtered'].includes(r.status) && !r.generated).length, estimatedEightSecondsPerGeneratedRequestUSD: +(generated.length * .8).toFixed(2), estimatedCumulativeGeneratedOutputUSD: +(generated.reduce((sum, r) => sum + (r.actualDurationSeconds ?? (8 + r.segmentIndex * 7)), 0) * .1).toFixed(2), fullPlanEightSecondsPerRequestEstimateUSD: 5.6, fullPlanCumulativeOutputEstimateUSD: 20.3, eightRequestEightSecondsEstimateUSD: 6.4, billingActualUSD: null, note: plan.budgetNote, analysisUsage: ledger.transcriptions.map(({ model, status, usageMetadata }) => ({ model, status, usageMetadata })) };
}
function save() {
  ledger.updatedAt = new Date().toISOString(); ledger.cost = cost(); writeFileSync(`${state}.tmp`, JSON.stringify(ledger, null, 2) + '\n'); renameSync(`${state}.tmp`, state);
  writeFileSync(resolve(dir, 'manifest.json'), JSON.stringify({ jobId: plan.jobId, model: plan.model, aiLabel: 'AI presenter', seed: 'ai/presenter/seeds/office-hardhat.png', planSha256: planHash, seedSha256: seedHash, selectedFile: ledger.finalSelectedFile, selectedSha256: ledger.finalSelectedSha256, finalEditorialSelection: ledger.finalEditorialSelection, cost: cost(), segments: ledger.requests.map(({ segmentIndex, status, prompt, outputSha256, actualDurationSeconds, qa, file }) => ({ id: plan.segments[segmentIndex].id, segmentIndex, status, prompt, outputSha256, actualDurationSeconds, qa, file })) }, null, 2) + '\n');
}
function run(cmd, cmdArgs) { return execFileSync(cmd, cmdArgs, { encoding: 'utf8', windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 16 * 1024 * 1024 }); }
function probe(file) { return JSON.parse(run('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', file])); }
function promptFor(index) {
  const segment = plan.segments[index];
  const visual = 'One continuous locked medium corporate interview shot, portrait 9:16. Preserve the same adult male presenter from the image, face, dark corporate suit and tie, correctly fitted white hard hat, softly lit modern corporate office, camera framing and lighting. Minimal natural head and hand motion, direct eye contact, clear synchronized lips. No scene cuts, camera movement, wardrobe changes, on-screen graphics, logos, subtitles, music or other speakers. Clean isolated studio-quality speech with very quiet neutral room tone. ';
  const pace = index === 0 ? 'Speak the quoted sentence exactly once, beginning around 0.2 seconds and pacing the sentence evenly so the final word is spoken around 7.5 seconds, with voice present during the final second. Do not append any words.' : 'Continue the same speaker and the same voice seamlessly from the supplied video. Preserve the previous speech ending naturally without repeating the earlier sentence. In the new continuation speak only the quoted next sentence exactly once. Pace it evenly across the new seven-second continuation, finishing near its end so speech remains present in its final second. Do not truncate any words or add other words.';
  return visual + plan.voiceDirection + ' ' + pace + ` The exact next spoken sentence is: "${segment.script}"`;
}
const words = (str) => str.toLowerCase().replace(/seventy[ -]five/g, '75').replace(/millimeters/g, 'millimetres').replace(/super base/g, 'superbase').replace(/hard stand/g, 'hardstand').replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean);
function comparison(expected, actual) {
  const a = words(expected), b = words(actual); const rows = Array.from({ length: a.length + 1 }, (_, i) => [i]); for (let j = 0; j <= b.length; j++) rows[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) rows[i][j] = Math.min(rows[i - 1][j] + 1, rows[i][j - 1] + 1, rows[i - 1][j - 1] + +(a[i - 1] !== b[j - 1]));
  return { expected, actual, wordEditDistance: rows[a.length][b.length], expectedWords: a.length, exactNormalizedMatch: rows[a.length][b.length] === 0 };
}
if (switches.has('--status') || !args.length) { console.log(JSON.stringify({ ...cost(), requests: ledger.requests.map(({ segmentIndex, status, qa }) => ({ id: plan.segments[segmentIndex].id, status, qa })) }, null, 2)); process.exit(0); }
let client; let lock;
try {
  lock = openSync(lockPath, 'wx'); writeFileSync(lock, String(process.pid));
  if (switches.has('--finalize-through')) {
    if (switches.size !== 1 || Number(switches.get('--finalize-through')) !== 6) throw new Error('This local editorial selection is explicitly bounded to --finalize-through6, with no API actions.');
    const index = 5; const record = currentRecord(index);
    if (!record?.downloaded || record.qa?.status !== 'accepted' || plan.segments.slice(0, 6).some((_, i) => currentRecord(i)?.qa?.status !== 'accepted')) throw new Error('All selected narrator segments require accepted QA.');
    const bytes = readFileSync(takeFile(index)); const sourceSha256 = sha256(bytes);
    if (sourceSha256 !== record.outputSha256) throw new Error('Accepted cumulative original changed.');
    const selection = { source: record.file, sourceSha256, rawOutput: 'ai/presenter/presenter.mp4', selectedSegmentCount: 6, narrationSeconds: 43, endCardSeconds: 17, totalSeconds: 60, reason: 'All five steps narrated; provider declined optional spoken contact segment; contact/trial shown on end card.' };
    copyFileSync(takeFile(index), resolve(dir, 'presenter.mp4'));
    if (sha256(readFileSync(resolve(dir, 'presenter.mp4'))) !== sourceSha256) throw new Error('Final raw copy hash differs.');
    ledger.finalEditorialSelection = selection; ledger.finalSelectedFile = selection.rawOutput; ledger.finalSelectedSha256 = sourceSha256;
    writeFileSync(resolve(dir, 'selection.json'), JSON.stringify(selection, null, 2) + '\n'); save();
    console.log('Selected six accepted narrator segments including all five process steps. Raw presenter.mp4 is byte-identical to cumulative06. No API request made.');
  }
  if (switches.has('--approve')) {
    const index = Number(switches.get('--approve')) - 1; const record = currentRecord(index);
    if (!record?.transcript || !switches.get('--note')) throw new Error('Approval requires a completed blind transcript and explicit review note.');
    record.speechComparison = comparison(plan.segments.slice(0, index + 1).map((s) => s.script).join(' '), record.transcript.fullTranscript);
    record.qa = { status: 'accepted', reviewedAt: new Date().toISOString(), note: switches.get('--note') };
    if (index === 6) { copyFileSync(takeFile(index), resolve(dir, 'presenter.mp4')); ledger.finalSelectedFile = 'ai/presenter/presenter.mp4'; ledger.finalSelectedSha256 = record.outputSha256; }
    save(); console.log(`Accepted reviewed presenter segment ${index + 1}.`);
  }
  if (switches.has('--generate') || switches.has('--preflight') || (switches.has('--review') && switches.has('--cloud-review'))) client = createGeminiClient(studio);
  if (switches.has('--preflight') || switches.has('--generate')) {
    const model = await client.api(`models/${plan.model}`); if (!model.name?.endsWith(plan.model)) throw new Error('Unexpected model preflight.'); console.log(`Preflight passed: ${plan.model}`);
  }
  if (switches.has('--generate')) {
    const through = Number(switches.get('--through') ?? 1); if (!Number.isInteger(through) || through < 1 || through > 7) throw new Error('--through must be 1–7.');
    for (let index = 0; index < through; index++) {
      let record = currentRecord(index); let correctedRequestIndex;
      if (record?.downloaded && existsSync(takeFile(index))) continue;
      if (index && currentRecord(index - 1)?.qa?.status !== 'accepted') throw new Error('Previous cumulative video requires speech and visual acceptance before extension.');
      if (record?.status === 'rejected' && switches.has('--correct-aspect-rejection')) {
        if (index !== 1 || !record.error?.includes('HTTP 400: Aspect ratio') || ledger.requests.some((r) => r.correctedRequestIndex !== undefined)) throw new Error('Only the single known first-extension aspect-ratio rejection may use this bounded correction.');
        correctedRequestIndex = ledger.requests.indexOf(record); record = undefined;
      }
      if (!record) {
        if (ledger.requests.length >= 8) throw new Error('Eight-request ceiling exhausted. Preserve all attempts; no further submission.');
        record = { segmentIndex: index, id: plan.segments[index].id, prompt: promptFor(index), status: 'reserved', reservedAt: new Date().toISOString(), generated: false, downloaded: false, file: `ai/presenter/${takeFile(index).split(/[\\/]/).pop()}` }; ledger.requests.push(record); save();
        if (correctedRequestIndex !== undefined) { record.correctedRequestIndex = correctedRequestIndex; record.correctionReason = 'Explicit9:16 aspectRatio supplied after definiteHTTP400 default16:9 mismatch. Only reserved backup slot consumed.'; save(); }
        let instance;
        if (index === 0) instance = { prompt: record.prompt, image: { bytesBase64Encoded: readFileSync(seed).toString('base64'), mimeType: 'image/png' } };
        else {
          const previous = currentRecord(index - 1); const bytes = readFileSync(takeFile(index - 1));
          if (sha256(bytes) !== previous.outputSha256) throw new Error('Previous cumulative original changed.');
          record.inputVideoSha256 = previous.outputSha256;
          // Google JS SDK videoToMldev maps uri directly; inlineData in the guide
          // differs from the maintained SDK wire format. Use the prior Veo URI.
          if (!previous.videoUri) throw new Error('Previous Veo output URI missing; preserve original and review before extension.');
          instance = { prompt: record.prompt, video: { uri: previous.videoUri } };
        }
        try {
          const op = await client.api(`models/${plan.model}:predictLongRunning`, { instances: [instance], parameters: index === 0 ? { aspectRatio: '9:16', durationSeconds: 8, resolution: '720p', sampleCount: 1, personGeneration: 'allow_adult' } : { sampleCount: 1, resolution: '720p', aspectRatio: '9:16' } });
          if (!op.name) throw new Error('No recoverable operation returned. Do not resubmit.'); record.operationName = op.name; record.status = 'pending'; save(); console.log(`Submitted presenter segment ${index + 1}/7.`);
        } catch (error) { record.status = error.httpStatus ? 'rejected' : 'unknown'; record.error = client.redact(error.message); save(); throw error; }
      }
      if (!record.operationName) throw new Error('Reserved request lacks recoverable operation. It will not be repeated.');
      const deadline = Date.now() + 25 * 60 * 1000; let operation;
      while (true) { operation = await client.api(record.operationName); if (operation.done) break; if (Date.now() >= deadline) throw new Error('Polling deadline reached; rerun resumes existing operation.'); console.log(`Presenter ${index + 1}: waiting for Veo…`); await new Promise((done) => setTimeout(done, 10000)); }
      if (operation.error) { record.status = 'failed'; record.error = client.redact(operation.error.message); save(); throw new Error(record.error); }
      const response = operation.response?.generateVideoResponse; const video = response?.generatedSamples?.[0]?.video;
      if (!video?.uri) { record.status = 'filtered'; record.error = client.redact((response?.raiMediaFilteredReasons || ['No generated sample']).join('; ')); save(); throw new Error(record.error); }
      record.generated = true; record.status = 'generated'; record.videoUri = video.uri; save();
      record.outputSha256 = await client.download(video.uri, takeFile(index)); record.downloaded = true; record.status = 'downloaded'; record.downloadedAt = new Date().toISOString();
      const info = probe(takeFile(index)); record.actualDurationSeconds = Number(info.format.duration); record.streams = info.streams.map(({ codec_type, codec_name, width, height, avg_frame_rate, duration }) => ({ codec_type, codec_name, width, height, avg_frame_rate, duration })); save();
      console.log(`Saved cumulative presenter ${index + 1}: ${record.actualDurationSeconds}s. Requires review before next extension.`);
    }
  }
  if (switches.has('--review')) {
    const index = Number(switches.get('--review')) - 1; if (!Number.isInteger(index) || index < 0 || index >= 7) throw new Error('--review must be 1–7.');
    const record = currentRecord(index); if (!record?.downloaded) throw new Error('No downloaded cumulative video.');
    const file = takeFile(index); const base = `${String(index + 1).padStart(2, '0')}-${plan.segments[index].id}`; const audio = resolve(qaDir, `${base}.wav`); const sheet = resolve(qaDir, `${base}.jpg`);
    run('ffmpeg', ['-v', 'error', '-y', '-i', file, '-vn', '-ac', '1', '-ar', '24000', '-c:a', 'pcm_s16le', audio]);
    run('ffmpeg', ['-v', 'error', '-y', '-i', file, '-vf', `fps=1,scale=180:320,tile=4x${Math.ceil(record.actualDurationSeconds / 4)}`, '-frames:v', '1', '-update', '1', sheet]);
    if (switches.has('--transcript-file')) {
      if (record.transcript) throw new Error('Existing accepted transcription is preserved; review explicitly before replacement.');
      const transcript = JSON.parse(readFileSync(resolve(studio, switches.get('--transcript-file')), 'utf8'));
      if (typeof transcript.fullTranscript !== 'string' || !Array.isArray(transcript.phrases) || !transcript.source || transcript.phrases.some((p) => typeof p.text !== 'string' || !Number.isFinite(p.startSeconds) || !Number.isFinite(p.endSeconds) || p.startSeconds < 0 || p.endSeconds <= p.startSeconds || p.endSeconds > record.actualDurationSeconds + .15)) throw new Error('Local transcript needs source, fullTranscript and valid phrases with startSeconds/endSeconds/text.');
      record.transcript = transcript;
      record.speechComparison = comparison(plan.segments.slice(0, index + 1).map((s) => s.script).join(' '), transcript.fullTranscript);
      record.qa = { status: 'pending-visual-and-speech-review' };
      ledger.transcriptions.push({ segmentIndex: index, model: transcript.quality?.recognizer ? `${transcript.quality.recognizer}/${transcript.quality.model}` : 'local-asr', source: transcript.source, status: 'imported-local-asr', importedAt: new Date().toISOString(), audioSha256: sha256(readFileSync(audio)), transcriptSha256: sha256(JSON.stringify(transcript)) }); save();
    }
    if (!record.transcript) {
      if (!switches.has('--cloud-review')) throw new Error('Use independent local ASR and --transcript-file. Cloud QA requires an explicit --cloud-review flag and is not part of the continuing production workflow.');
      const model = 'gemini-3.8-flash'; await client.api(`models/${model}`);
      const previousTranscriptions = ledger.transcriptions.filter((r) => r.segmentIndex === index);
      const knownRetiredModelRejection = previousTranscriptions.length === 1 && previousTranscriptions[0].model === 'gemini-2.5-flash' && previousTranscriptions[0].status === 'rejected' && previousTranscriptions[0].error?.includes('HTTP 404');
      const explicitKnownRejectionRetry = switches.has('--retry-transcription') && previousTranscriptions.length < 3 && previousTranscriptions.every((r) => r.status === 'rejected' && /HTTP (400|404)/.test(r.error || ''));
      if (previousTranscriptions.length && !knownRetiredModelRejection && !explicitKnownRejectionRetry) throw new Error('Blind transcription was previously attempted; review its recorded status instead of resubmitting.');
      const request = { segmentIndex: index, model, status: 'reserved', reservedAt: new Date().toISOString(), audioSha256: sha256(readFileSync(audio)) }; ledger.transcriptions.push(request); save();
      const blind = explicitKnownRejectionRetry ? 'Please transcribe this short business process narration in English. Give the actual spoken words and phrase start/end times in seconds. Describe audible voice characteristics and any editing joins or unclear words.' : 'Listen only to the supplied audio. Transcribe every clearly audible spoken word verbatim in English. Do not infer missing words, correct terminology, or add contextual knowledge. Return JSON with fullTranscript; phrases:[{startSeconds,endSeconds,text}] using small natural phrases, precise fractional seconds measured from audio start, no overlap; quality:{intelligible:boolean,clippedWords:boolean,extraSpeakers:boolean,music:boolean,voiceDescription:string,joinNotes:string}; uncertainWords:string[]. For joinNotes describe any abrupt voice change, repeated or clipped speech around 7–9 seconds and subsequent 7-second boundaries. If none, say none detected. Do not invent timestamps or confidently transcribe unclear sounds. This is a blind transcription, with no reference script.';
      try {
        const response = await client.api('interactions', { model, input: [{ type: 'text', text: blind }, { type: 'audio', mime_type: 'audio/wav', data: readFileSync(audio).toString('base64') }], response_format: { type: 'object', properties: { fullTranscript: { type: 'string' }, phrases: { type: 'array', items: { type: 'object', properties: { startSeconds: { type: 'number' }, endSeconds: { type: 'number' }, text: { type: 'string' } }, required: ['startSeconds', 'endSeconds', 'text'] } }, quality: { type: 'object', properties: { intelligible: { type: 'boolean' }, clippedWords: { type: 'boolean' }, extraSpeakers: { type: 'boolean' }, music: { type: 'boolean' }, voiceDescription: { type: 'string' }, joinNotes: { type: 'string' } }, required: ['intelligible', 'clippedWords', 'extraSpeakers', 'music', 'voiceDescription', 'joinNotes'] }, uncertainWords: { type: 'array', items: { type: 'string' } } }, required: ['fullTranscript', 'phrases', 'quality', 'uncertainWords'] } });
        const text = response.output_text || response.steps?.filter((step) => step.type === 'model_output').flatMap((step) => step.content || []).filter((part) => part.type === 'text').map((part) => part.text).join(''); if (!text) throw new Error('No transcription response.');
        const transcript = JSON.parse(text.replace(/^```json\s*|\s*```$/g, '')); request.status = 'completed'; request.usageMetadata = response.usage || response.usageMetadata; request.completedAt = new Date().toISOString(); record.transcript = transcript;
        const expected = plan.segments.slice(0, index + 1).map((s) => s.script).join(' '); record.speechComparison = comparison(expected, transcript.fullTranscript || ''); record.qa = { status: 'pending-visual-and-speech-review' }; save();
      } catch (error) { request.status = error.httpStatus ? 'rejected' : 'unknown'; request.error = client.redact(error.message); save(); throw error; }
    }
    writeFileSync(resolve(qaDir, `${base}.json`), JSON.stringify({ transcript: record.transcript, comparison: record.speechComparison, streams: record.streams, contactSheet: `ai/presenter/qa/${base}.jpg` }, null, 2) + '\n');
    console.log(JSON.stringify({ id: record.id, fullTranscript: record.transcript.fullTranscript, phrases: record.transcript.phrases, comparison: record.speechComparison }, null, 2));
  }
  console.log(JSON.stringify(cost(), null, 2));
} catch (error) { console.error(client ? client.redact(error.message) : error.message); process.exitCode = 1; }
finally { if (lock !== undefined) { closeSync(lock); unlinkSync(lockPath); } }
