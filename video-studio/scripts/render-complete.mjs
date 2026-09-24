/** Local Remotion render. No .env loading; the browser receives an empty environment. */
import { bundle } from "@remotion/bundler";
import {
  selectComposition,
  renderMedia,
  renderStill,
  openBrowser,
} from "@remotion/renderer";
import { enableTailwind } from "@remotion/tailwind-v4";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const studio = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = resolve(studio, "out");
const serveUrl = resolve(out, "complete-bundle");
const flags = new Set(process.argv.slice(2));
if ([...flags].some((flag) => flag !== "--stills"))
  throw new Error(
    "Use --stills for previews, or no flags for the final render.",
  );
mkdirSync(resolve(out, "qa-complete"), { recursive: true });
// Rebuild every time: a corrected AI take must replace any cached bundle copy.
{
  let last = -1;
  await bundle({
    entryPoint: resolve(studio, "src/index.ts"),
    rootDir: studio,
    publicDir: resolve(studio, "public"),
    outDir: serveUrl,
    rspack: true,
    bundlerOverride: enableTailwind,
    onProgress: (value) => {
      const step = Math.floor(value / 20);
      if (step !== last) {
        last = step;
        console.log(`Bundling ${Math.round(value)}%.`);
      }
    },
  });
}
const browser = await openBrowser("chrome", { logLevel: "error" });
try {
  const composition = await selectComposition({
    serveUrl,
    puppeteerInstance: browser,
    id: "SuperBaseComplete",
    envVariables: {},
    logLevel: "error",
  });
  const props = composition.props;
  const shots = props.shots;
  const assert = (test, message) => {
    if (!test) throw new Error(message);
  };
  assert(Array.isArray(shots), "Missing job shot list.");
  assert(
    composition.durationInFrames === 2160 && composition.fps === 30,
    "Expected exactly 72s at 30fps.",
  );
  const sourceIds = ["V01", "V02A", "V02B", "V03A", "V03B", "V03C", "V04"];
  for (const id of sourceIds)
    assert(
      shots.some((shot) => shot.sourceId === id),
      `Missing source video ${id}.`,
    );
  for (const step of [1, 2, 3, 4, 5])
    assert(
      shots.some((shot) => shot.step === step),
      `Missing process step ${step}.`,
    );
  assert(
    shots.some(
      (shot) =>
        shot.step === 3 &&
        shot.media?.ai &&
        shot.media.visibleSeconds === 3 &&
        shot.media.src === "ai/grade-levelling.mp4",
    ),
    "Step03 must limit the AI setup to its approved first3s before the grading schematic.",
  );
  assert(
    props.disclaimer ===
      "Figures indicative only. Rates, cure times and results vary with base material, climate and duty, and are confirmed by site trial and testing. Comparison vs engineered concrete hardstand.",
    "Claims Register disclaimer changed.",
  );
  let frame = 0;
  const timeline = [];
  for (const shot of shots) {
    const durationFrames = Math.round(shot.durationSeconds * composition.fps);
    const startSeconds = frame / composition.fps;
    timeline.push({
      id: shot.id,
      sourceId: shot.sourceId,
      step: shot.step,
      fromSeconds: startSeconds,
      toSeconds: (frame + durationFrames) / composition.fps,
      media: shot.media,
      caption: shot.caption,
    });
    if (shot.media) {
      const file = resolve(studio, "public", shot.media.src);
      assert(existsSync(file), `Missing media ${shot.media.src}.`);
      if (shot.media.kind === "video") {
        const metadata = JSON.parse(
          execFileSync(
            process.env.FFPROBE_PATH || "ffprobe",
            ["-v", "error", "-show_streams", "-of", "json", file],
            { encoding: "utf8", windowsHide: true },
          ),
        );
        const stream = metadata.streams.find(
          (item) => item.codec_type === "video",
        );
        const end =
          (shot.media.startSeconds || 0) +
          (shot.media.visibleSeconds ?? shot.durationSeconds);
        assert(
          end <= Number(stream.duration) + 1 / composition.fps,
          `Trim exceeds ${shot.media.src}: ${end}s.`,
        );
      }
    }
    if (shot.sourceId === "V04")
      assert(shot.step === 4, "V04 must only illustrate recorded rolling.");
    frame += durationFrames;
  }
  assert(frame === 2160, "Shot durations do not sum to72s.");
  const sourceManifest = JSON.parse(
    readFileSync(
      resolve(studio, "public/footage/complete-manifest.json"),
      "utf8",
    ),
  );
  writeFileSync(
    resolve(out, "complete-coverage.json"),
    JSON.stringify(
      {
        composition: {
          id: composition.id,
          width: composition.width,
          height: composition.height,
          fps: composition.fps,
          durationInFrames: composition.durationInFrames,
        },
        props,
        timeline,
        requiredVideos: sourceIds,
        allVideosCovered: true,
        allStepsCovered: true,
        sourceManifest: "public/footage/complete-manifest.json",
        sourceManifestVersion: sourceManifest.schemaVersion,
        renderEnvironmentVariableCount: 0,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    "Coverage passed: all seven original videos, all five steps, valid source trims, AI grading and exact disclaimer.",
  );
  if (flags.has("--stills")) {
    // One representative frame per scene exposes crop, label, step, and copy errors before a full render.
    for (const shot of timeline) {
      const frame = Math.min(
        Math.round(
          (shot.fromSeconds +
            Math.min(1.5, (shot.toSeconds - shot.fromSeconds) / 2)) *
            composition.fps,
        ),
        2159,
      );
      await renderStill({
        serveUrl,
        puppeteerInstance: browser,
        composition,
        envVariables: {},
        frame,
        output: resolve(
          out,
          `qa-complete/${String(frame).padStart(4, "0")}-${shot.id}.jpg`,
        ),
        imageFormat: "jpeg",
        scale: 0.5,
        logLevel: "error",
      });
      console.log(`Checked still: ${shot.id}.`);
    }
  } else {
    let last = 0;
    await renderMedia({
      serveUrl,
      puppeteerInstance: browser,
      composition,
      outputLocation: resolve(out, "superbase-complete.mp4"),
      envVariables: {},
      codec: "h264",
      crf: 18,
      pixelFormat: "yuv420p",
      imageFormat: "jpeg",
    concurrency: 2,
    timeoutInMilliseconds: 120000,
      x264Preset: "veryfast",
      overwrite: true,
      logLevel: "error",
      onProgress: ({ renderedFrames, encodedFrames, progress }) => {
        if (Date.now() - last > 15000 || progress === 1) {
          last = Date.now();
          console.log(
            `Frames ${renderedFrames}/2160; encoded ${encodedFrames}; ${Math.round(progress * 100)}%.`,
          );
        }
      },
    });
    console.log("Rendered out/superbase-complete.mp4.");
  }
} finally {
  await browser.close({ silent: true });
}
