// Render preview stills of HfReel from the prebuilt bundle using one browser instance.
//   node scripts/hf/stills.mjs [out/hf-reel/still-frames.txt] [--scale=0.5]
// still-frames.txt: one "<name> <frame>" per line.
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const list = process.argv.find((a) => a.endsWith(".txt")) ?? path.join(root, "out/hf-reel/still-frames.txt");
const scale = Number((process.argv.find((a) => a.startsWith("--scale=")) ?? "--scale=0.5").split("=")[1]);
const serveUrl = path.join(root, "out/hf-reel/bundle");
const outDir = path.join(root, "out/hf-reel/stills");
mkdirSync(outDir, { recursive: true });

const frames = readFileSync(list, "utf8")
  .split("\n")
  .map((l) => l.trim().split(/\s+/))
  .filter((p) => p.length === 2)
  .map(([name, frame]) => ({ name, frame: Number(frame) }));

const browser = await openBrowser("chrome");
// Empty env: never expose .env values to the page (mirrors the studio's safe render pattern).
const composition = await selectComposition({ serveUrl, id: "HfReel", puppeteerInstance: browser, envVariables: {} });
for (const { name, frame } of frames) {
  const output = path.join(outDir, `${String(frame).padStart(4, "0")}-${name}.jpg`);
  await renderStill({ serveUrl, composition, frame, output, imageFormat: "jpeg", jpegQuality: 88, scale, puppeteerInstance: browser, envVariables: {}, timeoutInMilliseconds: 120000 });
  console.log("still", output);
}
await browser.close({ silent: true });
