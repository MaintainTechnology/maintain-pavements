---
type: promo
subject: "Prompts, direction and guardrails for the AI-generated parts of the SuperBase promo"
status: "v1; none of these prompts has been generated yet (other clips already on disk are listed below)"
updated: 2026-09-24
format: "portrait 9:16, 1080x1920"
ai_shots: [A1, A1b, A2, A3, A4, B1, B2, C1]
tags: [promo, superbase, ai, prompts, voiceover, music]
---

# AI Generation Prompts

Back to [[00 Home]] · [[Promo Video Brief]] · [[Script & Storyboard]] · [[Shot Library]] · [[Remotion Build Notes]] · [[Claims Register]]

AI fills only the gaps the real footage can't: the **problem** (the unbound yard going backwards, the concrete alternative), the **reframe**, and an **abstract diagram**. Every method beat, 01 to 05, uses Jon's real footage or photos. Read the Guardrails section at the end before generating anything.

## Where each AI shot is used

| ID | Shot | 30 s | 45 s | 60 s | Length used |
|---|---|---|---|---|---|
| A1 | Potholed, rutted gravel yard after rain | 0.0–3.0 | 0.0–3.0 | 0.0–3.5 | 3.0–3.5 s |
| A1b | Tyre through a muddy pothole | – | 3.0–4.5 | 3.5–5.5 | 1.5–2.0 s |
| A2 | Dust across a dry yard | – | 4.5–6.0 | 5.5–8.0 | 1.5–2.5 s |
| A3 | Grader coming back again | 3.0–4.5 | 6.0–9.5 | 8.0–11.5 | 1.5–3.5 s |
| A4 | Concrete pour, yard out of service | – | 9.5–12.0 | 11.5–14.0 | 2.5 s |
| B1 | Abstract "bind": aggregate locking tight | 4.5–6.5 | 12.0–13.5 | 14.0–15.5 | 1.5–2.0 s |
| B2 | Full-depth cross-section | – | 20.0–22.0 | 23.0–25.0 | 2.0 s |
| C1 | Product hero (optional, gated) | – | – | – | not scheduled |

## What's already on disk

`video-studio/` already holds four Veo 3.1 Fast clips (8 s each, 1080x1920, 24 fps; estimated US$3.84 in total, billed cost not yet checked), recorded in `public/ai/manifest.json` and `.veo/superbase-test.json`, plus two later "grade-levelling" takes recorded in `public/ai/grade-manifest.json` (last row below).

| File | What it is | Verdict for the public cuts |
|---|---|---|
| `public/ai/before-yard.mp4` | Text-to-video: potholed, muddy gravel yard with a plain corrugated shed. Its QA still (`out/qa/before-yard-ai.jpg`) shows a puddle in a rutted gravel surface, a plain shed and pallets, with no text visible | **Candidate for A1.** Watch every frame for text, logos and artefacts first |
| `public/ai/prepare-atmosphere.mp4` | Image-to-video from V01 at 2.0 s | **Don't use.** It's a synthetic animation of a real method frame |
| `public/ai/dose-atmosphere.mp4` | Image-to-video from V02A at 20.0 s | **Don't use**, for the same reason |
| `public/ai/roll-atmosphere.mp4` | Image-to-video from V03A at 7.0 s. Its QA still (`out/qa/roll-atmosphere-ai.jpg`) shows the CAT badge carried over from the seed frame | **Don't use**: a method frame, and a real brand mark in generated imagery |
| `public/ai/grade-levelling.mp4` (= `grade-levelling-take1.mp4`) and `grade-levelling-take2.mp4` | Added after these notes (about 15:01–15:18), with `grade-manifest.json`. Veo image-to-video seeded from `seeds/grade-reference.png`, a V01 frame of the real site (track loader with its slatted frame raised). The prompt asks the loader to drag the frame as a "levelling attachment", which V01 itself never shows. The manifest rejects both full takes (the frame morphs into bucket-like plates) and limits take 1 to a 3 s "setup" excerpt | **Don't use** in the public cuts: it animates a real method frame (Guardrails 3 and 6), sits in the step 03 method beat, and its seed frame carries the loader's CAT badge. It is used in the separate `SuperBaseComplete` build (see [[Remotion Build Notes]]) |

## Look bible (append to every photoreal prompt)

> Photoreal documentary footage, shot on a modern smartphone's wide lens, portrait 9:16, 1080x1920. Australian industrial yard: red-brown soil, grey crushed-rock gravel, eucalypt scrub, galvanised steel portal-frame sheds with corrugated roofing, star-picket fencing. Natural light, either soft overcast or hard midday sun. Muted, true-to-life colour, slight handheld drift, mild phone compression, no cinematic grading. Generic unbranded machinery in plain industrial yellow. No text, no logos, no signage, no number plates. Any workers wear full PPE (hi-vis, hard hat, boots) and stay clear of moving machinery; no faces in close-up.

