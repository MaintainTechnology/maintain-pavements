---
type: promo
subject: "How to build the 30, 45 and 60 s SuperBase cuts in the video-studio Remotion project"
status: "v1; describes the project as found on 24 Sep 2026 at 14:27"
updated: 2026-09-24
project: "maintain-pavements/video-studio"
remotion: "4.0.527"
compositions_proposed: [Promo30, Promo45, Promo60, Promo30-Square, Promo45-Square, Promo60-Square, Promo30-Landscape, Promo45-Landscape, Promo60-Landscape]
tags: [promo, superbase, remotion, build]
---

# Remotion Build Notes

Back to [[00 Home]] · [[Promo Video Brief]] · [[Script & Storyboard]] · [[Shot Library]] · [[CapCut Edit Guide]] · [[AI Generation Prompts]] · [[Brand & Visual Language]]

> [!important] The project is not a fresh scaffold
> The planning brief assumed `video-studio/` held only the Remotion template with a placeholder `MyComp`. It doesn't. As of 24 Sep 2026 14:27 it contains a working, job-driven `SuperBasePromo` build, normalised footage, four Veo-generated clips and an **internal 60 s test render** (`out/promo60.mp4`, rendered 14:13). `@remotion/google-fonts` and `@remotion/transitions` are already installed. These notes build on that code rather than starting again. Nothing in `video-studio/` was changed while writing them.

## 1. What already exists

| Path | What it does |
|---|---|
| `package.json` | Remotion 4.0.527, React 19.2.3, TypeScript 5.9.3, zod 4.5.4, `@remotion/google-fonts`, `@remotion/transitions`, `@remotion/tailwind-v4`, `@remotion/zod-types`. Scripts: `dev`, `build`, `lint` (eslint + tsc), `normalise`, `veo:plan` / `veo:generate` / `veo:status`, `render:test`, `render:promo60`, `verify:render`, `verify:veo` |
| `remotion.config.ts` | rspack, JPEG frames, overwrite on, Tailwind v4. `Config.setDotEnvLocation("./config/render.env")` keeps the Gemini key in `.env` out of the browser bundle |
| `src/Root.tsx` | Registers `SuperBasePromo` (1080x1920), `SuperBasePromo-Square` (1080x1080) and `SuperBasePromo-Landscape` (1920x1080) from one job, with the duration computed from the shot list; plus the older `PavementsProcessTemplate` (1280x720) |
| `src/superbase/schema.ts` | zod schema. The disclaimer is a `z.literal` of the [[Claims Register]] micro-disclaimer. A `superRefine` allows AI media only on `problem` and `intro` shots. `getPromoDurationInFrames()` sums the shots |
| `src/superbase/theme.ts` | Brand palette, Figtree (600/700/800) and Inter (400/500/600) via `@remotion/google-fonts`, a layout hook (portrait / square / landscape), the entrance animation and a reduced-motion switch |
| `src/superbase/components.tsx` | `Kicker`, `TwoToneHeadline`, `StepCounter`, `BrandHeader`, `TextLines`, `EndCard` (contact plus disclaimer) |
| `src/superbase/SuperBasePromo.tsx` | `Media` (`OffthreadVideo` or `Img`), `AiLabel`, `FootageScene` (portrait: 135 px charcoal header plus a 650–710 px charcoal copy panel), `GradeDiagram` (SVG crossfall), `GraphicScene` (grade, proof and cost cards; the cost card is the **BigNumber** panel) and the `<Sequence>` loop |
| `src/jobs/superbase-test.ts` | The 13-shot, 60 s internal test job |
| `public/footage/` | `V01.mp4`…`V03C.mp4`: upright 1080x1920, constant 30 fps, H.264, AAC 48 kHz. V02A and V02B keep their full landscape frame on charcoal panels. `S04B.jpeg`, the untouched originals in sub-folders, and `manifest.json` (checksums, provenance). V04 is excluded as a duplicate. The folder is Git-ignored while consent is pending |
| `public/ai/` | Four Veo 3.1 Fast clips (8 s, 1080x1920, 24 fps): `before-yard`, `prepare-atmosphere`, `dose-atmosphere`, `roll-atmosphere`, plus seeds and `manifest.json` (estimated US$3.84; billed cost not queried) |
| `scripts/` | `normalise-footage.mjs`, `generate-veo.mjs` (hard cap of four requests, ledger in `.veo/`), `verify-render.mjs`, `verify-veo-safety.mjs`, `footage-catalog.mjs` |
| `out/` | `test-promo.mp4` and `promo60.mp4` (same file: 1080x1920, 1800 frames, 60 s), `render-report.json`, `qa/` stills and contact sheet |

