// Generates the site's section imagery with Gemini and writes WebP into assets/images.
// Usage: node scripts/generate-images.mjs [--list] [--force] [name ...]
//   --list   list the image-capable models this key can use
//   --force  regenerate even if the file exists (otherwise existing images are kept)
//   name     only (re)generate these images, e.g. `hero-yard step-04-roll`
// Paid API: existing files are skipped and only 429/5xx responses are retried.
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = fileURLToPath(new URL("..", import.meta.url));
const envFile = fileURLToPath(new URL("../../.env", import.meta.url));
if (!process.env.GEMINI_API_KEY && existsSync(envFile)) process.loadEnvFile(envFile);
const KEY = process.env.GEMINI_API_KEY;
if (!KEY) throw new Error("GEMINI_API_KEY is not set (expected in the repo-root .env)");

const MODEL = process.env.GEMINI_IMAGE_MODEL ?? "gemini-3-pro-image"; // Nano Banana Pro (GA)
const API = "https://generativelanguage.googleapis.com/v1beta";
const OUT = `${root}assets/images/`;

// Art direction from DESIGN.md › Imagery: real, unstaged, hard Australian light,
// graded slightly cool; colour comes from the site, never from the UI.
const STYLE = `Photographic style: documentary site photography for an Australian hardstand contractor. Full-frame camera, natural hard Australian daylight, crisp detail, true-to-life colour graded slightly cool toward neutral greys, never oversaturated, no HDR halo, no lens flare, no vignette. It must look real and unstaged, like a working site on a normal day. Colour comes only from what is really on site: yellow plant, orange hi-vis, red-brown soil, blue sky. All machinery, vehicles and buildings are generic and completely unbranded: no logos, no brand names, no lettering, no signage, no numbers, no fleet or tank numbers, no number plates, no watermarks and no text of any kind anywhere in the image. Any people are workers in hi-vis and hard hats seen at a distance or from behind, with no identifiable faces.`;

const SURFACE = `The finished hardstand is a bound, compacted crushed-rock base: a dense, tight, level light-grey surface with fine stone texture, matte, like a very well compacted gravel pavement that has been bound. It is not asphalt and not concrete: no joints, no cracks, no painted line markings.`;

// Jon's real photo of a treated surface: used only as a texture reference for the finished look.
const REF = "assets/source/bound-surface.png";

