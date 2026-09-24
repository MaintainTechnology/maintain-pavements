import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, statSync, copyFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const studio = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ffprobe = process.env.FFPROBE_PATH || 'ffprobe';
const probe = (file) => JSON.parse(execFileSync(ffprobe, ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', file], { encoding: 'utf8', windowsHide: true }));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const output = resolve(studio, 'out/test-promo.mp4');
const result = probe(output);
const video = result.streams.find((stream) => stream.codec_type === 'video');
const audio = result.streams.find((stream) => stream.codec_type === 'audio');
// FFprobe calls full-range 8-bit 4:2:0 yuvj420p; Remotion uses this range for JPEG frames.
assert(video?.codec_name === 'h264' && video.width === 1080 && video.height === 1920 && ['yuv420p', 'yuvj420p'].includes(video.pix_fmt), 'Output must be portrait 1080x1920 H.264 with 8-bit 4:2:0 pixels.');
assert(video.r_frame_rate === '30/1' && Number(video.nb_frames) === 1800 && Math.abs(Number(video.duration) - 60) < 0.02, 'Output must contain 1800 frames at 30fps (60s).');
assert(audio?.codec_name === 'aac', 'Expected original machinery audio in AAC stream.');
const generated = ['before-yard', 'prepare-atmosphere', 'dose-atmosphere', 'roll-atmosphere'].map((id) => {
  const media = probe(resolve(studio, `public/ai/${id}.mp4`));
  const stream = media.streams.find((item) => item.codec_type === 'video');
  assert(stream?.width === 1080 && stream.height === 1920 && Math.abs(Number(stream.duration) - 8) < 0.05, `${id} must be an 8s portrait 1080p clip.`);
  return { id, width: stream.width, height: stream.height, seconds: Number(stream.duration), fps: stream.r_frame_rate };
});
const ledger = JSON.parse(readFileSync(resolve(studio, '.veo/superbase-test.json'), 'utf8'));
assert(ledger.requests.length === 4 && ledger.requests.every((request) => request.downloaded), 'Expected exactly four completed Veo requests.');
const report = {
  checkedAt: new Date().toISOString(),
  file: 'out/test-promo.mp4',
  bytes: statSync(output).size,
  sha256: createHash('sha256').update(readFileSync(output)).digest('hex'),
  video: { codec: video.codec_name, width: video.width, height: video.height, pixelFormat: video.pix_fmt, fps: video.r_frame_rate, frames: Number(video.nb_frames), seconds: Number(video.duration) },
  audio: { codec: audio.codec_name, sampleRate: audio.sample_rate, seconds: Number(audio.duration) },
  ai: { clips: generated, generationRequests: ledger.requests.length, estimatedGeneratedCostUSD: ledger.cost.estimatedGeneratedCostUSD, billedCostUSD: null },
  editorial: 'AI labels throughout opening 0–10s; real process footage after 10s; grading is a diagram; cure timing unconfirmed; Claims Register disclaimer on end card.',
};
copyFileSync(output, resolve(studio, 'out/promo60.mp4'));
writeFileSync(resolve(studio, 'out/render-report.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
console.log('PASS: out/promo60.mp4 is an identical copy of the verified test.');