`@remotion/captions` and `@remotion/media-utils` exist in `node_modules` only as transitive dependencies. If you import them directly, add them to `package.json` at 4.0.527 first.

## 2. Gap between the test render and the storyboard

| The storyboard needs | The test job has | Change |
|---|---|---|
| Three cuts: 30, 45, 60 s | One 60 s job | Three job files (§6) and nine compositions (§7) |
| VO and a 120 BPM music bed | No VO, no music; real footage at 12 % volume, AI muted | Add an `audio` block and `<Audio>` layers (§5.3) |
| Landscape V02A/V02B as a **1:1 window** | Full landscape frame letterboxed in the normalised master | `frame: "square"` + `windowX`, pointing at the landscape originals (§5.2) |
| Ken Burns push-ins on S04B, S04A and the PDF photos | Static `Img` with `objectFit: contain` | `kenBurns: [from, to]`, stills pre-cropped with ffmpeg (§4) |
| Step 03 as Jon's grader photo plus a crossfall line | SVG diagram only | Either is honest. The storyboard uses `PDF-p5_img1`; the diagram stays as the alternate |
| B2 full-depth diagram | None | New `DepthDiagram` SVG (§5.4). Built as a graphic, not AI, so the schema's AI guard stays intact |
| "Grader. Water cart. Roller. No pour." montage | None | Four short `process` shots with a one-word payoff each |
| Disclaimer for at least 6 s, starting on the ask plate | Disclaimer only on a 16 s end card | `DisclaimerStrip` from `disclaimerFromSeconds` to the end card (§5.3) |
| AI only in the problem and reframe beats | Three image-to-video "atmosphere" clips animated from real process frames (V01 2 s, V02A 20 s, V03A 7 s) | Leave them out of the public cuts. The QA still of `roll-atmosphere` shows a CAT badge carried over from its seed frame (see [[AI Generation Prompts]]) |
| Jon's step names | `StepCounter` uses "Dose + mix", "Grade", "Roll + compact", "Cure" | Optional: switch to "Dose and mix", "Grade to level", "Roll and compact", "Cure and return to service" (check the label fits at 26 px) |
| Current trim props | `startFrom` (deprecated in 4.0.527) | `trimBefore` / `trimAfter` (§5.2) |

## 3. Frame math

At 30 fps, **frame = seconds × 30**. `trimBefore` and `trimAfter` count **composition frames**, whatever the source's own frame rate, so the 24 fps Veo clips and the variable-rate WhatsApp originals use the same maths. `trimAfter` is an absolute source frame (in + length), not a length. AI in-points are shown as 0.0; move `startSeconds` to the steadiest part after review.

### Promo30 (900 frames)

