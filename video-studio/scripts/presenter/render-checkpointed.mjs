/** Durable local export. No environment file, API call, or generation is used. */
import { openBrowser, renderFrames, renderStill } from '@remotion/renderer';
import { createHash } from 'node:crypto';
import { spawn, execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { dirname, relative, resolve, sep } from 'node:path';

const assert = (test, message) => { if (!test) throw new Error(message); };
const hash = (data) => createHash('sha256').update(data).digest('hex');
const fileHash = (file) => hash(readFileSync(file));
const stable = (value) => JSON.stringify(value, (_key, item) => item && typeof item === 'object' && !Array.isArray(item) ? Object.fromEntries(Object.entries(item).sort(([a], [b]) => a.localeCompare(b))) : item);
const slash = (path) => path.replaceAll('\\', '/');
const json = (file) => JSON.parse(readFileSync(file, 'utf8'));
const atomicJson = (file, value) => { writeFileSync(`${file}.part`, JSON.stringify(value, null, 2) + '\n'); renameSync(`${file}.part`, file); };
const probe = (file) => JSON.parse(execFileSync(process.env.FFPROBE_PATH || 'ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', file], { encoding: 'utf8', windowsHide: true }));
const within = (base, file) => { const path = resolve(base, file); assert(path.startsWith(resolve(base) + sep), `Path must stay inside ${base}.`); return path; };
const walk = (directory) => readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name)).flatMap((entry) => entry.isDirectory() ? walk(resolve(directory, entry.name)) : [resolve(directory, entry.name)]);
const usedPorts = new Set();
const freshPort = async () => {
  while (true) {
    const server = createServer();
    await new Promise((done, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', done); });
    const port = server.address().port;
    await new Promise((done, reject) => server.close((error) => error ? reject(error) : done()));
    if (!usedPorts.has(port)) { usedPorts.add(port); return port; }
  }
};

// Require complete JPEG boundaries, sane segments, a scan and exact dimensions.
// FFmpeg's -xerror decode during final encoding provides the full entropy check.
export const validateCheckpointJpeg = (bytes, width, height) => {
  if (bytes.length < 1024 || bytes.readUInt16BE(0) !== 0xffd8 || bytes.readUInt16BE(bytes.length - 2) !== 0xffd9) return false;
  let offset = 2;
  let dimensions = false;
  while (offset + 4 <= bytes.length) {
    if (bytes[offset++] !== 0xff) return false;
    while (bytes[offset] === 0xff) offset++;
    if (offset + 3 > bytes.length) return false;
    const marker = bytes[offset++];
    if (marker === 0xda) return dimensions;
    if (marker === 0xd9) return false;
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    const length = bytes.readUInt16BE(offset);
    if (length < 2 || offset + length > bytes.length) return false;
    if ([0xc0, 0xc1, 0xc2].includes(marker)) {
      if (length < 8) return false;
      dimensions = bytes.readUInt16BE(offset + 3) === height && bytes.readUInt16BE(offset + 5) === width;
    }
    offset += length;
  }
  return false;
};

const audioMix = (studio, composition, props) => {
  const manifest = json(resolve(studio, 'public/audio/presenter-mix.manifest.json'));
  const duration = composition.durationInFrames / composition.fps;
  const close = (a, b) => Math.abs(Number(a) - Number(b)) < 1e-7;
  assert(manifest.output === 'audio/presenter-mix.wav', 'Unexpected mixed-audio path.');
  const path = within(resolve(studio, 'public'), manifest.output);
  assert(fileHash(path) === manifest.sha256 && close(manifest.seconds, duration), 'Audio mix hash/duration mismatch.');
  assert(manifest.sampleRate === 48000 && manifest.channels === 2, 'Mix must be stereo 48 kHz.');
  assert(manifest.narration.file === props.audio.narrationSrc && manifest.music.file === props.audio.musicSrc, 'Audio mix uses different masters.');
  assert(manifest.narration.sha256 === fileHash(within(resolve(studio, 'public'), props.audio.narrationSrc)), 'Narration master changed after mix.');
  assert(manifest.music.sha256 === fileHash(within(resolve(studio, 'public'), props.audio.musicSrc)), 'Music master changed after mix.');
  assert(manifest.sourceSha256 === fileHash(resolve(studio, 'public/ai/presenter/presenter.mp4')), 'Mix source does not match the accepted raw presenter.');
  const expected = [
    [manifest.narration.volume, props.audio.narrationVolume], [manifest.narration.endSeconds, props.narrationSeconds],
    [manifest.music.underVoice, props.audio.musicUnderVoice], [manifest.music.endCard, props.audio.musicEndCard],
    [manifest.music.fadeInSeconds, .8], [manifest.music.liftStart, props.narrationSeconds - 1 / composition.fps],
    [manifest.music.liftEnd, props.narrationSeconds + 1.3], [manifest.music.fadeOutStart, duration - 2.5],
    [manifest.music.fadeOutEnd, duration - 1 / composition.fps],
  ];
  assert(expected.every(([a, b]) => close(a, b)), 'Audio envelope differs from the Remotion composition.');
  const info = probe(path);
  const audio = info.streams.find((stream) => stream.codec_type === 'audio');
  assert(audio && audio.channels === 2 && Number(audio.sample_rate) === 48000 && Math.abs(Number(info.format.duration) - duration) <= 1 / 48000, 'Mixed WAV is not the expected exact duration/format.');
  return { path, manifest };
};

const makeFingerprint = ({ studio, serveUrl, composition, props, mediaChecks, brand }) => {
  const src = resolve(studio, 'src');
  const sourceFiles = walk(src).map((file) => ({ file: slash(relative(studio, file)), sha256: fileHash(file) }));
  const bundleFiles = readdirSync(serveUrl).filter((name) => /\.(js|css|html)$/.test(name)).sort().map((name) => ({ file: name, sha256: fileHash(resolve(serveUrl, name)) }));
  const mediaNames = [...new Set([...mediaChecks.map((item) => item.file), props.presenter.seed, props.audio.musicSrc, props.audio.narrationSrc])].sort();
  const media = mediaNames.map((file) => {
    const sha256 = fileHash(within(resolve(studio, 'public'), file));
    assert(fileHash(within(resolve(serveUrl, 'public'), file)) === sha256, `Bundle media differs from its source: ${file}.`);
    return { file, sha256 };
  });
  const brandFiles = brand.assets.map((asset) => ({ file: slash(relative(resolve(studio, 'public'), resolve(studio, asset.target))), sha256: asset.sha256 })).sort((a, b) => a.file.localeCompare(b.file));
  for (const asset of brandFiles) assert(fileHash(within(resolve(serveUrl, 'public'), asset.file)) === asset.sha256, `Bundled brand asset changed: ${asset.file}.`);
  const fingerprintInput = { version: 1, composition: { id: composition.id, width: composition.width, height: composition.height, fps: composition.fps, durationInFrames: composition.durationInFrames }, props, sourceFiles, bundleFiles, media, brand: brandFiles, screenshot: { imageFormat: 'jpeg', jpegQuality: 80, scale: 1 } };
  return { fingerprint: hash(stable(fingerprintInput)), fingerprintInput };
};

const runEncode = (args) => new Promise((done, reject) => {
  const child = spawn(process.env.FFMPEG_PATH || 'ffmpeg', args, { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  let errors = '';
  let output = '';
  let last = 0;
  child.stderr.on('data', (data) => { errors = (errors + data.toString()).slice(-8000); });
  child.stdout.on('data', (data) => {
    output += data.toString();
    const lines = output.split('\n'); output = lines.pop();
    for (const line of lines) if (line.startsWith('out_time=') && Date.now() - last > 15000) { last = Date.now(); console.log(`Encoding ${line.slice(9).trim()}.`); }
  });
  child.on('error', reject);
  child.on('close', (code) => code === 0 ? done() : reject(new Error(`FFmpeg encode failed (${code}): ${errors}`)));
});

/** Resume only verified missing frames. Each batch owns its browser/server/cache. */
export const renderCheckpointedPresenter = async ({ studio, serveUrl, composition, props, mediaChecks, brand, outputLocation, batchSize = 180 }) => {
  assert(Number.isInteger(batchSize) && batchSize >= 150 && batchSize <= 240, 'Use 150–240 frames per checkpoint batch.');
  assert(!props.previewOnlySeed && props.captionsStatus === 'verified', 'Checkpoint export requires verified actual narration.');
  assert(composition.fps === 30 && composition.width === 1080 && composition.height === 1920, 'Checkpoint export requires the approved 1080×1920 / 30fps composition.');
  const mix = audioMix(studio, composition, props);
  const { fingerprint, fingerprintInput } = makeFingerprint({ studio, serveUrl, composition, props, mediaChecks, brand });
  const frameDir = within(resolve(studio, 'out/presenter-frames'), fingerprint);
  mkdirSync(frameDir, { recursive: true });
  const manifestPath = resolve(frameDir, 'checkpoint.json');
  const count = composition.durationInFrames;
  const digits = String(count - 1).length;
  const framePath = (frame) => resolve(frameDir, `frame-${String(frame).padStart(digits, '0')}.jpeg`);
  const validBytes = (bytes) => validateCheckpointJpeg(bytes, composition.width, composition.height);
  const validFrame = (frame) => { try { return validBytes(readFileSync(framePath(frame))); } catch { return false; } };
  const writeFrame = (frame, bytes) => {
    assert(Number.isInteger(frame) && frame >= 0 && frame < count && validBytes(bytes), `Incomplete JPEG for frame ${frame}.`);
    const path = framePath(frame); writeFileSync(`${path}.part`, bytes); renameSync(`${path}.part`, path);
  };
  // Any incoming frame survived Remotion's error cleanup because outputDir is
  // owned here, outside Remotion's temporary asset directory.
  for (const name of readdirSync(frameDir)) {
    const match = /^incoming-(\d+)\.jpeg$/.exec(name);
    if (!match) continue;
    const frame = Number(match[1]); const path = resolve(frameDir, name); const bytes = readFileSync(path);
    if (frame < count && validBytes(bytes)) { if (!validFrame(frame)) writeFrame(frame, bytes); unlinkSync(path); }
  }
  const previous = existsSync(manifestPath) ? json(manifestPath) : null;
  assert(!previous || previous.fingerprint === fingerprint, 'Checkpoint fingerprint mismatch.');
  const manifest = previous || { version: 1, createdAt: new Date().toISOString(), fingerprint, fingerprintInput, frameCount: count, dimensions: [composition.width, composition.height], batchSize, batches: [] };
  const save = (status) => { manifest.status = status; manifest.updatedAt = new Date().toISOString(); atomicJson(manifestPath, manifest); };
  const scanMissing = () => Array.from({ length: count }, (_, i) => i).filter((frame) => !validFrame(frame));
  console.log(`Durable frames: ${frameDir}`);
  save('rendering');
  try {
    // EndCard has no changing pixels after its ten-frame reveal: Lane is
    // explicitly stationary, terrain is static, and reveal() clamps to one.
    // Still require three independently rendered checkpoints to be byte-equal.
    if (!manifest.staticHold) {
      const first = Math.round(props.narrationSeconds * composition.fps) + 10;
      const points = [first, Math.floor((first + count - 1) / 2), count - 1];
      const hashes = [];
      for (const frame of points) {
        const browser = await openBrowser('chrome', { logLevel: 'error' });
        try {
          const rendered = await renderStill({ serveUrl, composition, inputProps: props, envVariables: {}, puppeteerInstance: browser, port: await freshPort(), frame, output: null, imageFormat: 'jpeg', jpegQuality: 80, scale: 1, offthreadVideoThreads: 1, offthreadVideoCacheSizeInBytes: 512 * 1024 * 1024, timeoutInMilliseconds: 120000, logLevel: 'error' });
          assert(rendered.buffer, 'Static-hold check returned no pixels.');
          writeFrame(frame, rendered.buffer); hashes.push(hash(rendered.buffer));
        } finally { await browser.close({ silent: true }); }
      }
      manifest.staticHold = { checkedAt: new Date().toISOString(), checkFrames: points, hashes, matched: hashes.every((value) => value === hashes[0]), firstFrame: first, lastFrame: count - 1, sourceReview: 'EndCard is static after reveal frame 10; stationary Lane and static terrain. Fingerprint includes the complete component source.' };
      save('rendering');
    }
    if (manifest.staticHold.matched) {
      const hold = manifest.staticHold;
      assert(validFrame(hold.firstFrame) && fileHash(framePath(hold.firstFrame)) === hold.hashes[0], 'Static-hold checkpoint changed.');
      const bytes = readFileSync(framePath(hold.firstFrame));
      for (let frame = hold.firstFrame + 1; frame <= hold.lastFrame; frame++) if (!validFrame(frame)) writeFrame(frame, bytes);
      console.log(`Verified static end card: frames ${hold.firstFrame}–${hold.lastFrame}.`);
    }
    let missing = scanMissing();
    console.log(`Resuming ${count - missing.length}/${count} complete frames; ${missing.length} remain.`);
    for (let offset = 0; offset < missing.length; offset += batchSize) {
      const requested = missing.slice(offset, offset + batchSize);
      let batchMissing = requested.filter((frame) => !validFrame(frame));
      for (let attempt = 1; batchMissing.length && attempt <= 2; attempt++) {
        const browser = await openBrowser('chrome', { logLevel: 'error' });
        const batch = { from: batchMissing[0], to: batchMissing.at(-1), requested: batchMissing.length, attempt, startedAt: new Date().toISOString() };
        manifest.batches.push(batch); save('rendering');
        let last = 0;
        let failure;
        const incomingDigits = String(batchMissing.at(-1)).length;
        try {
          await renderFrames({ serveUrl, composition, inputProps: props, envVariables: {}, puppeteerInstance: browser, port: await freshPort(), outputDir: frameDir, imageSequencePattern: 'incoming-[frame].[ext]', frames: batchMissing, imageFormat: 'jpeg', jpegQuality: 80, scale: 1, concurrency: 1, offthreadVideoThreads: 1, offthreadVideoCacheSizeInBytes: 512 * 1024 * 1024, muted: true, timeoutInMilliseconds: 120000, logLevel: 'error', onStart: ({ frameCount }) => console.log(`Checkpoint batch ${batch.from}–${batch.to}: ${frameCount} frames, attempt ${attempt}.`), onFrameUpdate: (rendered, frame) => {
            const incoming = resolve(frameDir, `incoming-${String(frame).padStart(incomingDigits, '0')}.jpeg`);
            writeFrame(frame, readFileSync(incoming)); unlinkSync(incoming);
            if (Date.now() - last > 15000 || rendered === batch.requested) { last = Date.now(); console.log(`Saved frame ${frame}; batch ${rendered}/${batch.requested}.`); }
          } });
          batch.status = 'complete';
        } catch (error) { failure = error; batch.status = 'interrupted'; batch.error = String(error.message).slice(0, 1500); }
        finally { await browser.close({ silent: true }); batch.finishedAt = new Date().toISOString(); save('rendering'); }
        batchMissing = requested.filter((frame) => !validFrame(frame));
        if (failure && batchMissing.length && attempt === 2) throw new Error(`Batch stopped after one fresh retry; completed frames remain in ${frameDir}. ${failure.message}`);
      }
      assert(batchMissing.length === 0, 'Batch left incomplete frames; rerun to resume.');
      for (const name of readdirSync(frameDir)) {
        const match = /^incoming-(\d+)\.jpeg$/.exec(name);
        if (match && validFrame(Number(match[1]))) unlinkSync(resolve(frameDir, name));
      }
    }
    missing = scanMissing();
    assert(missing.length === 0, `Refusing to encode with ${missing.length} missing/incomplete frames.`);
    manifest.completeFrames = count; save('frames-complete');
    // Input mutations after a long render must fail rather than mix versions.
    assert(makeFingerprint({ studio, serveUrl, composition, props, mediaChecks, brand }).fingerprint === fingerprint, 'Render inputs changed during checkpoint capture.');
    const finalMix = audioMix(studio, composition, props);
    assert(finalMix.manifest.sha256 === mix.manifest.sha256, 'Audio mix changed during checkpoint capture.');
    const output = within(resolve(studio, 'out'), relative(resolve(studio, 'out'), resolve(outputLocation)));
    const temporary = output.replace(/\.mp4$/i, '.partial.mp4');
    assert(temporary !== output, 'Output must use .mp4 extension.');
    console.log(`Encoding ${count} complete JPEGs and the verified ${mix.manifest.seconds}s audio mix.`);
    await runEncode(['-hide_banner', '-loglevel', 'error', '-xerror', '-y', '-threads', '2', '-f', 'image2', '-framerate', String(composition.fps), '-start_number', '0', '-i', resolve(frameDir, `frame-%0${digits}d.jpeg`), '-i', mix.path, '-map', '0:v:0', '-map', '1:a:0', '-frames:v', String(count), '-t', String(count / composition.fps), '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', '-threads:v', '2', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-ac', '2', '-movflags', '+faststart', '-progress', 'pipe:1', '-nostats', temporary]);
    const encoded = probe(temporary);
    const video = encoded.streams.find((stream) => stream.codec_type === 'video');
    const audio = encoded.streams.find((stream) => stream.codec_type === 'audio');
    assert(video && video.codec_name === 'h264' && video.width === composition.width && video.height === composition.height && Number(video.nb_frames) === count && video.r_frame_rate === `${composition.fps}/1`, 'Encoded video is incomplete or has the wrong format.');
    assert(audio && audio.codec_name === 'aac' && audio.channels === 2 && Number(audio.sample_rate) === 48000, 'Encoded audio format mismatch.');
    assert(Math.abs(Number(video.duration) - count / composition.fps) <= 1 / composition.fps, 'Encoded video duration mismatch.');
    renameSync(temporary, output);
    manifest.output = { file: slash(relative(studio, output)), sha256: fileHash(output), bytes: statSync(output).size, frameCount: count, audioMixSha256: mix.manifest.sha256, completedAt: new Date().toISOString() };
    save('complete');
    console.log(`Completed ${slash(relative(studio, output))}; checkpoints preserved.`);
    return { output, frameDir, fingerprint, manifestPath };
  } catch (error) { manifest.lastError = String(error.message).slice(0, 3000); save('interrupted'); throw error; }
};