const IMAGES = [
  { name: "hero-yard", aspect: "16:9", width: 2400, refs: [REF], prompt: `Wide, low-angle photograph of a large, level industrial yard hardstand in front of a big steel industrial shed with two tall open roller doors, under a clear deep-blue sky with hard midday sun. ${SURFACE} The shed, a parked forklift, stacked cable drums and pallets of product sit in the right half of the frame; the left half is calm open hardstand and sky, leaving clean negative space. Camera at knee height so the level ground stretches away from the lens. Quietly engineered, finished, done.` },
  { name: "problem-yard", aspect: "4:3", prompt: `An untreated gravel industrial yard after rain, the starting point for most sites: deep tyre ruts, potholes full of brown water, loose stone and ravelled edges, red-brown mud where plant has stood and turned, uneven out-of-level ground. A yellow smooth-drum roller and a utility vehicle are parked at the far edge near a dark steel shed and gum trees. Overcast sky, flat light, a working yard that never gets finished.` },
  { name: "concrete-pour", aspect: "4:3", prompt: `A section of an industrial yard taped off and out of service for a concrete hardstand slab: timber and steel formwork, steel reinforcement mesh on bar chairs, a concrete agitator truck reversing in to pour, plastic barriers and safety fencing around the area, workers in hi-vis in the distance. Hard daylight. It shows the yard stopped while formwork, pour and strength gain happen.` },
  { name: "step-01-prepare", aspect: "4:3", prompt: `Preparing an existing gravel yard base for a bound hardstand. A yellow motor grader with its rear ripper tynes down is scarifying the existing compacted yard base to a shallow depth of about 75 mm, leaving loosened crushed rock in neat parallel furrows; loose stone and bull dust have been graded off to the side in a windrow. Industrial yard with steel sheds behind, hard morning light, long shadows.` },
  { name: "step-02-dose-mix", aspect: "4:3", prompt: `Dosing and mixing a bound hardstand. A water cart truck with a large tank and a rear spray bar sprays a fine, even curtain of water carrying a liquid bonding agent across a scarified, windrowed crushed-rock yard base, while a yellow motor grader behind it turns the damp windrow to mix the binder through the full depth of the layer. Darker damp material where it has been treated, lighter dry material ahead. Industrial yard, hard sunlight, the spray catching the light.` },
  { name: "step-03-grade", aspect: "4:3", prompt: `Grading a treated base to level. A yellow motor grader trims a damp, freshly treated crushed-rock base to design level and crossfall, its blade leaving a smooth, flat, even surface. A line of timber survey pegs with bright red flagging tape marks the levels along the edge of the pad. Wide industrial yard, clear sky, hard light that shows the subtle fall of the surface.` },
  { name: "step-04-roll", aspect: "4:3", prompt: `Wet rolling a treated base to final compaction. A yellow single smooth-drum roller works across a damp, freshly graded crushed-rock base, the drum leaving a dense, smooth, slightly glossy wet surface behind it, with a sheen of moisture on the compacted pad. Low camera angle close to the drum, steel industrial shed behind, bright daylight.` },
  { name: "step-05-cure", aspect: "4:3", refs: [REF], prompt: `A newly cured bound hardstand back in service within hours of the final roll. ${SURFACE} A forklift carrying a pallet drives across the finished surface in front of an open industrial shed, while a worker in an orange hi-vis shirt with a backpack blower clears fine dust from the edge in the foreground, seen from behind. Clear blue sky, crisp hard light.` },
  { name: "area-heavy-plant", aspect: "4:5", refs: [REF], prompt: `Heavy plant standing area in an industrial plant yard: a large yellow excavator and a yellow wheel loader parked on a hard, level, bound hardstand pad. ${SURFACE} The surface holds its shape under concentrated loads, with no ruts around the tracks or tyres. Hard afternoon light, blue sky, a red soil bank in the distance.` },
  { name: "area-stockpile", aspect: "4:5", refs: [REF], prompt: `Stockpile and bulk material apron: a yellow front-end wheel loader with a full bucket working at the toe of a large crushed-rock stockpile, on a firm, level bound apron that is not pushing out or rutting under the loader's tyres. ${SURFACE} Quarry-style setting, no dust, hard sunlight, blue sky.` },
  { name: "area-laydown", aspect: "4:5", refs: [REF], prompt: `Product and equipment laydown yard: rows of stacked steel pipe, steel beams on timber dunnage, precast concrete units and large cable drums stored on a level, bound hardstand, sitting flat without bedding in. ${SURFACE} Orderly industrial storage yard, hard light, long shadows, blue sky.` },
  { name: "area-access-lanes", aspect: "4:5", refs: [REF], prompt: `Internal access and turning lane in an industrial yard: a prime mover towing a flatbed semi-trailer turns through a wide, level yard lane. The running lines where wheels track are slightly darker from a sprayed organic top coat; the rest of the lane is a light-grey bound crushed-rock surface with no corrugations or potholes. Hard sunlight, steel sheds.` },
  { name: "area-marshalling", aspect: "4:5", prompt: `Trailer marshalling and load-out area at a transport depot just after rain: several parked semi-trailers in a neat row on a firm, level, bound crushed-rock hardstand that is damp but has no mud, no puddles and no ruts, still trafficable. Overcast sky with light breaking through, soft reflections on the damp surface.` },
  { name: "area-gate", aspect: "4:5", prompt: `Gate approach to an industrial yard: an open steel mesh gate leads out to a sealed public road, while a water cart truck lightly sprays the bound crushed-rock yard surface during routine yard watering. The approach is firm and dust-free, with no mud tracked onto the road. Morning light, blue sky, eucalyptus trees along the fence line.` },
  { name: "trial-area", aspect: "3:2", prompt: `High-angle drone photograph of a large untreated gravel industrial yard in which one single neat rectangular trial area has been freshly bound: inside the rectangle the surface is smooth, dense, level and uniformly light grey; around it the yard is rutted, potholed loose gravel with tyre tracks. The trial area is marked out with timber pegs and string line at its corners. A grader, a water cart and a roller are parked beside it. Hard daylight.` },
  { name: "yard-walk", aspect: "3:2", prompt: `Two site managers in hi-vis vests and hard hats walk across a worn gravel industrial yard; one points towards ruts and a pothole where plant turns, the other holds a clipboard. Seen from behind and slightly to the side at a distance, faces not visible. Early morning hard light, long shadows, steel sheds and parked plant in the background.` },
  { name: "cbr-lab", aspect: "4:3", prompt: `A soil testing laboratory running a California Bearing Ratio (CBR) test: a cylindrical steel CBR mould filled with a compacted crushed-rock sample sits on the platen of a load frame, a steel plunger pressing into the sample, a dial gauge mounted on the frame. Beside it a soaking tank holds more moulds submerged in water. Clean lab bench, the gloved hands of a technician at the edge of frame, no faces. Neutral window daylight, crisp detail.` },
];