| # | Shot | `public/` file | Source s | trimBefore | trimAfter | from | durationInFrames |
|---|---|---|---|---|---|---|---|
| 1 | AI-GEN A1 | `ai/before-yard.mp4` (existing candidate) | 0.0–3.0 | 0 | 90 | 0 | 90 |
| 2 | AI-GEN A3 | `ai/a3-grader.mp4` | 0.0–1.5 | 0 | 45 | 90 | 45 |
| 3 | AI-GEN B1 | `ai/b1-bind.mp4` | 0.0–2.0 | 0 | 60 | 135 | 60 |
| 4 | V01 | `footage/V01.mp4` | 0.0–3.0 | 0 | 90 | 195 | 90 |
| 5 | V02A, window x 10 | `footage/02-dose-and-mix/WhatsApp Video 2026-08-14 at 11.39.44.mp4` | 19.5–22.0 | 585 | 660 | 285 | 75 |
| 6 | PDF-p5_img1 | `stills/p5_img1-grader.png` | still | – | – | 360 | 60 |
| 7 | V02B, window x 250 | `footage/02-dose-and-mix/WhatsApp Video 2026-08-17 at 13.21.22.mp4` | 0.5–3.5 | 15 | 105 | 420 | 90 |
| 8 | S04B | `stills/S04B-9x16.png` | still | – | – | 510 | 90 |
| 9 | BigNumber (`cost`) | – | – | – | – | 600 | 120 |
| 10 | V03B | `footage/V03B.mp4` | 6.5–9.0 | 195 | 270 | 720 | 75 |
| 11 | EndCard | – | – | – | – | 795 | 105 |

Disclaimer strip: frames 720–795, then the end card's own disclaimer to 900 (6 s in total).

### Promo45 (1350 frames)

| # | Shot | `public/` file | Source s | trimBefore | trimAfter | from | durationInFrames |
|---|---|---|---|---|---|---|---|
| 1 | AI-GEN A1 | `ai/before-yard.mp4` | 0.0–3.0 | 0 | 90 | 0 | 90 |
| 2 | AI-GEN A1b | `ai/a1b-mud.mp4` | 0.0–1.5 | 0 | 45 | 90 | 45 |
| 3 | AI-GEN A2 | `ai/a2-dust.mp4` | 0.0–1.5 | 0 | 45 | 135 | 45 |
| 4 | AI-GEN A3 | `ai/a3-grader.mp4` | 0.0–3.5 | 0 | 105 | 180 | 105 |
| 5 | AI-GEN A4 | `ai/a4-pour.mp4` | 0.0–2.5 | 0 | 75 | 285 | 75 |
| 6 | AI-GEN B1 | `ai/b1-bind.mp4` | 0.0–1.5 | 0 | 45 | 360 | 45 |
| 7 | V01 | `footage/V01.mp4` | 0.0–3.0 | 0 | 90 | 405 | 90 |
| 8 | V01 | `footage/V01.mp4` | 15.0–16.0 | 450 | 480 | 495 | 30 |
| 9 | V02A, window x 10 | V02A original | 19.5–22.0 | 585 | 660 | 525 | 75 |
| 10 | GFX B2 (`depth`) | – | – | – | – | 600 | 60 |
| 11 | PDF-p5_img1 | `stills/p5_img1-grader.png` | still | – | – | 660 | 60 |
| 12 | V02B, window x 250 | V02B original | 0.5–3.5 | 15 | 105 | 720 | 90 |
| 13 | V03B | `footage/V03B.mp4` | 5.0–7.0 | 150 | 210 | 810 | 60 |
| 14a | PDF-p5_img3 "Grader." | `stills/p5_img3-grader.png` | still | – | – | 870 | 15 |
| 14b | V02A "Water cart.", window x 60 | V02A original | 23.0–24.0 | 690 | 720 | 885 | 30 |
| 14c | V03C "Roller." | `footage/V03C.mp4` | 0.0–0.5 | 0 | 15 | 915 | 15 |
| 14d | V02B "No pour.", window x 250 | V02B original | 21.0–22.0 | 630 | 660 | 930 | 30 |
| 15 | S04B | `stills/S04B-9x16.png` | still | – | – | 960 | 90 |
| 16 | BigNumber | – | – | – | – | 1050 | 105 |
| 17 | V03C | `footage/V03C.mp4` | 14.5–18.0 | 435 | 540 | 1155 | 105 |
| 18 | EndCard | – | – | – | – | 1260 | 90 |

Disclaimer strip: frames 1155–1260, then the end card to 1350 (6.5 s).

### Promo60 (1800 frames)

