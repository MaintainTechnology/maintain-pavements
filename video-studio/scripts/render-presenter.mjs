/** Local-only branded Reel rendering. Browser environment is always empty. */
import { bundle } from '@remotion/bundler';
import { openBrowser, renderMedia, renderStill, selectComposition } from '@remotion/renderer';
import { enableTailwind } from '@remotion/tailwind-v4';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:net';
import { renderCheckpointedPresenter } from './presenter/render-checkpointed.mjs';

const studio = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(studio, 'out');
const serveUrl = resolve(out, 'presenter-reel-bundle');
const qa = resolve(out, 'qa-presenter');
mkdirSync(qa, { recursive: true });
const flags = new Set(process.argv.slice(2));
if ([...flags].some((flag) => !['--stills', '--seed', '--ordinary'].includes(flag) && !(flag.startsWith('--only=') && flags.has('--stills'))) || (flags.has('--seed') && !flags.has('--stills')) || (flags.has('--ordinary') && flags.has('--stills'))) throw new Error('Use --stills with optional --seed and --only=intro,dose-full, no flags for durable export, or --ordinary for the non-checkpointed renderer.');
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const sha = (file) => createHash('sha256').update(readFileSync(file)).digest('hex');
const probe = (file) => JSON.parse(execFileSync(process.env.FFPROBE_PATH || 'ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', file], { encoding: 'utf8', windowsHide: true }));
const allocatedPorts = new Set();
const freshPort = async () => {
  // Never reuse a port from an earlier still: renderStill's cleanup is async.
  while (true) {
    const server = createServer();
    await new Promise((done, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', done); });
    const port = server.address().port;
    await new Promise((done, reject) => server.close((error) => error ? reject(error) : done()));
    if (!allocatedPorts.has(port)) { allocatedPorts.add(port); return port; }
  }
};
let lastBundleStep = -1;
await bundle({ entryPoint: resolve(studio, 'src/index.ts'), rootDir: studio, publicDir: resolve(studio, 'public'), outDir: serveUrl, rspack: true, bundlerOverride: enableTailwind, onProgress: (value) => { const step = Math.floor(value / 20); if (step !== lastBundleStep) { lastBundleStep = step; console.log(`Bundling ${Math.round(value)}%.`); } } });
let browser = await openBrowser('chrome', { logLevel: 'error' });
try {
  const composition = await selectComposition({ serveUrl, id: 'SuperBasePresenter', puppeteerInstance: browser, inputProps: { previewOnlySeed: flags.has('--seed') }, envVariables: {}, logLevel: 'error', timeoutInMilliseconds: 120000 });
  const props = composition.props;
  assert(composition.width === 1080 && composition.height === 1920 && composition.fps === 30, 'Expected portrait1080p at30fps.');
  assert(composition.durationInFrames === Math.round((props.narrationSeconds + props.endCardSeconds) * composition.fps), 'Duration mismatch.');
  assert(props.endCardSeconds >= 12, 'Keep the mandatory disclaimer readable for at least12s.');
  assert(props.disclaimer === 'Figures indicative only. Rates, cure times and results vary with base material, climate and duty, and are confirmed by site trial and testing. Comparison vs engineered concrete hardstand.', 'Claims Register disclaimer changed.');
  const required = ['V01', 'V02A', 'V02B', 'V03A', 'V03B', 'V03C', 'V04', 'S04A', 'S04B'];
  for (const id of required) assert(props.shots.some((shot) => shot.sourceId === id), `Missing source ${id}.`);
  for (const step of [1, 2, 3, 4, 5]) assert(props.chapters.some((chapter) => chapter.step === step), `Missing step${step}.`);
  const checks = [];
  for (const shot of props.shots) {
    if (shot.kind === 'schematic') continue;
    const path = resolve(studio, 'public', shot.src);
    assert(existsSync(path), `Missing media ${shot.src}.`);
    if (shot.kind === 'video') {
      const media = probe(path);
      const duration = Number(media.streams.find((stream) => stream.codec_type === 'video').duration);
      const sourceEnd = shot.startSeconds + shot.toSeconds - shot.fromSeconds;
      assert(sourceEnd <= duration + 1 / 30, `Trim exceeds ${shot.src}.`);
      if (shot.src === 'ai/grade-levelling.mp4') assert(shot.startSeconds === 0 && sourceEnd <= 3, 'Only the first3s of the AI levelling setup passed visual review.');
    }
    checks.push({ sourceId: shot.sourceId, file: shot.src, sha256: sha(path) });
  }
  const brand = JSON.parse(readFileSync(resolve(studio, 'public/brand/manifest.json'), 'utf8'));
  for (const asset of brand.assets) {
    assert(sha(resolve(studio, asset.target)) === asset.sha256, `Copied brand asset changed: ${asset.target}.`);
    assert(sha(resolve(studio, '..', asset.source)) === asset.sha256, `Canonical brand asset changed: ${asset.source}.`);
  }
  if (!flags.has('--stills')) {
    assert(!props.previewOnlySeed && props.captionsStatus === 'verified', 'Final output requires generated video and verified spoken subtitles.');
    const presenter = resolve(studio, 'public', props.presenter.src);
    const narration = resolve(studio, 'public', props.audio.narrationSrc);
    assert(existsSync(presenter) && existsSync(narration), 'Missing generated presenter video or mastered native narration.');
    assert(props.captions.length >= 10, 'Missing phrase-level subtitles.');
    const presenterInfo = probe(presenter);
    const video = presenterInfo.streams.find((stream) => stream.codec_type === 'video');
    assert(Number(video.duration) >= props.narrationSeconds - 0.15, 'Presenter video is shorter than the narration timeline.');
    const ledger = JSON.parse(readFileSync(resolve(studio, '.veo/presenter-reel.json'), 'utf8'));
    const selection = JSON.parse(readFileSync(resolve(studio, 'public/ai/presenter/selection.json'), 'utf8'));
    const selectedSegments = selection.selectedSegmentCount;
    assert(Number.isInteger(selectedSegments) && selectedSegments === 6 && selectedSegments <= ledger.plannedRequests, 'The selected presenter cut must contain the accepted introduction and all five process steps.');
    const accepted = Array.from({ length: selectedSegments }, (_, segmentIndex) => ledger.requests.find((record) => record.segmentIndex === segmentIndex && record.downloaded && record.qa?.status === 'accepted'));
    assert(accepted.every(Boolean), 'Every selected presenter segment requires accepted speech and visual QA before final render.');
    const finalRecord = accepted[selectedSegments - 1];
    assert(/^[a-f0-9]{64}$/.test(finalRecord.outputSha256 || ''), 'Accepted final cumulative presenter has no source hash.');
    assert(selection.sourceSha256 === finalRecord.outputSha256, 'Selection manifest does not match the accepted six-segment cumulative source.');
    const rawPresenterSource = 'ai/presenter/presenter.mp4';
    const rawPresenter = resolve(studio, 'public', rawPresenterSource);
    assert(sha(rawPresenter) === finalRecord.outputSha256, 'Raw presenter does not match the accepted final cumulative source.');
    assert(sha(resolve(studio, 'public', finalRecord.file)) === finalRecord.outputSha256, 'Accepted final cumulative source changed after QA.');
    const derivative = JSON.parse(readFileSync(resolve(studio, 'public/ai/presenter/render-manifest.json'), 'utf8'));
    assert(derivative.source === rawPresenterSource && derivative.sourceSha256 === finalRecord.outputSha256, 'Render derivative does not originate from the accepted presenter.');
    assert(derivative.output === props.presenter.src && props.presenter.src === 'ai/presenter/presenter-render.mp4', 'Composition must use the approved render derivative.');
    assert(sha(presenter) === derivative.sha256, 'Render derivative changed after its manifest was recorded.');
    const [fpsNumerator, fpsDenominator = 1] = String(derivative.fps).split('/').map(Number);
    const derivativeFps = fpsNumerator / fpsDenominator;
    assert(derivativeFps === composition.fps && video.r_frame_rate === `${composition.fps}/1` && Number(derivative.frameCount) >= Math.round(props.narrationSeconds * composition.fps) && Number(derivative.seconds) >= props.narrationSeconds - 0.15, 'Render derivative does not cover the narration at the composition frame rate.');
    checks.push({ sourceId: 'AI-PRESENTER-SOURCE', file: rawPresenterSource, sha256: finalRecord.outputSha256 });
    checks.push({ sourceId: 'AI-PRESENTER', file: props.presenter.src, sha256: sha(presenter) });
    checks.push({ sourceId: 'NARRATION', file: props.audio.narrationSrc, sha256: sha(narration) });
  }
  const report = { checkedAt: new Date().toISOString(), mode: flags.has('--seed') ? 'seed-design-preview' : flags.has('--stills') ? 'generated-scene-review' : 'final', composition: { id: composition.id, width: composition.width, height: composition.height, fps: composition.fps, durationInFrames: composition.durationInFrames }, props, allSevenVideosCovered: true, bothStillsCovered: true, allFiveStepsCovered: true, canonicalBrandAssetsVerified: true, media: checks, renderEnvironmentVariableCount: 0 };
  const reportName = flags.has('--stills') ? 'presenter-preview-coverage.json' : 'presenter-render-coverage.json';
  writeFileSync(resolve(out, reportName), JSON.stringify(report, null, 2) + '\n');
  const formatTime = (seconds) => {
    const milliseconds = Math.round(seconds * 1000);
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor(milliseconds / 60000) % 60;
    const wholeSeconds = Math.floor(milliseconds / 1000) % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(wholeSeconds).padStart(2, '0')},${String(milliseconds % 1000).padStart(3, '0')}`;
  };
  if (!flags.has('--stills')) writeFileSync(resolve(out, 'maintain-pavements-presenter-reel.srt'), props.captions.map((caption, index) => `${index + 1}\n${formatTime(caption.fromSeconds)} --> ${formatTime(caption.toSeconds)}\n${caption.text}\n`).join('\n'));
  console.log('Coverage passed: official brand assets, seven original videos, both stills, five steps and exact disclaimer.');
  if (flags.has('--stills')) {
    // An isolated browser prevents stale localhost media/cache requests from
    // outliving the short-lived compositor attached to the previous render.
    await browser.close({ silent: true });
    browser = null;
    const points = props.chapters.map((chapter) => {
      const ideal = chapter.fromSeconds + Math.min(2.2, (chapter.toSeconds - chapter.fromSeconds) / 2);
      const captions = props.captions.filter((caption) => caption.fromSeconds >= chapter.fromSeconds && caption.toSeconds <= chapter.toSeconds);
      const visible = captions.some((caption) => ideal >= caption.fromSeconds && ideal < caption.toSeconds);
      const nearest = captions.slice().sort((a, b) => Math.abs((a.fromSeconds + a.toSeconds) / 2 - ideal) - Math.abs((b.fromSeconds + b.toSeconds) / 2 - ideal))[0];
      return { name: chapter.id, second: visible || !nearest ? ideal : (nearest.fromSeconds + nearest.toSeconds) / 2 };
    });
    points.push({ name: 'dose-full', second: 20.5 });
    const grade = props.chapters.find((chapter) => chapter.step === 3);
    points.push({ name: 'grade-schematic', second: grade.toSeconds - 1 });
    points.push({ name: 'end-card', second: props.narrationSeconds + 3 });
    const only = [...flags].find((flag) => flag.startsWith('--only='))?.slice('--only='.length).split(',');
    if (only) assert(only.every((name) => points.some((point) => point.name === name)), 'Unknown preview checkpoint in --only.');
    for (const point of points.filter((point) => !only || only.includes(point.name))) {
      const started = Date.now();
      const stillBrowser = await openBrowser('chrome', { logLevel: 'error' });
      console.log(`Rendering preview: ${point.name} at ${point.second.toFixed(2)}s.`);
      try {
        await renderStill({ serveUrl, composition, puppeteerInstance: stillBrowser, port: await freshPort(), inputProps: props, envVariables: {}, frame: Math.round(point.second * composition.fps), output: resolve(qa, `${point.name}${flags.has('--seed') ? '-seed' : ''}.jpg`), imageFormat: 'jpeg', scale: 0.5, offthreadVideoThreads: 1, offthreadVideoCacheSizeInBytes: 128 * 1024 * 1024, timeoutInMilliseconds: 120000, logLevel: 'error' });
      } finally { await stillBrowser.close({ silent: true }); }
      console.log(`Preview: ${point.name} (${((Date.now() - started) / 1000).toFixed(1)}s).`);
    }
  } else {
    // Release selection's browser before starting any durable capture batch.
    await browser.close({ silent: true });
    browser = null;
    if (flags.has('--ordinary')) {
      browser = await openBrowser('chrome', { logLevel: 'error' });
      let last = 0;
      await renderMedia({ serveUrl, composition, puppeteerInstance: browser, port: await freshPort(), inputProps: props, envVariables: {}, outputLocation: resolve(out, 'maintain-pavements-presenter-reel.mp4'), codec: 'h264', crf: 18, pixelFormat: 'yuv420p', imageFormat: 'jpeg', concurrency: 1, offthreadVideoThreads: 1, offthreadVideoCacheSizeInBytes: 512 * 1024 * 1024, timeoutInMilliseconds: 120000, x264Preset: 'veryfast', overwrite: true, logLevel: 'error', onProgress: ({ renderedFrames, encodedFrames, progress }) => { if (Date.now() - last > 15000 || progress === 1) { last = Date.now(); console.log(`Frames ${renderedFrames}/${composition.durationInFrames}; encoded ${encodedFrames}; ${Math.round(progress * 100)}%.`); } } });
    } else {
      await renderCheckpointedPresenter({ studio, serveUrl, composition, props, mediaChecks: checks, brand, outputLocation: resolve(out, 'maintain-pavements-presenter-reel.mp4') });
    }
    console.log('Rendered out/maintain-pavements-presenter-reel.mp4.');
  }
} finally { if (browser) await browser.close({ silent: true }); }
