---
type: promo
subject: "Step-by-step CapCut desktop guide for the SuperBase promo cuts"
status: "v1"
updated: 2026-09-24
tool: "CapCut desktop (menu names vary between versions)"
canvas: "9:16, 1080x1920, 30 fps"
tags: [promo, superbase, capcut, edit]
---

# CapCut Edit Guide

Back to [[00 Home]] · [[Promo Video Brief]] · [[Script & Storyboard]] · [[Shot Library]] · [[Brand & Visual Language]] · [[Remotion Build Notes]]

This builds the three cuts in [[Script & Storyboard]] in CapCut desktop. CapCut changes its menus often, so the steps name the feature rather than an exact menu path. If a feature is missing in your version (several are Pro-only), the fallback is given.

## 0. Gather the media

| What | Use this file | Why |
|---|---|---|
| Portrait clips V01, V03A, V03B, V03C | `video-studio/public/footage/V01.mp4`, `V03A.mp4`, `V03B.mp4`, `V03C.mp4` | Already upright 1080x1920 at a constant 30 fps (Lanczos-scaled from 576x1024), so the storyboard's frame-exact in and out points line up. The originals in `videos/` are variable frame rate (about 29.93–29.99 fps average) |
| Landscape clips V02A, V02B | The **originals**: `videos/02-dose-and-mix/WhatsApp Video 2026-08-14 at 11.39.44.mp4` (V02A) and `…2026-08-17 at 13.21.22.mp4` (V02B) | The normalised V02A/V02B masters are letterboxed inside 1920 px of height, so cropping a square from them resamples twice. The originals are resampled once |
| Stills | Vault `Assets/Stills/S04B - WhatsApp Image 2026-08-22 13.08.43.jpeg`, `Assets/Stills/S04A - image (2).png`, `Assets/PDF/PDF-p5_img1.jpeg`, `Assets/PDF/PDF-p5_img3.jpeg` | The S04A and S04B vault copies match the originals' checksums. The PDF photos are the images embedded in Jon's PDF (the highest resolution we have) |
| AI shots | Generated per [[AI Generation Prompts]] (A1 has a candidate at `video-studio/public/ai/before-yard.mp4`) | Review each before use |
| VO, music, SFX | Your recorded or licensed files | See [[Promo Video Brief]] §9–10 |

**Never import V04** (`videos/04-cure-and-return-to-service/WhatsApp Video 2026-08-17 at 07.21.24.mp4`). It's a lower-bitrate duplicate of V03C.

## 1. Project setup

1. New project. Set the canvas ratio to **9:16** (the ratio control under the player).
2. In the project settings set **1080x1920 (1080p)** and **30 fps**. Set this explicitly: CapCut may otherwise adopt the first clip's frame rate (the Veo AI clips are 24 fps).
3. Make the timeline show frames (HH:MM:SS:FF), so you can type exact in and out points.
4. Background: set the canvas background to the solid colour **#25282A** (charcoal). The landscape windows and graphic cards sit on it.