| # | Shot | `public/` file | Source s | trimBefore | trimAfter | from | durationInFrames |
|---|---|---|---|---|---|---|---|
| 1 | AI-GEN A1 | `ai/before-yard.mp4` | 0.0–3.5 | 0 | 105 | 0 | 105 |
| 2 | AI-GEN A1b | `ai/a1b-mud.mp4` | 0.0–2.0 | 0 | 60 | 105 | 60 |
| 3 | AI-GEN A2 | `ai/a2-dust.mp4` | 0.0–2.5 | 0 | 75 | 165 | 75 |
| 4 | AI-GEN A3 | `ai/a3-grader.mp4` | 0.0–3.5 | 0 | 105 | 240 | 105 |
| 5 | AI-GEN A4 | `ai/a4-pour.mp4` | 0.0–2.5 | 0 | 75 | 345 | 75 |
| 6 | AI-GEN B1 | `ai/b1-bind.mp4` | 0.0–1.5 | 0 | 45 | 420 | 45 |
| 7 | V01 | `footage/V01.mp4` | 0.0–3.5 | 0 | 105 | 465 | 105 |
| 8 | V01 | `footage/V01.mp4` | 7.0–8.5 | 210 | 255 | 570 | 45 |
| 9 | V02A, window x 10 | V02A original | 19.5–22.0 | 585 | 660 | 615 | 75 |
| 10 | GFX B2 (`depth`) | – | – | – | – | 690 | 60 |
| 11 | PDF-p5_img1 | `stills/p5_img1-grader.png` | still | – | – | 750 | 75 |
| 12 | V02B, window x 250 | V02B original | 0.5–3.5 | 15 | 105 | 825 | 90 |
| 13 | V03A | `footage/V03A.mp4` | 5.5–7.0 | 165 | 210 | 915 | 45 |
| 14a | PDF-p5_img3 "Grader." | `stills/p5_img3-grader.png` | still | – | – | 960 | 15 |
| 14b | V02A "Water cart.", window x 60 | V02A original | 23.0–24.0 | 690 | 720 | 975 | 30 |
| 14c | V03C "Roller." | `footage/V03C.mp4` | 0.0–0.5 | 0 | 15 | 1005 | 15 |
| 14d | V02B "No pour.", window x 250 | V02B original | 21.0–22.0 | 630 | 660 | 1020 | 30 |
| 15 | S04B | `stills/S04B-9x16.png` | still | – | – | 1050 | 90 |
| 16 | S04A | `stills/S04A-9x16.png` | still | – | – | 1140 | 75 |
| 17 | Proof card (`proof`) | – | – | – | – | 1215 | 135 |
| 18 | BigNumber | – | – | – | – | 1350 | 120 |
| 19 | V03C | `footage/V03C.mp4` | 14.5–17.0 | 435 | 510 | 1470 | 75 |
| 20 | V03B | `footage/V03B.mp4` | 6.5–10.0 | 195 | 300 | 1545 | 105 |
| 21 | EndCard | – | – | – | – | 1650 | 150 |

Disclaimer strip: frames 1545–1650, then the end card to 1800 (8.5 s).

## 4. Media to add to `public/`

```text
public/
  footage/…                          existing (normalised portrait masters + landscape originals)
  stills/p5_img1-grader.png          from Assets/PDF/PDF-p5_img1.jpeg
  stills/p5_img3-grader.png          from Assets/PDF/PDF-p5_img3.jpeg
  stills/S04B-9x16.png               from Assets/Stills/S04B - WhatsApp Image 2026-08-22 13.08.43.jpeg
  stills/S04A-9x16.png               from Assets/Stills/S04A - image (2).png
  ai/a1b-mud.mp4, a2-dust.mp4, a3-grader.mp4, a4-pour.mp4, b1-bind.mp4   (A1 can reuse before-yard.mp4)
  audio/vo-30.wav, vo-45.wav, vo-60.wav, music-120bpm.wav
```

Pre-crop the stills once, so the component only has to fill a box (run from `maintain-pavements/`, output into `video-studio/public/stills/`):