**Global negative prompt (add to every photoreal shot):** text, captions, subtitles, logos, brand names, CAT badge, manufacturer decals, dealer stickers, fleet numbers, number plates, signage, watermark, faces in close-up, people without PPE, people beside moving machinery, polished concrete, fresh asphalt, finished paved yard, snow, green lawn, European or American streetscape, US-style trucks, drone shot, cartoon, CGI look, oversaturated colour, HDR halos, lens flare overload, slow-motion water droplets, dramatic storm clouds.

## A. Problem and "before" shots

### A1: Potholed, rutted yard after rain

- **Prompt:** Slow, low push-in across an unsealed gravel industrial yard after rain. Wheel ruts and potholes full of muddy brown water, loose grey stone and bull dust churned into mud along the wheel paths, standing puddles reflecting an overcast sky. A plain galvanised steel shed and a few stacked pallets in the background, a parked unbranded yellow loader far off. Quiet, flat grey light. + *look bible*
- **Negative:** global list + "flooded river, heavy rain falling, vehicles driving, people".
- **Duration:** generate 8 s, use 3.0–3.5 s from the steadiest middle.
- **Camera:** low (about 40 cm above the ground), slow forward dolly, about 0.3 m/s, slight handheld drift.
- **Tools:** Veo 3.1 text-to-video (already set up in `video-studio/scripts/generate-veo.mjs`), Kling or Runway. Or first review the existing `before-yard.mp4`.
- **Consistency:** A1 and A1b should look like the same yard. Make an approved key still first (see the tips below) and generate both from it.

### A1b: Tyre through a muddy pothole

- **Prompt:** Low side angle, close to the ground: the rear dual tyres of an unbranded white light truck roll slowly through a muddy pothole in a gravel yard, brown water and loose stone pushed out of the hole, the rut edge crumbling. Overcast light, same yard as A1. + *look bible*
- **Negative:** global list + "speeding, spray in slow motion, splash onto the lens, clean tyres".
- **Duration:** generate 5–8 s, use 1.5–2.0 s.
- **Camera:** static on the ground, tyres enter frame from the left.
- **Tools:** Kling handles heavy-vehicle physics and water well; Veo 3.1 or Runway as alternatives.
- **Consistency:** image-to-video from the A1 key still, or a still generated with the same palette.

### A2: Dust in the dry

- **Prompt:** Hot, dry afternoon. An unbranded tip truck drives slowly across a pale, loose gravel yard, trailing a plume of fine bull dust that drifts sideways across the frame towards a worker in hi-vis and a hard hat standing well back near a steel shed, seen from behind. Hard midday sun, short shadows, dry red-brown ground at the edges. + *look bible*
- **Negative:** global list + "sandstorm, desert dunes, dust covering the camera, worker's face".
- **Duration:** generate 8 s, use 1.5–2.5 s.
- **Camera:** slow lateral track left to right at walking pace, at eye height.
- **Tools:** Veo 3.1, Kling, Seedance.
- **Consistency:** hard-sun look, to sit next to V02A and V02B's daylight.

### A3: The grader coming back again

- **Prompt:** An unbranded yellow motor grader slowly re-blades a rutted, potholed gravel yard, its blade pushing a windrow of loose stone. In the background the same ruts are already reforming where trucks have turned. Repetitive, routine, slightly weary mood. Overcast or flat light. + *look bible*
- **Negative:** global list + "CAT logo, Caterpillar, brand decals on the machine, operator's face, fresh smooth finished surface".
- **Duration:** generate 8 s, use 1.5–3.5 s.
- **Camera:** slow pan following the grader from about 20 m away, safe distance, handheld drift.
- **Tools:** Kling or Veo 3.1. Check the machine closely: generators often add a real manufacturer badge to yellow graders. Reject any take with a legible logo.
- **Consistency:** the same yard as A1 if possible.

### A4: "Pour a slab?": the yard stops for weeks

- **Prompt:** Wide shot of one corner of an industrial yard taped off for a concrete slab: timber formwork, steel reinforcing mesh on bar chairs, a concrete truck's chute pouring grey concrete while two workers in full PPE screed it. Behind the barrier, yard plant sits parked and idle. Flat daylight. + *look bible*
- **Negative:** global list + "finished polished slab, cracked concrete, text on barriers, company names on the concrete truck".
- **Duration:** generate 8 s, use 2.5 s.
- **Camera:** static wide on a tripod with a very slight push-in.
- **Tools:** Veo 3.1 or Runway.
- **Note:** this illustrates Jon's p.2 point ("formwork, pour and strength gain take the area out of service for weeks"). It's not a comparison of performance, and it must not show concrete failing.

