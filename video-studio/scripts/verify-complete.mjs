/** Verify the actual delivered all-footage render, including decode and music mix. */
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const studio = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = resolve(studio, "out/superbase-complete.mp4");
const read = (path) => JSON.parse(readFileSync(resolve(studio, path), "utf8"));
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const probe = JSON.parse(
  execFileSync(
    process.env.FFPROBE_PATH || "ffprobe",
    ["-v", "error", "-show_streams", "-show_format", "-of", "json", output],
    { encoding: "utf8", windowsHide: true },
  ),
);
const video = probe.streams.find((stream) => stream.codec_type === "video");
const audio = probe.streams.find((stream) => stream.codec_type === "audio");
assert(
  video?.codec_name === "h264" &&
    video.width === 1080 &&
    video.height === 1920 &&
    ["yuv420p", "yuvj420p"].includes(video.pix_fmt),
  "Expected upright 1080x1920 H.264 8-bit 4:2:0 video.",
);
assert(
  video.r_frame_rate === "30/1" &&
    Number(video.nb_frames) === 2160 &&
    Number(video.duration) === 72,
  "Expected 2160 video frames at30fps, exactly72s.",
);
assert(
  audio?.codec_name === "aac" &&
    audio.channels === 2 &&
    Math.abs(Number(audio.duration) - 72) < 0.1,
  "Expected72s stereo AAC music/machinery mix.",
);
assert(
  !video.side_data_list?.some((item) => item.rotation),
  "Output orientation must be baked into pixels.",
);
const coverage = read("out/complete-coverage.json");
assert(
  coverage.allVideosCovered &&
    coverage.allStepsCovered &&
    coverage.renderEnvironmentVariableCount === 0,
  "Coverage or render environment failed.",
);
const required = [
  "V01",
  "V02A",
  "V02B",
  "V03A",
  "V03B",
  "V03C",
  "V04",
  "S04A",
  "S04B",
  "AI-GRADE",
];
for (const id of required)
  assert(
    coverage.timeline.some((item) => item.sourceId === id),
    `Missing ${id}.`,
  );
for (const step of [1, 2, 3, 4, 5])
  assert(
    coverage.timeline.some((item) => item.step === step),
    `Missing step${step}.`,
  );