```bash
V=MaintainPavements/Assets; O=video-studio/public/stills; mkdir -p "$O"
ffmpeg -i "$V/PDF/PDF-p5_img1.jpeg" -vf "crop=460:460:0:35,scale=1080:1080:flags=lanczos" "$O/p5_img1-grader.png"   # grader, tank logo excluded
ffmpeg -i "$V/PDF/PDF-p5_img3.jpeg" -vf "crop=460:460:0:100,scale=1080:1080:flags=lanczos" "$O/p5_img3-grader.png"
ffmpeg -i "$V/Stills/S04B - WhatsApp Image 2026-08-22 13.08.43.jpeg" -vf "crop=457:813:212:0,scale=1080:1920:flags=lanczos" "$O/S04B-9x16.png"
ffmpeg -i "$V/Stills/S04A - image (2).png" -vf "crop=638:1135:187:60,scale=1080:1920:flags=lanczos" "$O/S04A-9x16.png"   # top 60 px (skip lettering) dropped
```

Reference everything with `staticFile("stills/S04B-9x16.png")`. The existing code already uses `staticFile` with the WhatsApp filenames, spaces included, so the landscape originals can be referenced as they are.

## 5. Code changes (sketches against the existing files)

### 5.1 Brand tokens (already in `theme.ts`)

```ts
export const palette = {
  charcoal: "#25282A", panel: "#2F3233", ink: "#26282B", slate: "#5C6670",
  grey: "#99A1A7", paper: "#F5F4F1", white: "#FFFFFF", rule: "#52585C",
} as const;
// Figtree (headlines) and Inter (body) are loaded with @remotion/google-fonts in the same file.
```

### 5.2 Schema and `Media`: trims, 1:1 window, Ken Burns

```ts
// schema.ts: extend the media object and the shot kinds
export const SuperBaseMediaSchema = z.object({
  src: z.string().min(1),
  kind: z.enum(["video", "image"]),
  startSeconds: z.number().min(0).default(0),
  ai: z.boolean(),
  frame: z.enum(["full", "square"]).default("full"),
  // Square video only: left edge, in source px, of a 576x576 window in a 1024x576 original.
  windowX: z.number().min(0).max(448).default(0),
  kenBurns: z.tuple([z.number(), z.number()]).default([1, 1]),
});
// …and add "depth" to the shot `kind` enum.
```

```tsx
// SuperBasePromo.tsx: replaces the existing Media. FootageScene passes
// durationInFrames={Math.round(shot.durationSeconds * fps)}.
const Media: React.FC<{ shot: SuperBaseShot; volume: number; durationInFrames: number }> = ({
  shot, volume, durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { portrait } = usePromoLayout();
  const media = shot.media;
  if (!media) return null;

  // ponytail: the window is portrait-only; square/landscape compositions keep the existing split layout.
  const square = media.frame === "square" && portrait;
  const zoom = interpolate(frame, [0, durationInFrames], media.kenBurns, { extrapolateRight: "clamp" });
  const trimBefore = Math.round(media.startSeconds * fps);
  const trimAfter = trimBefore + durationInFrames; // absolute source frame
  const sound = { volume: media.ai ? 0 : volume, muted: media.ai || volume === 0 };
  const K = 1080 / 576; // 576 source px -> 1080 px

  const content =
    media.kind === "image" ? (
      <Img src={staticFile(media.src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    ) : (
      <OffthreadVideo
        src={staticFile(media.src)}
        trimBefore={trimBefore}
        trimAfter={trimAfter}
        {...sound}
        style={
          square
            ? { position: "absolute", top: 0, left: -media.windowX * K, width: 1024 * K, height: 1080 }
            : { width: "100%", height: "100%", objectFit: portrait ? "cover" : "contain" }
        }
      />
    );

  return (
    <div
      style={{
        position: "absolute",
        overflow: "hidden",
        background: palette.charcoal,
        ...(square
          ? { left: 0, top: 135, width: 1080, height: 1080 } // sits in the layout's media area (y 135–1215)
          : { inset: 0, left: portrait ? 0 : "51%" }),
      }}
    >
      <div style={{ position: "absolute", inset: 0, transform: `scale(${zoom})` }}>{content}</div>
    </div>
  );
};
```

