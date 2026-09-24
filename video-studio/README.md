# Maintain Pavements SuperBase video studio

## SuperBaseComplete — every source and all five steps

The new `SuperBaseComplete` composition is **72 seconds, 1080 × 1920, 30 fps**. It includes all seven original video files, both supplied surface stills, a photo-based AI levelling illustration, the four existing AI atmosphere clips, and a newly generated instrumental music bed. The previous 60-second test and its outputs remain separate.

```console
npm run normalise:complete
npm run lint
npm run preview:complete
npm run render:complete
npm run verify:complete
```

The final file is `out/superbase-complete.mp4`. `out/complete-coverage.json` records every shot, source trim and step. Verification reads the delivered file, decodes every video/audio frame, measures the exported stereo mix, and writes `out/complete-render-report.json`. Rendering and verification do not generate new media. The direct renderer passes an empty browser environment and never loads the Gemini key.

| Edit time | Coverage |
| --- | --- |
| 0–6 s | Labelled AI yard and three atmosphere shots |
| 6–11.5 s | 01 Prepare — V01 |
| 11.5–16.5 s | 02 Dose and mix — V02A |
| 16.5–24.5 s | 03 Grade to level — 3 s AI loader setup from the supplied photo, then 5 s animated grading schematic |
| 24.5–41.5 s | 04 Roll and compact — V02B, V03A, V03B, V03C and V04 |
| 41.5–49.5 s | 05 Cure and return — S04B and S04A surface stills |
| 49.5–60 s | Testing method and qualified indicative cost comparison |
| 60–72 s | Jon's contact and exact Claims Register disclaimer |

V04 duplicates the V03C action, so the edit uses distinct portions of the two files. It is rolling footage, regardless of its source folder name. The available sources do not show scarifying, mixing through depth, measured curing or return to traffic; the captions retain those limits. S04A is from a different yard. All five steps are explained without presenting missing actions or timing as recorded evidence.

The reusable zod props and rendering components are in `src/complete/`; the shot list is `src/jobs/superbase-complete.ts`. Change the job's media, trims, copy and contact to reuse it. AI disclosures remain visible throughout every generated shot. Landscape source framing preserves the complete original field of view. The instrumental bed is gently ducked under recorded machinery and fades at both ends.

### New AI media and cost records

`scripts/generate-levelling.mjs` is Node-only and uses the photo saved at `public/ai/seeds/grade-reference.png`. The separate `.veo/superbase-levelling.json` ledger preserves both the initial take and one bounded corrective take; no more than two grading requests are allowed. Both full takes failed visual review: the attachment distorted, and the corrective take invented an implausible finished pad. Only take 1's clean first three seconds are approved as a labelled loader setup. The edit then changes to a designed grading schematic for five seconds; neither rejected long action is shown. The manifests record this limited use. Ordinary reruns resume existing work; a corrective request requires the explicit `--corrective` flag. The original four-request `.veo/superbase-test.json` ledger is unchanged.

`scripts/generate-superbase-music.mjs` has a separate one-request ledger at `.veo/superbase-music.json`. The 72-second master is `public/audio/superbase-bed.wav`; its manifest records the prompt, model, cost estimate, source duration and loudness measurements. No external recording or named artist imitation was requested.

At the recorded provider rates, two 8-second Veo Standard 1080p takes cost an estimated **US$6.40**, and one Lyria track costs **US$0.08**: **US$6.48 new generation spend**, in addition to the existing US$3.84 atmosphere clips. These are estimates, not billing readback. Sanitised provenance is in `public/ai/grade-manifest.json` and `public/audio/superbase-bed.manifest.json`; actual billed amounts remain `null`. Never delete ledgers to trigger retries.

## SuperBasePromo — 60-second internal test

The reusable `SuperBasePromo` composition is 1080 × 1920 at 30 fps (1800 frames). `SuperBasePromo-Square` and `SuperBasePromo-Landscape` reuse the same job at 1080 × 1080 and 1920 × 1080. The older `PavementsProcessTemplate` remains available below.

```console
npm ci
npm run normalise
npm run veo:plan
npm run veo:generate
npm run lint
npm run render:test
npm run verify:render
```

`render:test` writes `out/test-promo.mp4`. `verify:render` checks its streams, frame count and the four generated assets, writes `out/render-report.json`, then saves an identical copy as `out/promo60.mp4`. Alternatively, `npm run render:promo60` renders directly to that filename. Rendering is local and does not call Gemini or incur generation charges. `npm run dev` opens Remotion Studio.

### Normalised real footage

`scripts/normalise-footage.mjs` reads the originals in `../videos/`, bakes orientation into upright 1080 × 1920 H.264/yuv420p at 30 fps with AAC sound, and writes `public/footage/V01.mp4` through `V03C.mp4`. V02A and V02B are actually landscape: their full field of view is preserved on charcoal panels. V04 is an excluded duplicate, not evidence of cure or return to service. `public/footage/manifest.json` records source paths, checksums, ffprobe readback and editorial provenance.

The S04B canopy still is included as a recorded site surface; its cure timing and treatment outcome are unconfirmed. Source clips are low-resolution WhatsApp exports; upscaling does not restore original phone detail.

```console
node scripts/normalise-footage.mjs --verify-only
```

### Bounded Veo generation

