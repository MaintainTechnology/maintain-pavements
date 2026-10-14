/** Verify the delivered Reel: decode, coverage, subtitles, native speech and music. */
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const studio = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(studio, 'out/maintain-pavements-presenter-reel.mp4');
const read = (file) => JSON.parse(readFileSync(resolve(studio, file), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const ffmpeg = process.env.FFMPEG_PATH || 'ffmpeg';
const metadata = JSON.parse(execFileSync(process.env.FFPROBE_PATH || 'ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', output], { encoding: 'utf8', windowsHide: true }));
const video = metadata.streams.find((item) => item.codec_type === 'video');
const audio = metadata.streams.find((item) => item.codec_type === 'audio');
const coverage = read('out/presenter-render-coverage.json');
const props = coverage.props;
const expectedSeconds = props.narrationSeconds + props.endCardSeconds;
const hash = (file) => createHash('sha256').update(readFileSync(file)).digest('hex');
const audioManifest = read('public/audio/presenter-audio.manifest.json');
const renderManifest = read('public/ai/presenter/render-manifest.json');
const selection = read('public/ai/presenter/selection.json');
const mixManifest = read('public/audio/presenter-mix.manifest.json');
assert(mixManifest.sourceSha256 === selection.sourceSha256 && mixManifest.seconds === expectedSeconds, 'Final audio mix uses a different presenter or duration.');
assert(mixManifest.narration.sha256 === audioManifest.narration.sha256 && mixManifest.music.sha256 === audioManifest.music.sha256, 'Final audio mix uses different source masters.');
assert(hash(resolve(studio, 'public', mixManifest.output)) === mixManifest.sha256, 'Final audio mix changed after preparation.');
assert(selection.narrationSeconds === props.narrationSeconds && selection.endCardSeconds === props.endCardSeconds && selection.totalSeconds === expectedSeconds, 'Export timing differs from the reviewed editorial selection.');
const presenterHash = hash(resolve(studio, 'public', props.presenter.src));
assert(renderManifest.sha256 === presenterHash && renderManifest.sourceSha256 === hash(resolve(studio, 'public', renderManifest.source)), 'Presenter render derivative differs from its native source record.');
assert(selection.sourceSha256 === renderManifest.sourceSha256, 'Presenter native source differs from the reviewed selection.');
assert(audioManifest.narration?.sourceSha256 === renderManifest.sourceSha256, 'Narration master was not derived from the current native presenter video.');
assert(audioManifest.narration.sha256 === hash(resolve(studio, 'public', props.audio.narrationSrc)), 'Narration master changed after preparation.');
assert(audioManifest.music.sha256 === hash(resolve(studio, 'public', props.audio.musicSrc)), 'Music master changed after preparation.');
for (const asset of coverage.media) assert(hash(resolve(studio, 'public', asset.file)) === asset.sha256, `Source changed since render: ${asset.file}.`);
assert(video.codec_name === 'h264' && video.width === 1080 && video.height === 1920 && ['yuv420p', 'yuvj420p'].includes(video.pix_fmt), 'Expected1080x1920 H.264 4:2:0.');
assert(video.r_frame_rate === '30/1' && Number(video.nb_frames) === coverage.composition.durationInFrames && Math.abs(Number(video.duration) - expectedSeconds) < 0.04, 'Video duration/frame count mismatch.');
assert(audio.codec_name === 'aac' && audio.channels === 2 && Math.abs(Number(audio.duration) - expectedSeconds) < 0.1, 'Missing full-duration stereo AAC mix.');
assert(coverage.mode === 'final' && !props.previewOnlySeed && props.captionsStatus === 'verified', 'Draft presenter/captions may not pass final verification.');
assert(coverage.allSevenVideosCovered && coverage.bothStillsCovered && coverage.allFiveStepsCovered && coverage.canonicalBrandAssetsVerified && coverage.renderEnvironmentVariableCount === 0, 'Coverage/brand/environment validation failed.');
assert(props.captions.length >= 10 && props.captions.every((caption) => caption.toSeconds > caption.fromSeconds && caption.toSeconds <= props.narrationSeconds && caption.text.length <= 110), 'Invalid phrase-level subtitles.');
const subtitles = readFileSync(resolve(studio, 'out/maintain-pavements-presenter-reel.srt'), 'utf8');
for (const caption of props.captions) assert(subtitles.includes(caption.text), 'SRT does not match burned-in captions.');
execFileSync(ffmpeg, ['-v', 'error', '-xerror', '-i', output, '-map', '0:v:0', '-map', '0:a:0', '-f', 'null', '-'], { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 4 * 1024 * 1024 });
const loudness = spawnSync(ffmpeg, ['-hide_banner', '-nostats', '-i', output, '-vn', '-af', 'loudnorm=I=-16:TP=-1:LRA=11:print_format=json', '-f', 'null', '-'], { windowsHide: true, encoding: 'utf8' });
assert(loudness.status === 0, 'Loudness analysis failed.');
const measured = JSON.parse(loudness.stderr.match(/\{\s*"input_i"[\s\S]*?\}/)?.[0] || '{}');
assert(Number(measured.input_i) > -24 && Number(measured.input_i) < -10 && Number(measured.input_tp) < -0.8, 'Speech mix is too quiet, too loud or clipping.');
const sampleRate = 4000;
function samples(file, start, seconds) {
  const bytes = execFileSync(ffmpeg, ['-v', 'error', '-ss', String(start), '-i', file, '-t', String(seconds), '-vn', '-ac', '1', '-ar', String(sampleRate), '-f', 'f32le', 'pipe:1'], { windowsHide: true, maxBuffer: 2 * 1024 * 1024 });
  return Array.from({ length: Math.floor(bytes.length / 4) }, (_, index) => bytes.readFloatLE(index * 4));
}
function compare(reference, exported) {
  let best = { correlation: -1, lagSamples: 0, gain: 0 };
  // Encoder delay is allowed, but not a perceptible time shift in the narration.
  for (let lag = -400; lag <= 400; lag++) {
    const first = Math.max(0, -lag);
    const last = Math.min(reference.length, exported.length - lag);
    const count = last - first;
    let x = 0, y = 0, xx = 0, yy = 0, xy = 0;
    for (let index = first; index < last; index++) {
      const a = reference[index], b = exported[index + lag];
      x += a; y += b; xx += a * a; yy += b * b; xy += a * b;
    }
    const covariance = xy - x * y / count;
    const referenceVariance = xx - x * x / count;
    const exportedVariance = yy - y * y / count;
    const correlation = covariance / Math.sqrt(referenceVariance * exportedVariance);
    if (Number.isFinite(correlation) && correlation > best.correlation) best = { correlation, lagSamples: lag, gain: covariance / referenceVariance };
  }
  return { ...best, offsetSeconds: best.lagSamples / sampleRate };
}
function rms(values) { return 20 * Math.log10(Math.sqrt(values.reduce((sum, value) => sum + value * value, 0) / values.length)); }
const speechStart = 1, speechSeconds = 5;
const spokenReference = samples(resolve(studio, 'public', props.audio.narrationSrc), speechStart, speechSeconds);
const spokenExport = samples(output, speechStart, speechSeconds);
const speechMatch = compare(spokenReference, spokenExport);
assert(rms(spokenExport) > -35 && speechMatch.correlation >= 0.9, 'Native narration is absent or changed in the export.');
assert(Math.abs(speechMatch.gain / props.audio.narrationVolume - 1) < 0.25, 'Narration level differs from the planned mix.');
const musicStart = props.narrationSeconds + 5, musicSeconds = 4;
const musicReference = samples(resolve(studio, 'public', props.audio.musicSrc), musicStart, musicSeconds);
const musicExport = samples(output, musicStart, musicSeconds);
const musicMatch = compare(musicReference, musicExport);
assert(rms(musicExport) > -45 && musicMatch.correlation >= 0.95, 'Background music is absent or changed in the end card.');
assert(Math.abs(musicMatch.gain / props.audio.musicEndCard - 1) < 0.25, 'End-card music level differs from the planned mix.');
const ledger = read('.veo/presenter-reel.json');
const report = {
  checkedAt: new Date().toISOString(), file: 'out/maintain-pavements-presenter-reel.mp4', bytes: statSync(output).size, sha256: createHash('sha256').update(readFileSync(output)).digest('hex'),
  video: { codec: video.codec_name, width: video.width, height: video.height, fps: video.r_frame_rate, frames: Number(video.nb_frames), seconds: Number(video.duration) },
  audio: { codec: audio.codec_name, channels: audio.channels, sampleRate: Number(audio.sample_rate), seconds: Number(audio.duration), integratedLoudnessLUFS: Number(measured.input_i), truePeakDBTP: Number(measured.input_tp), speechMatch: { ...speechMatch, fromSeconds: speechStart, toSeconds: speechStart + speechSeconds, passed: true }, musicMatch: { ...musicMatch, fromSeconds: musicStart, toSeconds: musicStart + musicSeconds, passed: true } },
  fullDecodePassed: true, brandAssetsVerified: true, audioProvenanceVerified: true, sourceHashesVerified: true, mixedAudioSha256: mixManifest.sha256, allSevenVideosCovered: true, bothStillsCovered: true, fiveProcessStepsCovered: true, verifiedSubtitlePhrases: props.captions.length, renderEnvironmentVariableCount: 0,
  cost: ledger.cost, selectedNarratorSegments: selection.selectedSegmentCount, editorialSelection: selection.reason,
  editorial: 'AI presenter uses a generic synthetic voice. Script explains the documented method. Real footage, illustrative grading and unconfirmed cure imagery remain labelled. No invented measured results or guarantees. Official supplied logo artwork and exact Claims Register disclaimer are included.',
};
writeFileSync(resolve(studio, 'out/presenter-render-report.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
console.log('PASS: branded portrait Reel, native speech, music, subtitles, source coverage and full decode.');