### 5.3 Audio and the disclaimer strip

```ts
// schema.ts: on SuperBasePromoSchema
audio: z.object({ vo: z.string().optional(), music: z.string().optional() }).default({}),
voLines: z.array(z.tuple([z.number(), z.number()])).default([]), // [start, end] s, for ducking
disclaimerFromSeconds: z.number().min(0).optional(), // optional, so the existing test job still parses
```

```tsx
// components.tsx
export const DisclaimerStrip: React.FC<{ text: string }> = ({ text }) => {
  const { margin, scale, portrait } = usePromoLayout();
  return (
    <div
      style={{
        position: "absolute", left: margin, right: margin, bottom: margin,
        borderTop: `1px solid ${palette.rule}`, paddingTop: 27 * scale,
        fontFamily: bodyFont, fontSize: (portrait ? 30 : 26) * scale, lineHeight: 1.5, color: "#D0D3D5",
      }}
    >
      {text}
    </div>
  );
};

// SuperBasePromo.tsx: in the component body (fps is already read there with useVideoConfig)
const starts = props.shots.reduce<number[]>(
  (acc, _s, i) => [...acc, i === 0 ? 0 : acc[i - 1] + Math.round(props.shots[i - 1].durationSeconds * fps)], [],
);
const endStart = starts[props.shots.findIndex((s) => s.kind === "end")];
// ponytail: step duck; if the jump is audible, pre-mix the bed instead.
const talking = (t: number) => props.voLines.some(([a, b]) => t > a - 0.15 && t < b + 0.25);

// …and in the JSX, after the shot loop inside the root AbsoluteFill:
{props.audio.vo ? <Audio src={staticFile(props.audio.vo)} /> : null}
{props.audio.music ? (
  <Audio src={staticFile(props.audio.music)} volume={(f) => (talking(f / fps) ? 0.18 : 0.5)} />
) : null}
{props.disclaimerFromSeconds !== undefined && endStart !== undefined ? (
  <Sequence
    from={Math.round(props.disclaimerFromSeconds * fps)}
    durationInFrames={endStart - Math.round(props.disclaimerFromSeconds * fps)}
    name="disclaimer-strip"
  >
    <DisclaimerStrip text={props.disclaimer} />
  </Sequence>
) : null}
```

Add `Audio` to the `remotion` import in `SuperBasePromo.tsx`. Give the ask-plate shot an empty `caption` so it doesn't collide with the strip. The end card already prints the disclaimer, so the strip stops where the end card starts. Take the `voLines` from the recorded VO's real timings, not the script windows.

### 5.4 Full-depth diagram (B2)

```tsx
// SuperBasePromo.tsx: render in GraphicScene when shot.kind === "depth" (route "depth" to GraphicScene)
const DepthDiagram: React.FC = () => {
  const frame = useCurrentFrame();
  const fill = interpolate(frame, [8, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const label = { fontFamily: bodyFont, fontSize: 22, letterSpacing: 2 } as const;
  return (
    <svg viewBox="0 0 900 420" width="100%" aria-label="Illustrative diagram: binder through the full depth of the layer">
      <rect x="20" y="120" width="400" height="220" fill="#DBDDDA" />
      <rect x="20" y="120" width="400" height="14" fill={palette.slate} />
      <text x="20" y="385" fill={palette.slate} {...label}>ON TOP OF THE LAYER</text>
      <rect x="480" y="120" width="400" height="220" fill="#DBDDDA" />
      <rect x="480" y="120" width="400" height={220 * fill} fill={palette.slate} opacity={0.55} />
      <text x="480" y="385" fill={palette.ink} {...label}>THROUGH THE FULL DEPTH</text>
      <path d="M892 120 V340 M884 120 H900 M884 340 H900" stroke={palette.ink} strokeWidth="2" />
      <text x="480" y="95" fill={palette.slate} {...label}>SCARIFIED TO AROUND 75 MM</text>
    </svg>
  );
};
```

