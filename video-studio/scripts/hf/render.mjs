// Render the HfReel from the prebuilt bundle (npx remotion bundle src/hf-reel/index.ts --out-dir=out/hf-reel/bundle).
//   node scripts/hf/render.mjs [--out=out/hf-reel/maintain-pavements-hf-reel.mp4]
import { renderMedia, selectComposition } from "@remotion/renderer";
import { execFileSync } from "node:child_process";
import { renameSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const serveUrl = path.join(root, "out/hf-reel/bundle");
const outputLocation = path.join(
  root,
  (process.argv.find((a) => a.startsWith("--out=")) ?? "--out=out/hf-reel/maintain-pavements-hf-reel.mp4").slice(6),
);

// Empty env: the page never sees .env values (same safety rule as the studio's other renderers).
const composition = await selectComposition({ serveUrl, id: "HfReel", envVariables: {} });
let last = -1;
await renderMedia({
  serveUrl,
  composition,
  outputLocation,
  codec: "h264",
  crf: 18,
  pixelFormat: "yuv420p",
  imageFormat: "jpeg",
  jpegQuality: 92,
  audioCodec: "aac",
  audioBitrate: "320k",
  concurrency: 2,
  envVariables: {},
  timeoutInMilliseconds: 120000,
  offthreadVideoCacheSizeInBytes: 512 * 1024 * 1024,
  onProgress: ({ progress }) => {
    const pct = Math.floor(progress * 100);
    if (pct >= last + 10) {
      last = pct;
      console.log(`render ${pct}%`);
    }
  },
});
console.log("wrote", outputLocation);

// Finish for Instagram: Remotion's JPEG frames arrive as full-range BT.601 (yuvj420p). Convert to broadcast-range
// BT.709 yuv420p with explicit colour tags and move the moov atom to the front. Audio is copied untouched.
const master = outputLocation.replace(/\.mp4$/, "-master-pc.mp4");
renameSync(outputLocation, master);
execFileSync("ffmpeg", [
  "-v", "error", "-y", "-i", master,
  "-vf", "scale=in_range=pc:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709,format=yuv420p",
  "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-profile:v", "high", "-level", "4.2",
  "-color_range", "tv", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709",
  // Write the VUI colour description into the bitstream too; libx264 otherwise leaves primaries/transfer unset.
  "-bsf:v", "h264_metadata=colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1:video_full_range_flag=0",
  "-c:a", "copy", "-movflags", "+faststart", outputLocation,
]);
console.log("finished", outputLocation);
