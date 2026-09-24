import {createHash} from 'node:crypto';
import {copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync} from 'node:fs';
import {dirname, join, relative, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {footageCatalog} from './footage-catalog.mjs';

// Additive preparation for the complete promo. Never reads .env, changes the
// first test's manifest, or re-encodes the six existing normalised masters.
const studio = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repository = resolve(studio, '..');
const outputDirectory = join(studio, 'public', 'footage');
const verifyOnly = process.argv.includes('--verify-only');
const slash = (path) => path.replaceAll('\\', '/');
const repoPath = (path) => slash(relative(repository, path));
const digest = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');

function run(binary, parameters) {
  const result = spawnSync(binary, parameters, {encoding: 'utf8', windowsHide: true, maxBuffer: 8 * 1024 * 1024});
  if (result.error || result.status !== 0) throw new Error(`${binary} failed: ${result.error?.message ?? result.stderr}`);
  return result.stdout;
}

function findBinary(name) {
  const candidates = run(process.platform === 'win32' ? 'where.exe' : 'which', [name]).trim().split(/\r?\n/);
  for (const candidate of candidates) {
    if (!existsSync(candidate)) continue;
    if (name === 'ffmpeg') {
      const filters = run(candidate, ['-hide_banner', '-filters']);
      if (!['fps', 'scale', 'pad', 'setsar', 'format', 'apad'].every((filter) => new RegExp(`\\s${filter}\\s`).test(filters))) continue;
    }
    return candidate;
  }
  throw new Error(`Full ${name} not found on PATH`);
}

const ffmpeg = findBinary('ffmpeg');
const ffprobe = findBinary('ffprobe');
const probe = (path) => JSON.parse(run(ffprobe, ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', path]));
const compactProbe = (metadata) => ({
  durationSeconds: Number(metadata.format.duration),
  streams: metadata.streams.map(({codec_type, codec_name, width, height, pix_fmt, r_frame_rate, avg_frame_rate, sample_rate, channels, side_data_list, tags}) => ({
    type: codec_type, codec: codec_name, width, height, pixelFormat: pix_fmt,
    frameRate: r_frame_rate, averageFrameRate: avg_frame_rate, sampleRate: sample_rate, channels,
    rotation: side_data_list?.find((entry) => entry.rotation !== undefined)?.rotation ?? Number(tags?.rotate ?? 0),
  })),
});

function verify(path) {
  const metadata = probe(path);
  const video = metadata.streams.find((stream) => stream.codec_type === 'video');
  const audio = metadata.streams.find((stream) => stream.codec_type === 'audio');
  const rotation = video?.side_data_list?.find((entry) => entry.rotation !== undefined)?.rotation ?? Number(video?.tags?.rotate ?? 0);
  if (!video || video.width !== 1080 || video.height !== 1920 || video.codec_name !== 'h264' || video.pix_fmt !== 'yuv420p' || video.r_frame_rate !== '30/1' || video.avg_frame_rate !== '30/1' || rotation !== 0 || audio?.codec_name !== 'aac' || audio.sample_rate !== '48000') {
    throw new Error(`Normalisation verification failed: ${path}`);
  }
  return metadata;
}

const v04 = {
  id: 'V04', source: 'videos/04-cure-and-return-to-service/WhatsApp Video 2026-08-17 at 07.21.24.mp4',
  note: 'V04 - Cure and Return to Service.md', step: '04', bestClip: [14.5, 18.3],
};
const completeCatalog = [...footageCatalog, v04].sort((a, b) => a.id.localeCompare(b.id));
function listVideos(directory) {
  return readdirSync(directory, {withFileTypes: true}).flatMap((entry) => entry.isDirectory()
    ? listVideos(join(directory, entry.name))
    : entry.name.toLowerCase().endsWith('.mp4') ? [repoPath(join(directory, entry.name))] : []);
}
const sourceFiles = listVideos(join(repository, 'videos')).sort();
const catalogFiles = completeCatalog.map((item) => item.source).sort();
if (JSON.stringify(sourceFiles) !== JSON.stringify(catalogFiles)) throw new Error('Video source inventory differs from complete catalog. Review before editing.');

mkdirSync(outputDirectory, {recursive: true});
const originalManifest = JSON.parse(readFileSync(join(outputDirectory, 'manifest.json'), 'utf8'));
const filter = 'fps=30,scale=1080:1920:force_original_aspect_ratio=decrease:force_divisible_by=2:flags=lanczos,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=0x25282A,setsar=1,format=yuv420p';
const targetV04 = join(outputDirectory, 'V04.mp4');
if (!existsSync(targetV04) && !verifyOnly) {
  const temporary = join(outputDirectory, 'V04.normalising.mp4');
  if (existsSync(temporary)) throw new Error('V04.normalising.mp4 already exists. Check for an interrupted or running encode before proceeding.');
  console.log('Normalising actual V04 source; this is a lower-bitrate duplicate of V03C and remains Step 04.');
  run(ffmpeg, [
    '-hide_banner', '-loglevel', 'error', '-n', '-i', join(repository, v04.source),
    '-map', '0:v:0', '-map', '0:a:0', '-map_metadata', '-1', '-vf', filter,
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-threads', '3', '-pix_fmt', 'yuv420p', '-r', '30', '-fps_mode', 'cfr', '-metadata:s:v:0', 'rotate=0',
    '-c:a', 'aac', '-ar', '48000', '-ac', '2', '-b:a', '128k', '-af', 'apad', '-shortest', '-movflags', '+faststart', temporary,
  ]);
  verify(temporary);
  renameSync(temporary, targetV04);
}

const clips = completeCatalog.map((clip) => {
  const source = join(repository, clip.source);
  const target = join(outputDirectory, `${clip.id}.mp4`);
  const sourceSha256 = digest(source);
  const outputSha256 = digest(target);
  if (clip.id !== 'V04') {
    const previous = originalManifest.clips.find((item) => item.id === clip.id);
    if (sourceSha256 !== previous?.sourceSha256 || outputSha256 !== previous?.outputSha256) throw new Error(`Existing ${clip.id} checksum differs from original manifest; no file was changed.`);
  }
  const outputProbe = verify(target);
  const sourceProbe = probe(source);
  if (clip.bestClip[1] > Number(outputProbe.format.duration)) throw new Error(`Suggested range exceeds ${clip.id}`);
  console.log(`Verified ${clip.id}: upright 1080x1920 H.264 yuv420p CFR30 / AAC; ${outputProbe.format.duration}s`);
  return {
    id: clip.id, source: clip.source, sourceSha256, output: repoPath(target), outputSha256,
    note: `MaintainPavements/03 Footage/${clip.note}`, documentedStep: clip.step, suggestedSourceRangeSeconds: clip.bestClip,
    sourceProbe: compactProbe(sourceProbe), outputProbe: compactProbe(outputProbe),
    duplicateOf: clip.id === 'V04' ? 'V03C' : undefined,
    editorialCaution: clip.id === 'V04' ? 'Same action as V03C in a lower-bitrate source. Include only at user request for all source videos. Selected 14.5–18.3 s avoids repeating V03C 0–4 s. Rolling only: never label as cure or return-to-service evidence.' : clip.id === 'V02B' ? 'Misfiled under dose and mix; pixels show wet rolling, Step 04.' : undefined,
    encoding: clip.id === 'V04' ? {preset: 'veryfast', crf: 20, threads: 3} : originalManifest.clips.find((item) => item.id === clip.id).encoding,
  };
});

const stillCatalog = [
  {
    id: 'S04A', source: 'videos/04-cure-and-return-to-service/image (2).png', filename: 'S04A.png',
    visualReview: 'Viewed original: light grey-beige yard surface, tyre arcs and dark scrub marks; steel rings and a red recycler skip at the top. No overlaid graphics. Third-party lettering appears on the skip.',
    editorialUse: 'Supplied surface photo from a different yard. Use a surface-detail crop below source y=160 to omit the skip branding, and label as a different yard. No verified SuperBase treatment, elapsed cure time, measured performance, or same-site before/after claim.',
  },
  {
    id: 'S04B', source: 'videos/04-cure-and-return-to-service/WhatsApp Image 2026-08-22 at 13.08.43 (7).jpeg', filename: 'S04B.jpeg',
    visualReview: 'Viewed original: empty steel canopy and pale, dry-looking uniform pad, IBCs at far right; no plant, people, visible logos or overlaid graphics.',
    editorialUse: 'Supplied canopy-pad photo. Canopy continuity is inferred from notes. It cannot establish SuperBase treatment, cure duration, or return-to-service timing. Keep captions descriptive and show the Claims Register disclaimer.',
  },
];
const stills = stillCatalog.map(({filename, ...still}) => {
  const source = join(repository, still.source);
  const target = join(outputDirectory, filename);
  if (still.id === 'S04A' && !existsSync(target) && !verifyOnly) copyFileSync(source, target);
  const sourceSha256 = digest(source);
  if (sourceSha256 !== digest(target)) throw new Error(`${still.id} copy differs from its source`);
  const metadata = probe(target);
  const video = metadata.streams.find((stream) => stream.codec_type === 'video');
  console.log(`Verified ${still.id}: byte-identical source copy, ${video.width}x${video.height}`);
  return {...still, output: repoPath(target), sourceSha256, outputSha256: sourceSha256, width: video.width, height: video.height, note: 'MaintainPavements/03 Footage/S04 - Cure Stills.md'};
});

// Full decoding verifies the new video and audio, not just container metadata.
run(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-xerror', '-i', targetV04, '-map', '0:v:0', '-map', '0:a:0', '-f', 'null', '-']);
const manifest = {
  schemaVersion: 1, generatedAt: new Date().toISOString(), sourceVideoFiles: sourceFiles.length, uniqueSourceClips: 6,
  purpose: 'Additive media inventory for all-seven-source-video promo. Original test assets and manifest preserved.',
  normalisation: {...originalManifest.normalisation, newV04Filter: filter},
  tools: {ffmpeg: slash(ffmpeg), ffprobe: slash(ffprobe), ffmpegVersion: run(ffmpeg, ['-version']).split(/\r?\n/)[0]},
  videoDecodingCheck: {id: 'V04', allVideoAndAudioFramesDecoded: true},
  coverage: {
    '01': {label: 'Prepare', realVideoIds: ['V01']},
    '02': {label: 'Dose and mix', realVideoIds: ['V02A'], caveat: 'Dosing is visible; mixing through depth is not shown by available real footage.'},
    '03': {label: 'Grade to level', realVideoIds: [], caveat: 'No verified real grading footage; planned separately generated AI illustration must remain labelled.'},
    '04': {label: 'Roll and compact', realVideoIds: ['V02B', 'V03A', 'V03B', 'V03C', 'V04']},
    '05': {label: 'Cure and return to service', realVideoIds: [], stillIds: ['S04B', 'S04A'], caveat: 'Different-site supplied stills; no measured curing time or return-to-service video.'},
  },
  claimsRegister: "MaintainPavements/01 Jon's Plan/Claims Register.md",
  disclaimer: 'Figures indicative only. Rates, cure times and results vary with base material, climate and duty, and are confirmed by site trial and testing. Comparison vs engineered concrete hardstand.',
  clips, stills,
};
const manifestPath = join(outputDirectory, 'complete-manifest.json');
if (!verifyOnly) writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`${verifyOnly ? 'Verified' : 'Wrote'} complete media inventory: 7 source video files (6 unique clips), 2 stills.`);