async function request(path, init) {
  const res = await fetch(`${API}/${path}`, { ...init, headers: { "content-type": "application/json", "x-goog-api-key": KEY }, signal: AbortSignal.timeout(240_000) });
  if (res.ok) return res.json();
  throw Object.assign(new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 400)}`), { status: res.status });
}

async function generate({ name, aspect, width = 1800, prompt, refs = [] }) {
  const parts = [{ text: `${prompt}\n\n${STYLE}` }];
  for (const ref of refs) parts.push({ inline_data: { mime_type: "image/png", data: readFileSync(root + ref).toString("base64") } });
  if (refs.length) parts.push({ text: "The reference photo shows the real finished surface texture only. Match that surface; do not copy its framing." });
  const body = JSON.stringify({
    contents: [{ role: "user", parts }],
    generationConfig: { responseModalities: ["TEXT", "IMAGE"], imageConfig: { aspectRatio: aspect, imageSize: "2K" } },
  });
  for (let attempt = 1; ; attempt++) {
    try {
      const json = await request(`models/${MODEL}:generateContent`, { method: "POST", body });
      // Thinking models can return draft images flagged `thought`; the last real one is the answer.
      const image = json.candidates?.[0]?.content?.parts?.filter((p) => p.inlineData && !p.thought).at(-1)?.inlineData;
      if (!image) throw new Error(`no image returned (${json.candidates?.[0]?.finishReason ?? json.promptFeedback?.blockReason ?? "unknown"})`);
      await sharp(Buffer.from(image.data, "base64")).resize({ width, withoutEnlargement: true }).webp({ quality: 82 }).toFile(`${OUT}${name}.webp`);
      // The cover photo is also the social card (Next serves app/opengraph-image.jpg as og:image).
      if (name === "hero-yard") await sharp(`${OUT}${name}.webp`).resize(1200, 630, { fit: "cover" }).jpeg({ quality: 82 }).toFile(`${root}app/opengraph-image.jpg`);
      return;
    } catch (err) {
      const retryable = err.status === 429 || err.status >= 500;
      if (!retryable || attempt === 3) throw err;
      await new Promise((r) => setTimeout(r, 5000 * attempt));
    }
  }
}

const args = process.argv.slice(2);
if (args.includes("--list")) {
  const { models = [] } = await request("models?pageSize=1000");
  for (const m of models.filter((m) => /image/i.test(m.name))) console.log(m.name, "-", m.displayName);
  process.exit(0);
}

mkdirSync(OUT, { recursive: true });
const names = args.filter((a) => !a.startsWith("--"));
const todo = IMAGES.filter((img) => (names.length ? names.includes(img.name) : args.includes("--force") || !existsSync(`${OUT}${img.name}.webp`)));
console.log(`${MODEL}: generating ${todo.length} of ${IMAGES.length} images`);

const failed = [];
// ponytail: fixed pool of 3 workers; raise it if the key's rate limit allows.
await Promise.all([1, 2, 3].map(async () => {
  for (let job; (job = todo.shift()); ) {
    const t = Date.now();
    try {
      await generate(job);
      console.log(`ok   ${job.name} (${((Date.now() - t) / 1000).toFixed(0)}s)`);
    } catch (err) {
      failed.push(job.name);
      console.error(`FAIL ${job.name}: ${err.message}`);
    }
  }
}));
if (failed.length) {
  console.error(`\n${failed.length} failed: ${failed.join(" ")}`);
  process.exit(1);
}