**Upscaling.** The sources are 576 px wide, so every real shot is shown at about 1.875x. The normalised portrait masters are already scaled. For the landscape originals and stills, CapCut scales them. If your version has an *enhance quality* or *upscale* option, test it on V02A 19.5–22.0 and compare at 100 % zoom against plain scaling. Reject it if it adds waxy textures or invents detail (for example, readable lettering that isn't legible in the source). Whatever you choose, **keep all text as CapCut text layers** so it renders sharp at 1080 px. Don't bake text into footage before it's scaled.

## 2. Tracks and bins

- Bins: `01 Real`, `02 Stills`, `03 AI`, `04 GFX`, `05 Audio`. Rename every clip to its ID (V01, V02A, …) in the media panel.
- Track order, top to bottom: text and labels · AI labels · graphics · footage · (background colour) · natural sound · VO · music · SFX.

## 3. Trim to the exact in and out points

For each storyboard row: drop the clip on the footage track, put the playhead on the in point, **split** (Ctrl+B, or the split button) and delete the head, then do the same at the out point and delete the tail. Check the clip's length against the row.

Timecodes at 30 fps (FF = frames; 0.5 s = 15 frames):

| Span | In | Out | Length | Used in |
|---|---|---|---|---|
| V01 0.0–3.0 | 00:00:00:00 | 00:00:03:00 | 90 f | 30 s, 45 s |
| V01 0.0–3.5 | 00:00:00:00 | 00:00:03:15 | 105 f | 60 s |
| V01 7.0–8.5 | 00:00:07:00 | 00:00:08:15 | 45 f | 60 s |
| V01 15.0–16.0 | 00:00:15:00 | 00:00:16:00 | 30 f | 45 s |
| V02A 19.5–22.0 | 00:00:19:15 | 00:00:22:00 | 75 f | all |
| V02A 23.0–24.0 | 00:00:23:00 | 00:00:24:00 | 30 f | 45 s, 60 s (montage) |
| V02B 0.5–3.5 | 00:00:00:15 | 00:00:03:15 | 90 f | all |
| V02B 21.0–22.0 | 00:00:21:00 | 00:00:22:00 | 30 f | 45 s, 60 s (montage) |
| V03A 5.5–7.0 | 00:00:05:15 | 00:00:07:00 | 45 f | 60 s |
| V03B 5.0–7.0 | 00:00:05:00 | 00:00:07:00 | 60 f | 45 s |
| V03B 6.5–9.0 | 00:00:06:15 | 00:00:09:00 | 75 f | 30 s |
| V03B 6.5–10.0 | 00:00:06:15 | 00:00:10:00 | 105 f | 60 s |
| V03C 0.0–0.5 | 00:00:00:00 | 00:00:00:15 | 15 f | 45 s, 60 s (montage) |
| V03C 14.5–17.0 | 00:00:14:15 | 00:00:17:00 | 75 f | 60 s |
| V03C 14.5–18.0 | 00:00:14:15 | 00:00:18:00 | 105 f | 45 s |

The landscape originals are variable frame rate, so a trim can land one frame off after CapCut conforms them to 30 fps. That's harmless; just check the length.

## 4. Landscape clips as a 1:1 window

The storyboard shows V02A and V02B as a 576x576 window of the source, scaled to 1080x1080, on the charcoal background with the step counter and super in the panel below.

1. Select the clip and set **scale 187.5 %** (576 px of source height becomes 1080 px). The clip is now 1920 px wide, and the 1080 px canvas edges crop it to exactly a 576 px window.
2. Slide it horizontally so the storyboard's window x is at the left edge:

| Window | Shots | Horizontal move from centred |
|---|---|---|
| x 10 | V02A 19.5–22.0 | right 401 px |
| x 60 | V02A 23.0–24.0 | right 308 px |
| x 250 | V02B 0.5–3.5, V02B 21.0–22.0 | left 49 px |

   (Formula: move = (512 − x) × 1.875 − 540 px to the right. A negative result means move left.) CapCut measures position from the canvas centre; nudge once to check which direction is positive on your version.
3. Move it vertically so the square sits at **y 180–1260**, leaving a 660 px charcoal panel below for the step counter and super.

**Stills.** PDF-p5_img1 (830x529): crop to x 0–460 so the truck tank's logo is out, then scale that 460 px to fill the 1080 window. The Ken Burns push-in is scale keyframes from 100 % to 108 % of that framing over the row. S04B: fill the frame from the crop x 212–669 and push in 100→108 %. S04A: crop x 170–842 (full height), scale so the skip lettering at the top edge falls off the frame, and push in on the left scrub mark.

## 5. Speed and ramps

Everything in the storyboard runs at 100 %, so the in and out points hold. If you slow a shot, it uses less source: source used = row length × speed (a 2.5 s row at 80 % uses 2.0 s of source), so trim the tail rather than moving the in point.

| Shot | Optional change | Notes |
|---|---|---|
| V02B 0.5–3.5 | none | Keep 100 % so the drum hit (source 0.7–1.0 s) stays on the beat |
| V01 15.0–16.0 (45 s) | Curve ramp 100 % → 150 % over the last 10 frames | Throws into the cut to V02A |
| V03B 5.0–7.0 (45 s) | Ease to 85 % | Turn on smooth slow-mo (frame interpolation); watch the drum edges for warping |
| V03A 5.5–7.0 (60 s) | 90 % | Stable shot, interpolates cleanly |
| V03C 14.5–18.0 / 14.5–17.0 (end plates) | 80 % | Calm plate under text |
| V03B 6.5–10.0 / 6.5–9.0 (end plates) | 85 % | Plate under text and disclaimer |
| AI shots | none | Generated at 24 fps; don't interpolate |

## 6. Transitions

Default is a **hard cut on the beat** (120 BPM: every 0.5 s mark is a beat). Use a transition only here:

| Where | Transition | Length |
|---|---|---|
| Problem → reframe (into B1) | Blur or zoom-blur | 6–8 frames |
| V01 15.0–16.0 → V02A (45 s) | Whip or pull | 6 frames |
| V02A → B2 depth diagram | Dissolve | 8 frames |
| Into S04B (cure) | Dissolve | 10 frames (reads as time passing) |
| Into the end card | Fade through charcoal | 8 frames |
| Montage | Hard cuts only | 0 |

Alternatives kept in reserve: the V03C 10.5 s sun flare or the V03B 12.0 s flare bloom as light-leak transitions (see [[Shot Library]]).

## 7. Text styles (from [[Brand & Visual Language]])

Palette: charcoal `#25282A`, panel `#2F3233`, ink `#26282B`, slate `#5C6670`, grey `#99A1A7`, paper `#F5F4F1`, white `#FFFFFF`, rule `#52585C`. No gradients, rounded corners, drop shadows or icons. Legibility comes from the charcoal panels, not from shadows.

Fonts: **Figtree** (headlines) and **Inter** (labels, body, captions) as stand-ins until Jon supplies his. Install both from Google Fonts. If your CapCut version doesn't list local fonts, export the text cards as transparent PNGs from Remotion (see [[Remotion Build Notes]]) or Figma and place them as overlays.

| Style | Font | Size on 1080x1920 (approx.) | Colour | Other |
|---|---|---|---|---|
| Kicker | Inter SemiBold, all caps | 27 px | `#99A1A7` on dark, `#5C6670` on paper | Very wide letter spacing (about 0.13 em; CapCut spacing around 8–12). Preceded by a 48x2 px grey rule |
| Two-tone headline | Figtree ExtraBold | 100–110 px, line height 0.98 | Line 1 `#99A1A7`, line 2 `#FFFFFF` | Tight tracking (about −4 %). Left-aligned, 72 px side margin. Two text layers, or one with per-line colour |
| Step counter | "01" Figtree SemiBold 78 px + "PREPARE" Inter 26 px caps | – | White number, grey label | Under it a five-segment bar, 3 px high, active segment white, others `#52585C`, with 01–05 in 18 px under each segment |
| Photo label | Inter SemiBold caps | 25 px | `#99A1A7` | e.g. `04 — WET ROLLING TO FINAL COMPACTION` (Jon's caption) |
| Body and footnotes | Inter Regular | 29–35 px | `#D0D3D5` on charcoal | The C1 footnote and "Cure times vary by site." |
| Big number | Figtree Bold | about 230 px | White on charcoal | "60–70%\*" with the kicker above and the footnote below |
| AI label | Inter Medium | 28 px | White on a charcoal box with a 1 px `#52585C` border | Top right: `AI-generated · illustrative` |
| Captions | Inter SemiBold | 40–44 px | White on a `#25282A` box at 80 % | Two lines maximum, about 32 characters per line |

**Safe zones (9:16):** keep all text between about y 220 and y 1500 and at least 72 px from the sides. The bottom fifth and the right edge are covered by platform buttons on Reels, TikTok and Shorts. Save each style as a text preset so every beat matches.

## 8. Auto-captions (sound-off version)

1. Run CapCut's auto-captions on the **VO track only** (mute or detach the natural sound first). The clips' machine noise is exactly what fooled faster-whisper into "Thank you for watching"; don't let the captioner hear it.
2. Correct every word against the VO script in [[Script & Storyboard]]. The captions must say exactly what the Claims-checked script says.
3. Delete any caption that duplicates a super on screen at the same time.
4. Apply the caption style above and place the block at about y 1300–1450, clear of the supers.

## 9. Colour: matching mixed lighting

There are three kinds of light in the footage: warm, low backlight with flare (V03A, V03B, V03C), hard daylight under the roof (V02A, V02B), and diffuse overcast (V01), plus the AI shots and stills. Grade each group toward a common neutral look, then add one global layer.

| Group | Starting adjustments (judge by eye) |
|---|---|
| Golden / backlit: V03A, V03B, V03C | Temperature −10 to −20, highlights −25 to −35, shadows +15 to +25, saturation −5 to −10. The flares are part of the look; don't fight them, just keep the clipped areas from glowing. V03A has a small lens-ghost dot from 5.0 s: CapCut has no clone tool, so cover it with a small feathered mask on a blurred duplicate layer, or accept it |
| Hard daylight: V02A, V02B | Highlights −20 (hot sky), shadows +15 under the roof, saturation −10, and in HSL pull reds and oranges −10 to −15 so the red soil doesn't dominate. Temperature 0 to +5 |
| Overcast: V01 | Contrast +10, temperature +5, saturation −5, light sharpen after scaling |
| Stills | S04B highlights −25 (the sky is clipped and won't recover), temperature −5. S04A contrast +5, saturation −10. PDF photos: match exposure to the neighbouring clip |
| AI shots | Saturation −10 to −20, no sharpening, grain 8–12 so they aren't cleaner than the phone footage |
| Global adjustment layer | Contrast +5, grain 6–8, vignette 8–10 |

Check hi-vis orange and CAT yellow stay natural after the red and orange pull. Watch each cut once straight through for jumps between golden and daylight shots.

## 10. Audio

| Layer | Level and treatment |
|---|---|
| VO | Peaks about −6 dBFS. High-pass at 80 Hz, light compression (or the voice-enhance option if your version has it) |
| Music (120 BPM) | Start the first downbeat at 0.0. Use CapCut's beat markers to confirm the cuts. Duck about 8–10 dB under the VO with volume keyframes (or CapCut's ducking option if present) |
| Natural sound | Keep each real clip's audio about 20–26 dB below the VO, with 3–5 frame fades at every cut |
| Drum hits | Lift V02B's audio for about 0.5 s over its onset (source 0.7–1.0 s: 14.2–14.5 s in the 30 s cut, 24.2–24.5 s in the 45 s, 27.7–28.0 s in the 60 s). In the 45 s cut do the same for V03B's peak at 28.5 s |
| Alarm-like pulses | Duck them: V03A (about 1.2–9.5 s source), V03B (0–9 s), V03C (0.2–7 s and from 10.3 s). They clash with a 120 BPM track |
| AI shots | Mute the generated audio. Use licensed library SFX (rain, splash, wind, grader blade) |
| Master | About −14 LUFS integrated, true peak no higher than −1 dBTP. CapCut doesn't show LUFS, so check the export in a loudness meter |

## 11. Export

- 1080x1920, 30 fps, H.264 (HEVC only where a platform limits file size), the highest bitrate setting offered (aim for at least 12–16 Mbps), AAC audio at the highest rate offered.
- Name files per the brief: `MP-SuperBase_Promo30_9x16_v01.mp4`.
- Also export a still of each end card and check the disclaimer is readable at phone size.

## 12. Making the 1:1 and 16:9 versions

Duplicate the finished 9:16 project for each; never edit the master in place.

**1:1 (1080x1080).** Change the canvas ratio. Landscape windows and graphics stay as they are. Reposition portrait clips so the square shows these source rows:

| Shot | Square window (source y) |
|---|---|
| V01 0.0–3.5 | y 250–826 |
| V03A 5.0–9.5 | y 150–726 |
| V03B 4.5–10.0 | y 200–776 |
| V03C 0.0–4.0 | y 200–776 |
| V03C 14.5–18.0 | y 100–676 |
| S04B | x 41–854, full height |
| S04A | x 0–1034, y 150–1184 (drops the skip lettering) |

Headlines drop to about 60–64 px, and the step counter and supers move into a charcoal band across the lower third.

**16:9 (1920x1080).** Change the canvas ratio.
- Landscape clips go full-bleed at 187.5 % (no window).
- Portrait clips: use the **split panel**: the clip at full height (about 607 px wide, barely upscaled, so the sharpest version) on the right, and a charcoal panel on the left carrying the step counter and supers. This matches the existing Remotion landscape layout. The quick alternative is CapCut's blurred-background fill; it's less on-brand. Don't crop portrait clips to fill 16:9 (576x324 needs 5.9x).
- S04B: crop x 0–895, y 120–623 (about 2.15x; add grain).
- Re-place the captions.

## 13. QA checklist

- [ ] Durations exactly 30.0 / 45.0 / 60.0 s (900 / 1350 / 1800 frames)
- [ ] Every in and out point matches [[Script & Storyboard]]; V04 appears nowhere
- [ ] Every line matches the [[Claims Register]] wording; the only numbers are "60–70%" and "around 75 mm"
- [ ] C1 footnote on the 60–70% panel; "Cure times vary by site." under the C2 super
- [ ] Micro-disclaimer verbatim, on screen for at least 6 s, readable on a phone
- [ ] Contact reads **Jon Pepper · 0414 530 836 · maintain.com.au**
- [ ] `AI-generated · illustrative` on every frame of every AI shot; no AI shot in a method beat
- [ ] No "wet rolling" over V03A, V03B or V03C; no "trimming" over V01 7.0–10.0; no "SuperBase" caption over any spray, hose or IBC shot
- [ ] Hastings Deering dealer decal (V03C 9.0–11.0 s) not in any shot; decision recorded on blurring "740" and "5335"; faces consented or blurred
- [ ] Text inside the safe zones and always on a panel, never over busy footage
- [ ] Captions match the VO word for word and never duplicate a super
- [ ] VO clear over music on phone speakers; alarm pulses ducked; about −14 LUFS; no clipping
- [ ] No colour jumps between golden and daylight shots
- [ ] Australian spelling in every on-screen word
- [ ] Watched muted, on a phone at arm's length, and on a laptop
- [ ] Jon has signed off
