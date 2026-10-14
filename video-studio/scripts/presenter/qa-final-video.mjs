/** Extract visual QA only from the finished encoded MP4. No network or generation. */
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createReadStream, existsSync, mkdirSync, renameSync, statSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const studio = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const source = resolve(studio, 'out/maintain-pavements-presenter-reel.mp4');
const outputDir = resolve(studio, 'out/qa-final-presenter');
const times = [2.2, 5, 7, 10.25, 13.75, 16.75, 20.5, 23.5, 27, 30, 32.25, 34.75, 37.75, 41.25, 48, 58];
const assert = (value, message) => { if (!value) throw new Error(message); };
const slash = (value) => value.replaceAll('\\', '/');

const run = (executable, args) => new Promise((resolveRun, reject) => {
  const child = spawn(executable, args, { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  let stdout = '';
  let stderr = '';
  child.stdout.on('data', (chunk) => { stdout += chunk; });
  child.stderr.on('data', (chunk) => { stderr = (stderr + chunk).slice(-12000); });
  child.once('error', reject);
  child.once('close', (code) => code === 0
    ? resolveRun(stdout)
    : reject(new Error(`${executable} failed (${code}): ${stderr}`)));
});

const fileHash = async (file) => {
  const digest = createHash('sha256');
  for await (const chunk of createReadStream(file)) digest.update(chunk);
  return digest.digest('hex');
};

const main = async () => {
  const args = process.argv.slice(2);
  if (args.length === 1 && args[0] === '--help') {
    console.log('Usage: node scripts/presenter/qa-final-video.mjs');
    console.log(`Input: ${source}`);
    console.log(`Output: ${outputDir} (16 JPGs at 540x960, one 4x4 sheet at 1080x1920, and manifest.json)`);
    console.log('Run only after the final encoded MP4 has completed. Existing QA images may be replaced; source media is read-only.');
    return;
  }
  assert(args.length === 0, 'Only --help is supported; QA is fixed to this final render.');
  assert(existsSync(source), 'The final MP4 does not exist yet. Wait for the completed render.');
  const before = statSync(source);
  assert(before.isFile() && before.size > 0, 'The final MP4 is empty or is not a file.');
  const sourceSha256 = await fileHash(source);
  const probe = JSON.parse(await run(process.env.FFPROBE_PATH || 'ffprobe', [
    '-v', 'error', '-show_streams', '-show_format', '-of', 'json', source,
  ]));
  const video = probe.streams.find((stream) => stream.codec_type === 'video');
  assert(video && video.width === 1080 && video.height === 1920, 'Expected the final 1080x1920 portrait render.');
  const duration = Number(probe.format.duration);
  assert(duration > times.at(-1), 'The final MP4 is too short for the requested QA times.');
  mkdirSync(outputDir, { recursive: true });
  const frames = [];
  const ffmpeg = process.env.FFMPEG_PATH || 'ffmpeg';
  for (let index = 0; index < times.length; index++) {
    const requestedSeconds = times[index];
    const filename = `frame-${String(index + 1).padStart(2, '0')}.jpg`;
    await run(ffmpeg, [
      '-hide_banner', '-loglevel', 'error', '-xerror', '-y',
      '-threads', '1', '-ss', String(requestedSeconds), '-i', source,
      '-map', '0:v:0', '-an', '-sn', '-dn', '-frames:v', '1',
      '-vf', 'scale=540:960:flags=lanczos,setsar=1',
      '-filter_threads', '1', '-threads', '1', '-q:v', '2', '-update', '1',
      resolve(outputDir, filename),
    ]);
    assert(statSync(resolve(outputDir, filename)).size > 0, `Missing extracted frame ${filename}.`);
    frames.push({ index: index + 1, requestedSeconds, file: filename, width: 540, height: 960 });
  }
  const contactSheet = 'contact-sheet.jpg';
  await run(ffmpeg, [
    '-hide_banner', '-loglevel', 'error', '-xerror', '-y',
    '-threads', '1', '-framerate', '1', '-start_number', '1',
    '-i', resolve(outputDir, 'frame-%02d.jpg'),
    '-vf', 'scale=270:480:flags=lanczos,setsar=1,tile=4x4:nb_frames=16',
    '-frames:v', '1', '-filter_threads', '1', '-threads', '1', '-q:v', '2', '-update', '1',
    resolve(outputDir, contactSheet),
  ]);
  const after = statSync(source);
  assert(before.size === after.size && before.mtimeMs === after.mtimeMs && await fileHash(source) === sourceSha256,
    'The source MP4 changed during QA extraction. Run again after rendering completes.');
  const manifest = {
    source: slash(source), sourceSha256, sourceBytes: after.size,
    extractedAt: new Date().toISOString(),
    sourceVideo: { width: video.width, height: video.height, durationSeconds: duration, frameRate: video.avg_frame_rate },
    sampling: 'FFmpeg accurate seek to each requested time, then first decoded frame; no previous preview stills used.',
    frames,
    contactSheet: { file: contactSheet, columns: 4, rows: 4, tileWidth: 270, tileHeight: 480, order: 'Left to right, then top to bottom.' },
  };
  const manifestPath = resolve(outputDir, 'manifest.json');
  writeFileSync(`${manifestPath}.part`, JSON.stringify(manifest, null, 2) + '\n');
  renameSync(`${manifestPath}.part`, manifestPath);
  console.log(`Extracted ${frames.length} final-video frames and one 4x4 contact sheet: ${outputDir}`);
  console.log(`Source SHA-256: ${sourceSha256}`);
};

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