## B. Abstract "bind" transitions

### B1: Aggregate locking together

- **Prompt:** Extreme macro, slow push-in: loose angular grey crushed-rock aggregate and fine grit sit loose and separate. Moisture wicks in between the particles, and they settle and close up into a dense, tight, interlocked matrix, gaps disappearing. Soft studio-like side light, shallow depth of field, neutral grey tones, calm and controlled. Abstract and illustrative, not a site shot.
- **Negative:** text, logos, liquid pouring from a bottle, glossy wet coating, glowing effects, sparkles, cracks, hands, tools.
- **Duration:** generate 5–8 s, use 1.5–2.0 s.
- **Camera:** macro, slow push-in.
- **Tools:** Veo 3.1, Runway or Seedance. A still-image model plus an image-to-video pass works well for macro textures.
- **Label:** `AI-generated · illustrative`. It sits under the two-tone "Stop patching the yard. / Bind it.", so it reads as a metaphor, never as SuperBase's surface.

### B2: Through the full depth, not on top

**Build this as a motion graphic, not AI.** Diagrams need to be exact, and AI scrambles labels and proportions. The Remotion sketch (`DepthDiagram`) is in [[Remotion Build Notes]] §5.4. In CapCut, use two rectangles and a mask wipe. The labels are Jon's words: "ON TOP OF THE LAYER" vs "THROUGH THE FULL DEPTH", with "SCARIFIED TO AROUND 75 MM" (C3), and the caption "Illustrative diagram · not to scale".

AI alternative, only if a textured look is wanted, with all text added in the edit:

- **Prompt:** Clean technical 3D cutaway illustration, not photographic: a block of compacted grey gravel base shown in cross-section, split into two halves. Left half: a thin pale film sits only on the top surface. Right half: a pale binder tint fills evenly down through the whole layer. Neutral grey studio background, soft even light, slow rotation of 10 degrees.
- **Negative:** text, numbers, labels, logos, photoreal site, people, machinery, glowing effects.
- **Duration:** generate 5 s, use 2.0 s.
- **Tools:** Runway or Veo image-to-video from a still built in a 3D or image tool.

## C. Optional product hero (gated)

### C1: Product on site

