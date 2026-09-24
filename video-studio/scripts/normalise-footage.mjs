import {createHash} from 'node:crypto';
import {existsSync, readFileSync, mkdirSync, writeFileSync, copyFileSync, renameSync, unlinkSync} from 'node:fs';
import {dirname, join, relative, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {footageCatalog} from './footage-catalog.mjs';

// Runs in Node, outside the Remotion bundle. This script never reads .env.
const studio = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repository = resolve(studio, '..');
const outputDirectory = join(studio, 'public', 'footage');
const seedDirectory = join(studio, 'public', 'ai', 'seeds');
const manifestPath = join(outputDirectory, 'manifest.json');
const args = new Set(process.argv.slice(2));
const force = args.has('--force');
const seedsOnly = args.has('--seeds-only');
const verifyOnly = args.has('--verify-only');
const slash = (path) => path.replaceAll('\\', '/');
const repoPath = (path) => slash(relative(repository, path));
const digest = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');

// Preserve original field of view for the two landscape sources. Their black
// bars are deliberate brand-charcoal panels, not an erroneous rotation.
function run(binary, parameters) {
  const result = spawnSync(binary, parameters, {encoding: 'utf8', windowsHide: true, maxBuffer: 16 * 1024 * 1024});
  if (result.error || result.status !== 0) {
    throw new Error(`${binary} failed (${result.status}): ${result.error?.message ?? ''}\n${result.stderr ?? ''}`);
  }
  return result.stdout;
}

function findBinary(name) {
  const configured = process.env[`${name.toUpperCase()}_PATH`];
  const found = spawnSync(process.platform === 'win32' ? 'where.exe' : 'which', [name], {encoding: 'utf8', windowsHide: true});
  const paths = found.stdout?.trim().split(/\r?\n/).filter(Boolean) ?? [];
  const bundled = join(studio, 'node_modules', '@remotion', 'compositor-win32-x64-msvc', `${name}.exe`);
  for (const candidate of [configured, ...paths, bundled].filter(Boolean)) {
    if (!existsSync(candidate)) continue;
    try {
      run(candidate, ['-version']);
      if (name === 'ffmpeg') {
        const filters = run(candidate, ['-hide_banner', '-filters']);
        if (!['fps', 'scale', 'pad', 'setsar', 'format', 'apad'].every((filter) => new RegExp(`\\s${filter}\\s`).test(filters))) continue;
      }
      return candidate;
    } catch {
      // Try a full FFmpeg install if a restricted bundled build cannot do this.
    }
  }
  throw new Error(`No usable ${name} found. Install full FFmpeg or set ${name.toUpperCase()}_PATH.`);
}

const ffmpeg = findBinary('ffmpeg');
const ffprobe = findBinary('ffprobe');
const probe = (path) => JSON.parse(run(ffprobe, ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', path]));
const filter = 'fps=30,scale=1080:1920:force_original_aspect_ratio=decrease:force_divisible_by=2:flags=lanczos,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=0x25282A,setsar=1,format=yuv420p';
const normalisation = {
  revision: 1, width: 1080, height: 1920, fps: 30, videoCodec: 'h264', pixelFormat: 'yuv420p', audioCodec: 'aac', audioSampleRate: 48000,
  rotation: 'FFmpeg autorotation baked into pixels; output rotation absent or zero',
  framing: 'Fit entire source within 1080x1920; landscape V02A/V02B retain full frame on #25282A panels.',
  filter,
};

function verify(path) {
  const metadata = probe(path);
  const video = metadata.streams.find((stream) => stream.codec_type === 'video');
  const audio = metadata.streams.find((stream) => stream.codec_type === 'audio');
  const rotation = video?.side_data_list?.find((entry) => entry.rotation !== undefined)?.rotation ?? Number(video?.tags?.rotate ?? 0);
  if (!video || video.width !== 1080 || video.height !== 1920 || video.codec_name !== 'h264' || video.pix_fmt !== 'yuv420p' || video.r_frame_rate !== '30/1' || video.avg_frame_rate !== '30/1' || rotation !== 0 || audio?.codec_name !== 'aac') {
    throw new Error(`Normalisation verification failed: ${path}`);
  }
  return metadata;
}

mkdirSync(outputDirectory, {recursive: true});
mkdirSync(seedDirectory, {recursive: true});
const existing = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : null;
const manifest = {
  schemaVersion: 1, generatedAt: new Date().toISOString(), normalisation,
  tools: {ffmpeg: slash(ffmpeg), ffprobe: slash(ffprobe), ffmpegVersion: run(ffmpeg, ['-version']).split(/\r?\n/)[0]},
  excluded: [{id: 'V04', reason: 'Lower-bitrate duplicate of V03C, misfiled as cure; shows rolling, not cure or return to service.', note: 'MaintainPavements/03 Footage/V04 - Cure and Return to Service.md'}],
  clips: [], seeds: [], stills: [],
};
const saveManifest = () => writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

// Extract the requested seeds directly from originals first, so paid generation
// can proceed without waiting for all six full-length encodes. Autorotation is
// baked in using the same fit/pad geometry as the normalised video masters.
for (const clip of footageCatalog.filter((item) => item.seed !== undefined)) {
  const source = join(repository, clip.source);
  const target = join(seedDirectory, `${clip.id}-${clip.seed}s.png`);
  if (!verifyOnly) run(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-i', source, '-ss', String(clip.seed), '-frames:v', '1', '-vf', filter.replace('fps=30,', ''), '-an', '-update', '1', target]);
  const metadata = probe(target);
  const video = metadata.streams.find((stream) => stream.codec_type === 'video');
  if (video?.width !== 1080 || video?.height !== 1920) throw new Error(`Invalid seed dimensions: ${target}`);
  manifest.seeds.push({id: clip.id, source: clip.source, sourceTimeSeconds: clip.seed, output: repoPath(target), sha256: digest(target), width: video.width, height: video.height, framing: normalisation.framing});
  console.log(`Seed ready: ${repoPath(target)} (${video.width}x${video.height})`);
}

if (seedsOnly) {
  writeFileSync(join(seedDirectory, 'manifest.json'), `${JSON.stringify({generatedAt: manifest.generatedAt, seeds: manifest.seeds}, null, 2)}\n`);
  process.exit(0);
}

for (const clip of footageCatalog) {
  const source = join(repository, clip.source);
  const target = join(outputDirectory, `${clip.id}.mp4`);
  const sourceSha256 = digest(source);
  const previous = existing?.clips?.find((item) => item.id === clip.id);
  const cached = existsSync(target) && previous?.sourceSha256 === sourceSha256 && existing?.normalisation?.revision === normalisation.revision;
  if (!verifyOnly && (force || !cached)) {
    console.log(`Normalising ${clip.id}...`);
    const temporary = join(outputDirectory, `${clip.id}.normalising.mp4`);
    run(ffmpeg, [
      '-hide_banner', '-loglevel', 'error', '-y', '-i', source,
      '-map', '0:v:0', '-map', '0:a:0', '-map_metadata', '-1',
      '-vf', filter, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-threads', '3',
      '-pix_fmt', 'yuv420p', '-r', '30', '-fps_mode', 'cfr', '-metadata:s:v:0', 'rotate=0',
      '-c:a', 'aac', '-ar', '48000', '-ac', '2', '-b:a', '128k', '-af', 'apad', '-shortest',
      '-movflags', '+faststart', temporary,
    ]);
    verify(temporary);
    if (existsSync(target)) unlinkSync(target);
    renameSync(temporary, target);
  }
  const outputProbe = verify(target);
  const sourceProbe = probe(source);
  manifest.clips.push({
    id: clip.id, source: clip.source, sourceSha256, output: repoPath(target), outputSha256: digest(target),
    note: `MaintainPavements/03 Footage/${clip.note}`, documentedStep: clip.step, bestClipSeconds: clip.bestClip,
    encoding: (cached && !force) ? (previous.encoding ?? {preset: 'medium', crf: 18, threads: 4}) : {preset: 'veryfast', crf: 20, threads: 3},
    sourceProbe, outputProbe,
  });
  saveManifest();
  console.log(`Verified ${clip.id}: upright 1080x1920 H.264 yuv420p CFR30 / AAC (${outputProbe.format.duration}s)`);
}

const stillSource = join(repository, 'videos/04-cure-and-return-to-service/WhatsApp Image 2026-08-22 at 13.08.43 (7).jpeg');
const stillTarget = join(outputDirectory, 'S04B.jpeg');
if (!verifyOnly) copyFileSync(stillSource, stillTarget);
if (digest(stillSource) !== digest(stillTarget)) throw new Error('S04B copy checksum differs from source');
manifest.stills.push({
  id: 'S04B', source: repoPath(stillSource), output: repoPath(stillTarget), sha256: digest(stillTarget),
  note: 'MaintainPavements/03 Footage/S04 - Cure Stills.md', width: 895, height: 813,
  visualReview: 'Viewed original: open steel canopy, pale uniform floor, no operating plant or people. Copied byte-for-byte without crop or grade.',
  provenance: 'User-supplied WhatsApp image. Canopy match and finished pad interpretation are inferred from the footage notes; SuperBase treatment, capture date, elapsed cure time, and performance are unconfirmed.',
  permittedEditorialUse: 'Illustrative finished-state still; do not present as verified SuperBase outcome, before/after proof, or evidence of return-to-service timing.',
});
saveManifest();
console.log(`Manifest saved: ${repoPath(manifestPath)}`);