The labels are Jon's own words (p.3: binder "through the full depth of the layer rather than on top of it"; C3 "around 75 mm"). Set the shot's caption to "Illustrative diagram · not to scale".

## 6. Job files

`src/jobs/promo30.ts` in full. `promo45.ts` and `promo60.ts` follow the same pattern with the rows from §3 and the copy from [[Script & Storyboard]].

```ts
import { CLAIMS_REGISTER_DISCLAIMER, SuperBasePromoSchema, getPromoDurationInFrames } from "../superbase/schema";

const V02A = "footage/02-dose-and-mix/WhatsApp Video 2026-08-14 at 11.39.44.mp4";
const V02B = "footage/02-dose-and-mix/WhatsApp Video 2026-08-17 at 13.21.22.mp4";
const how = "How it is built";

export const promo30Job = SuperBasePromoSchema.parse({
  jobId: "promo30",
  contact: { name: "Jon Pepper", phone: "0414 530 836", email: "jon@maintain.com.au", website: "maintain.com.au" },
  disclaimer: CLAIMS_REGISTER_DISCLAIMER,
  realFootageVolume: 0.12,
  audio: { vo: "audio/vo-30.wav", music: "audio/music-120bpm.wav" },
  voLines: [], // fill from the recorded VO
  disclaimerFromSeconds: 24,
  shots: [
    { id: "a1-yard", kind: "problem", durationSeconds: 3, media: { src: "ai/before-yard.mp4", kind: "video", ai: true },
      kicker: "The maintenance cycle", setup: "The yard never actually", payoff: "gets finished." },
    { id: "a3-grader", kind: "problem", durationSeconds: 1.5, media: { src: "ai/a3-grader.mp4", kind: "video", ai: true },
      kicker: "The maintenance cycle", setup: "The grader", payoff: "comes back." },
    { id: "b1-bind", kind: "intro", durationSeconds: 2, media: { src: "ai/b1-bind.mp4", kind: "video", ai: true },
      kicker: "There is a third option", setup: "Stop patching the yard.", payoff: "Bind it." },
    { id: "01-V01", kind: "process", step: 1, durationSeconds: 3,
      media: { src: "footage/V01.mp4", kind: "video", startSeconds: 0, ai: false },
      kicker: how, setup: "Uses the base", payoff: "you already have." },
    { id: "02-V02A", kind: "process", step: 2, durationSeconds: 2.5,
      media: { src: V02A, kind: "video", startSeconds: 19.5, frame: "square", windowX: 10, ai: false },
      kicker: how, setup: "Dose", payoff: "and mix." },
    { id: "03-grader", kind: "process", step: 3, durationSeconds: 2,
      media: { src: "stills/p5_img1-grader.png", kind: "image", frame: "square", kenBurns: [1, 1.08], ai: false },
      kicker: how, setup: "Trimmed to level", payoff: "and crossfall." },
    { id: "04-V02B", kind: "process", step: 4, durationSeconds: 3,
      media: { src: V02B, kind: "video", startSeconds: 0.5, frame: "square", windowX: 250, ai: false },
      kicker: how, setup: "Compaction builds", payoff: "the bond.", caption: "04 — Wet rolling to final compaction" },
    { id: "05-S04B", kind: "surface", step: 5, durationSeconds: 3,
      media: { src: "stills/S04B-9x16.png", kind: "image", kenBurns: [1, 1.08], ai: false },
      kicker: how, setup: "Back in service within hours,", payoff: "not weeks.", body: "Cure times vary by site." },
    { id: "value", kind: "cost", durationSeconds: 4, kicker: "Indicative unit-rate comparison",
      setup: "60–70%*", payoff: "Indicatively below\nengineered concrete\nhardstand." },
    { id: "ask-V03B", kind: "process", durationSeconds: 2.5,
      media: { src: "footage/V03B.mp4", kind: "video", startSeconds: 6.5, ai: false },
      kicker: "Jon Pepper · 0414 530 836", setup: "Nominate", payoff: "one area.", caption: "" },
    { id: "end", kind: "end", durationSeconds: 3.5, kicker: "A site trial is the next step",
      setup: "Stop patching the yard.", payoff: "Bind it.", body: "" },
  ],
});

// ponytail: the one check. Fails at bundle time if the shot list drifts from the storyboard.
if (getPromoDurationInFrames(promo30Job) !== 900) throw new Error("Promo30 must be exactly 900 frames");
```