const grade = read("public/ai/grade-manifest.json");
const music = read("public/audio/superbase-bed.manifest.json");
const initial = read("public/ai/manifest.json");
assert(
  coverage.props.music.src === "audio/superbase-bed.wav" &&
    coverage.props.music.volume > 0,
  "Expected music in the composition.",
);
// A full decode catches truncated outputs, malformed frames and audio errors that ffprobe alone misses.
execFileSync(
  process.env.FFMPEG_PATH || "ffmpeg",
  [
    "-v",
    "error",
    "-xerror",
    "-i",
    output,
    "-map",
    "0:v:0",
    "-map",
    "0:a:0",
    "-f",
    "null",
    "-",
  ],
  {
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"],
    maxBuffer: 4 * 1024 * 1024,
  },
);
// Measure the exported mix, not just the isolated music master.
const measure = spawnSync(
  process.env.FFMPEG_PATH || "ffmpeg",
  [
    "-hide_banner",
    "-nostats",
    "-i",
    output,
    "-vn",
    "-af",
    "loudnorm=I=-20:TP=-1.5:LRA=11:print_format=json",
    "-f",
    "null",
    "-",
  ],
  { windowsHide: true, encoding: "utf8" },
);
assert(measure.status === 0, "Audio measurement failed.");
const block = measure.stderr.match(/\{\s*"input_i"[\s\S]*?\}/)?.[0];
assert(block, "Loudness measurement missing.");
const measured = JSON.parse(block);
assert(
  Number.isFinite(Number(measured.input_i)) &&
    Number(measured.input_i) > -30 &&
    Number(measured.input_tp) < -1,
  "Mix must be audible and free of clipping.",
);
// Whole-file LUFS can pass from machinery alone because silence is gated out.
// The end card has no site audio, ducking or fade during this interval, so its
// exported waveform must match the same part of the mastered music bed.
const musicCheckStartSeconds = 61;
const musicCheckDurationSeconds = 7;
const musicCheckSampleRate = 8000;
const maximumMusicOffsetSeconds = 0.05;
assert(
  !coverage.timeline.some(
    (item) =>
      item.media?.kind === "video" &&
      !item.media.ai &&
      item.fromSeconds < musicCheckStartSeconds + musicCheckDurationSeconds &&
      item.toSeconds > musicCheckStartSeconds,
  ),
  "The music-only verification interval overlaps real footage audio.",
);
function decodeMusicCheckSegment(file) {
  const raw = execFileSync(
    process.env.FFMPEG_PATH || "ffmpeg",
    [
      "-v",
      "error",
      "-nostdin",
      "-ss",
      String(musicCheckStartSeconds),
      "-i",
      file,
      "-t",
      String(musicCheckDurationSeconds),
      "-map",
      "0:a:0",
      "-vn",
      "-ac",
      "1",
      "-ar",
      String(musicCheckSampleRate),
      "-c:a",
      "pcm_f32le",
      "-f",
      "f32le",
      "-",
    ],
    { windowsHide: true, maxBuffer: 1024 * 1024 },
  );
  assert(
    raw.length === musicCheckDurationSeconds * musicCheckSampleRate * 4,
    "Music verification segment is incomplete.",
  );
  const samples = Float32Array.from({ length: raw.length / 4 }, (_, index) =>
    raw.readFloatLE(index * 4),
  );
  assert(samples.every(Number.isFinite), "Music samples must be finite.");
  return samples;
}
function rmsDBFS(samples) {
  const meanSquare =
    samples.reduce((sum, value) => sum + value * value, 0) / samples.length;
  return 10 * Math.log10(meanSquare);
}
function correlateMusic(reference, exported) {
  const maximumLag = Math.round(
    maximumMusicOffsetSeconds * musicCheckSampleRate,
  );
  let best = { correlation: -1, lagSamples: 0, fittedGain: 0 };
  for (let lag = -maximumLag; lag <= maximumLag; lag++) {
    const referenceStart = Math.max(0, -lag);
    const exportedStart = Math.max(0, lag);
    const count = Math.min(
      reference.length - referenceStart,
      exported.length - exportedStart,
    );
    let sumReference = 0,
      sumExported = 0,
      referenceEnergy = 0,
      exportedEnergy = 0,
      dot = 0;
    for (let index = 0; index < count; index++) {
      const x = reference[index + referenceStart];
      const y = exported[index + exportedStart];
      sumReference += x;
      sumExported += y;
      referenceEnergy += x * x;
      exportedEnergy += y * y;
      dot += x * y;
    }
    // Pearson correlation removes any tiny codec/DC offset; gain is checked
    // separately so a matching but inaudibly quiet signal cannot pass.
    const referenceVariance =
      referenceEnergy - (sumReference * sumReference) / count;
    const exportedVariance =
      exportedEnergy - (sumExported * sumExported) / count;
    const covariance = dot - (sumReference * sumExported) / count;
    const denominator = Math.sqrt(referenceVariance * exportedVariance);
    const correlation = denominator > 0 ? covariance / denominator : 0;
    if (correlation > best.correlation)
      best = {
        correlation,
        lagSamples: lag,
        fittedGain: covariance / referenceVariance,
      };
  }
  return best;
}
const referenceMusic = decodeMusicCheckSegment(
  resolve(studio, "public", coverage.props.music.src),
);
const exportedMusic = decodeMusicCheckSegment(output);
const referenceMusicRMS = rmsDBFS(referenceMusic);
const exportedMusicRMS = rmsDBFS(exportedMusic);
assert(
  referenceMusicRMS > -50 && exportedMusicRMS > -50,
  "The music-only end-card interval must contain audible music, not silence.",
);
const musicMatch = correlateMusic(referenceMusic, exportedMusic);
const expectedMusicGain = coverage.props.music.volume;
assert(
  musicMatch.correlation >= 0.9,
  `Exported end-card audio does not match the music master (correlation ${musicMatch.correlation.toFixed(4)}).`,
);
assert(
  Math.abs(musicMatch.fittedGain / expectedMusicGain - 1) <= 0.25,
  `Exported music gain ${musicMatch.fittedGain.toFixed(4)} differs from the expected ${expectedMusicGain}.`,
);
const musicPresence = {
  passed: true,
  fromSeconds: musicCheckStartSeconds,
  toSeconds: musicCheckStartSeconds + musicCheckDurationSeconds,
  sampleRate: musicCheckSampleRate,
  referenceFile: `public/${coverage.props.music.src}`,
  referenceRMSDBFS: referenceMusicRMS,
  exportedRMSDBFS: exportedMusicRMS,
  correlation: musicMatch.correlation,
  minimumCorrelation: 0.9,
  fittedGain: musicMatch.fittedGain,
  expectedGain: expectedMusicGain,
  maximumRelativeGainError: 0.25,
  detectedOffsetSeconds: musicMatch.lagSamples / musicCheckSampleRate,
  allowedOffsetSeconds: maximumMusicOffsetSeconds,
};
const report = {
  checkedAt: new Date().toISOString(),
  file: "out/superbase-complete.mp4",
  bytes: statSync(output).size,
  sha256: createHash("sha256").update(readFileSync(output)).digest("hex"),
  video: {
    codec: video.codec_name,
    width: video.width,
    height: video.height,
    pixelFormat: video.pix_fmt,
    fps: video.r_frame_rate,
    frames: Number(video.nb_frames),
    seconds: Number(video.duration),
  },
  audio: {
    codec: audio.codec_name,
    channels: audio.channels,
    sampleRate: Number(audio.sample_rate),
    seconds: Number(audio.duration),
    integratedLoudnessLUFS: Number(measured.input_i),
    truePeakDBTP: Number(measured.input_tp),
    musicPresence,
  },
  allFramesAndAudioDecoded: true,
  allSevenOriginalVideosCovered: true,
  allFiveStepsCovered: true,
  coverageFile: "out/complete-coverage.json",
  renderEnvironmentVariableCount: 0,
  ai: {
    levelling: grade.cost,
    music: music.cost,
    originalAtmosphereClips: initial.cost,
    billedCostUSD: null,
  },
  editorial:
    "All seven original video files and both stills are included. V04 is rolling, not cure evidence. Step03 uses3s of labelled AI loader setup, followed by5s of designed grading schematic; the distorted generated action is not shown. Scarifying and mixing through depth are not filmed. Step05 uses supplied surface stills, with timing unconfirmed. Music is AI-generated; AI video audio is muted. Exact Claims Register disclaimer is on the12s end card.",
};
writeFileSync(
  resolve(studio, "out/complete-render-report.json"),
  JSON.stringify(report, null, 2) + "\n",
);
console.log(JSON.stringify(report, null, 2));
console.log(
  "PASS: complete portrait render, source/step coverage, full decode, audible non-clipping stereo mix and matching music in the exported end card.",
);
