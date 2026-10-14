/** Copies canonical brand assets and masters existing audio. No paid API calls. */
import { copyFileSync, existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const studio = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repo = resolve(studio, '..');
const audioDir = resolve(studio, 'public/audio');
const brandDir = resolve(studio, 'public/brand');
mkdirSync(audioDir, { recursive: true });
mkdirSync(brandDir, { recursive: true });
const ffmpeg = process.env.FFMPEG_PATH || 'ffmpeg';
const ffprobe = process.env.FFPROBE_PATH || 'ffprobe';
const hash = (file) => createHash('sha256').update(readFileSync(file)).digest('hex');
const assets = [
  ['assets/logo/wordmark-on-dark.svg', 'wordmark-on-dark.svg'],
  ['assets/logo/wordmark-on-light.svg', 'wordmark-on-light.svg'],
  ['assets/logo/mark-on-dark.svg', 'mark-on-dark.svg'],
  ['graphics/web/cover.jpg', 'terrain-cover.jpg'],
  ['tokens.json', 'tokens.json'],
].map(([source, target]) => {
  const from = resolve(repo, 'design-system', source);
  const to = resolve(brandDir, target);
  copyFileSync(from, to);
  return { source: `design-system/${source}`, target: `public/brand/${target}`, sha256: hash(to) };
});
writeFileSync(resolve(brandDir, 'manifest.json'), JSON.stringify({ preparedAt: new Date().toISOString(), assets, rule: 'Exact copies of user-supplied canonical brand assets. No logo reconstruction or recolouring.' }, null, 2) + '\n');
if (process.argv.includes('--brand-only')) {
  console.log('Canonical brand copies and manifest refreshed; audio and video masters preserved.');
  process.exit(0);
}
const probe = (file) => JSON.parse(execFileSync(ffprobe, ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', file], { encoding: 'utf8', windowsHide: true }));
function run(args) {
  const result = spawnSync(ffmpeg, args, { encoding: 'utf8', windowsHide: true, maxBuffer: 8 * 1024 * 1024 });
  if (result.status !== 0) throw new Error(`FFmpeg failed: ${result.stderr.slice(-1800)}`);
  return result.stderr;
}
const musicSource = resolve(audioDir, 'superbase-bed.wav');
const music = resolve(audioDir, 'presenter-bed.wav');
const selectionFile = resolve(studio, 'public/ai/presenter/selection.json');
const selection = existsSync(selectionFile) ? JSON.parse(readFileSync(selectionFile, 'utf8')) : null;
const totalSeconds = selection?.totalSeconds ?? 60;
const musicSourceSeconds = Number(probe(musicSource).format.duration);
const tempoMultiplier = musicSourceSeconds / totalSeconds;
if (!(totalSeconds > 20 && totalSeconds < 180 && tempoMultiplier >= 0.5 && tempoMultiplier <= 2)) throw new Error('Invalid selected music duration.');
run(['-hide_banner', '-loglevel', 'error', '-i', musicSource, '-vn', '-af', `atempo=${tempoMultiplier},apad,atrim=duration=${totalSeconds},asetpts=PTS-STARTPTS,afade=t=in:st=0:d=1.2,afade=t=out:st=${totalSeconds - 3}:d=3`, '-ar', '48000', '-ac', '2', '-c:a', 'pcm_s16le', '-y', music + '.tmp.wav']);
renameSync(music + '.tmp.wav', music);
const musicInfo = probe(music);
const report = {
  preparedAt: new Date().toISOString(),
  brandManifest: 'public/brand/manifest.json',
  music: { source: 'public/audio/superbase-bed.wav', output: 'public/audio/presenter-bed.wav', sourceSha256: hash(musicSource), sha256: hash(music), seconds: Number(musicInfo.format.duration), tempoMultiplier, pitchPreserved: true, newGenerationRequests: 0, originalProvenance: 'public/audio/superbase-bed.manifest.json' },
};
const presenter = resolve(studio, 'public/ai/presenter/presenter.mp4');
if (existsSync(presenter) && !process.argv.includes('--music-only')) {
  // Decode the entire native sequence linearly. Short regular GOPs make the
  // extended Veo clip reliable when Remotion requests frames out of order.
  const renderVideo = resolve(studio, 'public/ai/presenter/presenter-render.mp4');
  run(['-hide_banner', '-loglevel', 'error', '-i', presenter, '-map', '0:v:0', '-an', '-vf', 'fps=30,setsar=1', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '17', '-pix_fmt', 'yuv420p', '-g', '30', '-keyint_min', '30', '-sc_threshold', '0', '-movflags', '+faststart', '-y', renderVideo + '.tmp.mp4']);
  renameSync(renderVideo + '.tmp.mp4', renderVideo);
  const renderInfo = probe(renderVideo);
  const renderStream = renderInfo.streams.find((stream) => stream.codec_type === 'video');
  const renderManifest = { preparedAt: new Date().toISOString(), source: 'ai/presenter/presenter.mp4', sourceSha256: hash(presenter), output: 'ai/presenter/presenter-render.mp4', sha256: hash(renderVideo), seconds: Number(renderStream.duration), fps: renderStream.r_frame_rate, frameCount: Number(renderStream.nb_frames), width: renderStream.width, height: renderStream.height, treatment: 'Full linear decode; 30fps H.264, one-second closed GOP, yuv420p, square pixels. Native timing preserved, no visual retiming or audio. Original API file remains unchanged.' };
  writeFileSync(resolve(studio, 'public/ai/presenter/render-manifest.json'), JSON.stringify(renderManifest, null, 2) + '\n');
  report.presenterRender = renderManifest;
  const narration = resolve(audioDir, 'presenter-narration.wav');
  const analysis = run(['-hide_banner', '-nostats', '-i', presenter, '-map', '0:a:0', '-vn', '-af', 'loudnorm=I=-16:TP=-3:LRA=8:print_format=json', '-f', 'null', '-']);
  const block = analysis.match(/\{\s*"input_i"[\s\S]*?\}/)?.[0];
  if (!block) throw new Error('Narration loudness analysis missing.');
  const measured = JSON.parse(block);
  const filter = `loudnorm=I=-16:TP=-3:LRA=8:measured_I=${measured.input_i}:measured_TP=${measured.input_tp}:measured_LRA=${measured.input_lra}:measured_thresh=${measured.input_thresh}:offset=${measured.target_offset}:linear=true,afade=t=in:st=0:d=0.015`;
  run(['-hide_banner', '-loglevel', 'error', '-i', presenter, '-map', '0:a:0', '-vn', '-af', filter, '-ar', '48000', '-ac', '2', '-c:a', 'pcm_s16le', '-y', narration + '.tmp.wav']);
  renameSync(narration + '.tmp.wav', narration);
  const info = probe(narration);
  report.narration = { source: 'public/ai/presenter/presenter.mp4', output: 'public/audio/presenter-narration.wav', sourceSha256: hash(presenter), sha256: hash(narration), seconds: Number(info.format.duration), targetIntegratedLoudnessLUFS: -16, targetTruePeakDBTP: -3, timing: 'Native Veo speech retained at original time; no cuts or speed changes.', sourceMeasurements: measured };
}
writeFileSync(resolve(audioDir, 'presenter-audio.manifest.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