The existing cost card prints the C1 qualifier ("Indicative. Varies with base material, climate and duty. Confirmed by site trial.") on its own, and the schema's AI guard already rejects AI media on anything but `problem` and `intro` shots.

## 7. Registering the compositions

```tsx
// Root.tsx: add alongside the existing SuperBasePromo test compositions
import { Composition } from "remotion";
import { SuperBasePromo, SuperBasePromoSchema, getPromoDurationInFrames } from "./superbase";
import { promo30Job } from "./jobs/promo30";
import { promo45Job } from "./jobs/promo45";
import { promo60Job } from "./jobs/promo60";

const cuts = [["Promo30", promo30Job], ["Promo45", promo45Job], ["Promo60", promo60Job]] as const;
const formats = [["", 1080, 1920], ["-Square", 1080, 1080], ["-Landscape", 1920, 1080]] as const;

export const PromoCompositions: React.FC = () => (
  <>
    {cuts.flatMap(([id, job]) =>
      formats.map(([suffix, width, height]) => (
        <Composition
          key={id + suffix}
          id={id + suffix}
          component={SuperBasePromo}
          schema={SuperBasePromoSchema}
          defaultProps={job}
          fps={30}
          width={width}
          height={height}
          durationInFrames={getPromoDurationInFrames(job)}
        />
      )),
    )}
  </>
);
// …then render <PromoCompositions /> inside RemotionRoot.
```

The square and landscape compositions reuse the existing split layouts (media in the right-hand 49 %, copy on charcoal at the left), which is the brief's 16:9 strategy. If the 1:1 cut becomes a priority, give it its own layout; the CapCut guide has per-shot square windows.

## 8. Render and check

```bash
cd video-studio
npm run lint                                  # eslint + tsc (the 900/1350/1800-frame checks throw when Studio or a render loads the bundle)
npx remotion render Promo30 out/promo30.mp4 --codec=h264 --crf=18 --pixel-format=yuv420p --concurrency=2
npx remotion render Promo45 out/promo45.mp4 --codec=h264 --crf=18 --pixel-format=yuv420p --concurrency=2
npx remotion render Promo60 out/promo60-v2.mp4 --codec=h264 --crf=18 --pixel-format=yuv420p --concurrency=2
npx remotion render Promo30-Square out/promo30-1x1.mp4 --codec=h264 --crf=18 --pixel-format=yuv420p
npx remotion render Promo60-Landscape out/promo60-16x9.mp4 --codec=h264 --crf=18 --pixel-format=yuv420p
npx remotion still Promo30 out/qa/promo30-end.png --frame=870    # proof the end card and disclaimer
```

- Don't write to `out/promo60.mp4`: `verify:render` copies the internal test render there.
- Remotion doesn't normalise loudness. Master the VO and music files to the levels in [[CapCut Edit Guide]] §10 before dropping them in `public/audio/`.
- `npm run dev` opens Remotion Studio for scrubbing. Check every AI frame shows the label and every end card holds the disclaimer.
- Review the Remotion licence terms for company use before publishing (the project README flags this).

## 9. Remotion agent skill

There's no Remotion skill in `~/.claude/skills` on this machine (checked 24 Sep 2026). If you want Claude to make these changes, install Remotion's official agent skills first (published as `remotion-dev/skills`; the install command at the time of writing is `npx skills add remotion-dev/skills`, but check remotion.dev for the current one). They teach the agent Remotion's own conventions (sequencing, `OffthreadVideo`, fonts, rendering), which lowers the risk of API drift such as the `startFrom` → `trimBefore` rename.