**Don't generate this until Jon confirms what SuperBase looks like and how it's supplied** (Jon's Thinking, open question 5). An AI version would otherwise invent the product's appearance. The better option is the real V02A 0.0–2.0 IBC shot, once Jon confirms what's in the totes.

Template for after confirmation (fill the brackets from Jon's answer):

- **Prompt:** Slow push-in on [confirmed container, e.g. a 1000 L IBC tote in a steel cage on a pallet] under a galvanised steel shed in an Australian industrial yard, [confirmed liquid colour] visible through the translucent container, plain unbranded container with no label text, a yellow water cart parked out of focus behind. Soft daylight. + *look bible*
- **Negative:** global list + "label text, brand names, hazard diamonds, spilling liquid".
- **Duration:** generate 5 s, use 1.5 s.
- **Label:** `AI-generated · illustrative`.

## Tools, cost and consistency tips

| Tool | Good for | Notes |
|---|---|---|
| **Veo 3.1** (Google) | Text- and image-to-video, portrait 1080p | Already wired into `video-studio` (`npm run veo:plan`, capped runner, cost ledger). The project README records Fast 1080p at US$0.12 per output second, checked 24 Sep 2026 |
| **Kling** | Heavy machinery and water physics (A1b, A3) | Check each take for invented badges |
| **Runway** | Reference-image consistency across shots; stylised diagrams | Good for B1 and B2 alternatives |
| **Seedance** | Camera-move control, macro | A `muapi-seedance-2` skill is installed on this machine |
| **Higgsfield-style generators** | Preset camera moves over several models | A `higgsfield-generate` skill is installed on this machine |
| **Image models** (e.g. Nano Banana / Gemini image) | Key stills to approve before any video generation | `nanobanana` and `gemini-image-generator` skills are installed |

Each paid generation needs the budget owner's OK, and each run should be logged. The installed skills let Claude drive these tools, but only once accounts and keys are set up and a generation is approved.

**Consistency:**

1. **Key still first.** Generate and approve one still per shot (or one for A1 and A1b together), then animate it with image-to-video. This is cheaper than rerolling video and keeps the yard consistent.
2. **Same look bible, same light per sequence**: overcast for A1, A1b and A3; hard sun for A2.
3. **Fix the seed** where the tool exposes one, and record it. Change one variable at a time.
4. **Generate long, cut short.** 8 s generations, and use the steadiest 1.5–3.5 s from the middle; the first second often settles.
5. **Match the phone footage, not a film.** Wide-lens look, mild compression. In the edit: saturation −10 to −20, grain 8–12, no sharpening (see [[CapCut Edit Guide]] §9).
6. **Never seed the problem shots with real site frames** (V01–V03C). They would pull in the real canopy, CAT marks and real people, and make the customer's site look like the "bad" yard.
7. Generate at 24 or 30 fps. Both conform cleanly to the 30 fps timeline; don't frame-interpolate AI clips.

**Provenance log** (one row per generation, kept with the edit files):

| Date | Shot ID | Tool / model | Prompt version | Seed | Input image | Cost | File | Used in (cut, time) | Reviewer |
|---|---|---|---|---|---|---|---|---|---|

## AI voiceover direction

Use only if Jon doesn't record the VO himself (see [[Promo Video Brief]] §10). Scripts are in [[Script & Storyboard]].

- **Voice:** Australian male, about 35–55, general Australian accent (neither broad nor cultivated). Calm, confident, dry. Sounds like someone who has run plant on a yard and can also read a test report: tradie-meets-engineer.
- **Pace:** about 150 words per minute (2.5 words/s). Brisk on the problem fragments, slower and more deliberate through the method. A small pause at every "/" in the script.
- **Delivery:** statements go down at the end; no upward inflection, no salesy lift, no smile until "Bind it.", which lands flat and certain. "Sixty to seventy per cent" is said plainly, not sold.
- **Pronunciation:** SuperBase = "SOO-per-base" (one word, stress on the first syllable); CBR = "see-bee-ar"; crossfall = "CROSS-fall"; hardstand = "HARD-stand"; "per cent" as two words.
- **Delivery format:** 48 kHz WAV, dry (no music, no reverb), one file per cut plus each line as a separate take.
- **Rules:** use a voice licensed for commercial use. Never clone Jon's voice without his written consent, and never imitate a real, identifiable person.

## Music prompt

For an AI music tool whose licence allows commercial use, or as a stock-library search brief:

> Instrumental, 120 BPM, 4/4. Driving but low-key industrial underscore for a practical B2B construction advert. Muted kick on every beat, tight synth-bass pulse on eighth notes, dry closed hi-hat, sparse metallic percussion (light anvil or ratchet textures), one low analogue synth pad. Confident, understated, outdoors, Australian. No vocals, no guitar solo, no cinematic trailer booms, no EDM drop, no riser longer than two seconds. Clean ending: a single low hit with a two-second ring-out.

Structure per cut (so the hits land on the storyboard):

| Cut | Sparse pulse | Kick enters (method) | Lift | Drop to pulse | Final hit |
|---|---|---|---|---|---|
| 30 s | 0.0–6.5 | 6.5 | 17.0 (cure) | 24.0 (ask) | about 28.0 ("Bind it.") |
| 45 s | 0.0–13.5 | 13.5 | 32.0 (cure) | 38.5 (ask) | about 43.5 |
| 60 s | 0.0–15.5 | 15.5 | 35.0 (cure) | 40.5 (proof), rebuild at 45.0, drop again at 49.0 | about 56.5 |

## Guardrails

1. **Never generate results.** No AI finished SuperBase surface, no AI "after" shot of a treated yard, no AI plant driving on a finished pad, no AI lab test or CBR result. The only end-state images in the promo are real: S04B, S04A and (if Jon confirms) his cover photo.
2. **Label every AI shot.** `AI-generated · illustrative` stays on screen for every frame an AI shot is visible.
3. **Method beats are real.** Steps 01–05 use Jon's footage and photos only. No image-to-video animation of the real site frames in a public cut.
4. **No invented numbers.** Generated imagery contains no text or figures. All numbers are added in the edit and come from the [[Claims Register]]: "60–70%" with its qualifier, and "around 75 mm".
5. **No real brand marks** in generated imagery: no CAT badges, no dealer decals, no fleet numbers or number plates, no company signage, and no attempt to generate the Maintain Pavements logo (it comes from Jon's file).
6. **No identifiable people.** Any workers wear full PPE and stand clear of moving plant.
7. **No real site or customer.** Problem shots show a generic Australian yard, never one that resembles the V01–V04 canopy site.
8. **Diagrams as graphics.** Anything that explains how SuperBase works (B2) is drawn, not generated, and captioned "Illustrative diagram · not to scale".
9. **Keep provenance.** Log every generation (table above). `video-studio` already does this for its clips (`public/ai/manifest.json` and `grade-manifest.json`).
10. **Approve spend.** Every paid generation needs an explicit OK. Don't reroll endlessly; three takes per shot is plenty.