Use Node 22.16+ and a full FFmpeg installation on PATH (or set `FFMPEG_PATH`). Keep `GEMINI_API_KEY` in the ignored `video-studio/.env`. Do not prefix it with `REMOTION_`. The Node-only generation script is never imported by the React bundle. `remotion.config.ts` explicitly points Remotion at the empty `config/render.env`, because Remotion otherwise exposes all `.env` entries to its browser runtime. Do not override `--env-file` with the generation environment.

The fixed plan requests four eight-second, 9:16, 1080p clips with `veo-3.1-fast-generate-preview`:

| Output in `public/ai/` | Input |
| --- | --- |
| `before-yard.mp4` | Text: a potholed, muddy gravel industrial yard |
| `prepare-atmosphere.mp4` | V01 at 2.0 seconds |
| `dose-atmosphere.mp4` | V02A at 20.0 seconds |
| `roll-atmosphere.mp4` | V03A at 7.0 seconds |

The script extracts the initial frames from the originals into `public/ai/seeds/`. Outputs are illustrative atmosphere, not process or result evidence. The edit uses ten seconds total of the generated material; the four complete eight-second clips remain available on disk.

At the [Google rate checked on 24 September 2026](https://ai.google.dev/gemini-api/docs/pricing), Fast 1080p costs US$0.12 per output second: US$0.96 per successful clip and US$3.84 for all four. `.veo/superbase-test.json` records requests, operation IDs, status and **estimated** cost. Actual billed cost remains `null` because the billing account has not been queried. `public/ai/manifest.json` contains sanitised provenance and cost totals.

Every submission reserves one of four slots before the HTTP request. Failed or uncertain submissions still consume their slot; the runner never generates replacements. Running it again resumes saved operations or skips saved files. Do not delete or reset the ledger to retry. If a hard shutdown leaves `.veo/generation.lock`, check that its recorded PID is no longer running before removing only that lock; retain the ledger.

```console
node scripts/generate-veo.mjs --preflight
node scripts/generate-veo.mjs --extract-only
npm run veo:status
node scripts/verify-veo-safety.mjs
```

Preflight/status/seed extraction and the isolated safety tests submit no generation requests. Safety tests use fake credentials and mocked network calls.

### Reuse for another job

Duplicate `src/jobs/superbase-test.ts`, change its `jobId`, contact and shot list, and register it in `src/Root.tsx`. Media paths are relative to `public/`. Each shot defines duration, kind, headline/caption, step and media trim. Duration is calculated from the shot list. The zod schema fixes the Claims Register disclaimer and restricts AI shots to the opening problem/atmosphere scenes. Keep `media.ai: true` for generated media: it displays a label for every exposed frame. `motion: "reduced"` disables decorative motion.

| Time | Content |
| --- | --- |
| 0–4 s | Labelled illustrative problem yard; “Stop patching the yard. Bind it.” |
| 4–10 s | Three labelled AI atmosphere shots; the third option |
| 10–14.5 s | Step 01, V01 0–4.5 s |
| 14.5–18 s | Step 02, V02A 18.5–22 s |
| 18–22 s | Step 03, labelled grading diagram (no grading video exists) |
| 22–30 s | Step 04, V03A 5–9.5 s and V03B 5.5–9 s |
| 30–34 s | Step 05, S04B recorded site surface; timing unconfirmed |
| 34–39 s | Soaked CBR testing method, no invented result |
| 39–44 s | Qualified indicative cost comparison |
| 44–60 s | Jon’s contact and verbatim Claims Register disclaimer |

The test retains low-level original machinery audio on real video shots. AI audio is muted; there is no invented speech, voiceover or licensed music. Figtree and Inter are temporary brand stand-ins loaded by the existing Remotion font package. No logo has been reconstructed.

This is a local internal test. The handoff still lists public-use footage permissions, official logo/fonts and finished-yard evidence as unresolved; this render does not establish those. Review the [Remotion licence](https://www.remotion.dev/license) for the company before commercial use.

---

<p align="center">
  <a href="https://github.com/remotion-dev/logo">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-dark.apng">
      <img alt="Animated Remotion Logo" src="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-light.gif">
    </picture>
  </a>
</p>

Welcome to your Remotion project!

## Maintain Pavements working template

`PavementsProcessTemplate` is an internal, editable three-scene starting point: Prepare, Dose and mix, and Roll and compact. The labels and clip paths are editable in Remotion Studio. It uses the capability statement's charcoal/grey palette with Figtree and Inter as temporary font choices. The official logo and font files have not been supplied.

All nine source media files have been copied from `../videos/` into `public/footage/` for local editing. This directory is ignored by Git while footage ownership and visible-worker consent are checked. Re-copy it from `../videos/` on a fresh checkout before opening this composition. The file stored under `04-cure-and-return-to-service` is duplicate rolling footage and is not used as a curing scene.

The starter contains no quantified performance or cure-time claims. Its `Internal preview` label should remain until the final footage, copy, and publication permissions have been reviewed.

## Commands

**Install Dependencies**

```console
npm i
```

**Start Preview**

```console
npm run dev
```

**Render video**

```console
npx remotion render PavementsProcessTemplate out/process-preview.mp4
```

**Upgrade Remotion**

```console
npx remotion upgrade
```

## Docs

Get started with Remotion by reading the [fundamentals page](https://www.remotion.dev/docs/the-fundamentals).

## Help

We provide help on our [Discord server](https://discord.gg/6VzzNDwUwV).

## Issues

Found an issue with Remotion? [File an issue here](https://github.com/remotion-dev/remotion/issues/new).

## License

Note that for some entities a company license is needed. [Read the terms here](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).
