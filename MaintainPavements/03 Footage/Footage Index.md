---
type: index
title: "Footage Index"
subject: "Master list of the SuperBase site footage and stills"
video_files: 7
unique_clips: 6
stills: 2
total_runtime_s: 127.4
unique_runtime_s: 108.9
frames_extracted: 257
tags: [footage, index, superbase]
---

# Footage Index

Everything in `videos/`, one row per item, with the doc step decided **from the pixels**, not from the folder. Each note in this folder has the full frame-by-frame log, audio analysis, cautions and questions for Jon. Every note was independently re-watched and corrected (verification confidence 4/5 for all eight).

Map: [[00 Home]] · [[Process Overview]] · [[Shot Library]] · [[Promo Video Brief]]

## Master table

| ID | Note | Folder | Doc step actually shown | WhatsApp timestamp | Duration | What it shows | Promo value | Best clip | Verif. |
|---|---|---|---|---|---|---|---|---|---|
| V01 | [[V01 - Prepare\|V01 - Prepare]] | `01-prepare` | **01 Prepare** (0.0–10.0 s); hose wetting 11.0–14.5 s, stage unconfirmed | 2026-08-16 18:41:33 | 16.4 s | CAT-badged compact track loader carries and sets down a slatted frame on the loose, scarified-looking base; a worker hand-hoses a strip | 4/5 | 0.0–4.5 s (hero 2.5–3.0 s) | 4/5 |
| V02A | [[V02A - Dose and Mix A\|V02A - Dose and Mix A]] | `02-dose-and-mix` | **02 Dose and mix** (dose only; no mixing) | 2026-08-14 11:39:44 | 27.27 s | IBC totes, a hand hose and articulated water cart "740" saturating the loose base, then driving away spraying | 4/5 | 18.5–22.0 s (hero 20.5 s) | 4/5 |
| V02B | [[V02B - Dose and Mix B\|V02B - Dose and Mix B]] | `02-dose-and-mix` ⚠ | **04 Roll and compact** (wet rolling); folder is wrong | 2026-08-17 13:21:22 | 22.7 s | CAT roller 5335 wet-rolls a strip while crew hand-sprays ahead of the drum; rolled-surface close-ups | 4/5 | 0.0–4.5 s (hero 0.5–3.0 s) | 4/5 |
| V03A | [[V03A - Roll and Compact A\|V03A - Roll and Compact A]] | `03-roll-and-compact` | **04 Roll and compact** | 2026-08-22 13:10:35 | 9.83 s | Roller 5335 reverses away down the canopy in low backlight; closed matte pad, no water | 4/5 | 5.0–9.5 s (hero 5.5 s) | 4/5 |
| V03B | [[V03B - Roll and Compact B\|V03B - Roll and Compact B]] | `03-roll-and-compact` | **04 Roll and compact** (no water visible) | 2026-08-22 13:10:35 | 14.27 s | Roller 5335 passes close to camera, then recedes rear-first into golden backlight | 4/5 | 5.5–9.0 s (hero 6.5 s) | 4/5 |
| V03C | [[V03C - Roll and Compact C\|V03C - Roll and Compact C]] | `03-roll-and-compact` | **04 Roll and compact** | 2026-08-22 13:10:35 | 18.46 s | Walk-around of roller 5335 on the closed, level pad in low sun. **Master copy** of the V03C/V04 duplicate | 4/5 | 0.0–4.0 s (hero 0.5 s) | 4/5 |
| V04 | [[V04 - Cure and Return to Service\|V04 - Cure and Return to Service]] | `04-cure-and-return-to-service` ⚠ | **04 Roll and compact** (not 05); folder is wrong | 2026-08-17 07:21:24 | 18.46 s | **Same clip as V03C**, at a lower bitrate | 3/5 (use V03C) | 0.0–3.0 s, cut from V03C instead | 4/5 |
| S04 | [[S04 - Cure Stills\|S04 - Cure Stills]] | `04-cure-and-return-to-service` | **05 Cure and return to service**: S04B cured pad at the canopy site; S04A trafficked surface at another yard | S04B 2026-08-22 13:08:43; S04A none (PDF copy EXIF 2026-07-16 14:18:54) | 2 stills | S04B: pale, dry, empty pad under the canopy. S04A: bound yard surface with tyre arcs and scrub marks (= PDF p.5 "Finished bound surface") | 5/5 (S04B 5, S04A 4) | S04B slow push-in (end card) | 4/5 |

## Totals

| | Count | Runtime |
|---|---|---|
| Video files | 7 | **127.4 s** (2 min 7.4 s) |
| Unique clips (V04 removed as a duplicate of V03C) | 6 | **108.9 s** (1 min 48.9 s) |
| Stills | 2 (S04A, S04B) | n/a |
| Frames extracted at 2 fps (in `Assets/Frames/`) | 257 (220 unique) | one every 0.5 s from 0.0, plus a V02B tail frame at 22.6 s |

**Unique runtime by doc step:**

| Doc step | Clips | Runtime |
|---|---|---|
| 01 Prepare | V01 | 16.4 s (about 10 s of Prepare action) |
| 02 Dose and mix | V02A | 27.3 s |
| 03 Grade to level | none | **0 s** |
| 04 Roll and compact | V02B, V03A, V03B, V03C | **65.3 s** |
| 05 Cure and return to service | none (stills only) | **0 s** |

Coverage by step is in the matrix in [[Process Overview]].

## Duplicates and anomalies

1. **V03C = V04 (duplicate).** Bit-identical audio MD5, the same 552 frames, video SSIM 0.95, 0 px offset on all 37 grid frames. Only the encode differs: V03C 1.31 Mbps against V04 0.91 Mbps (V04 has about 19% less fine detail). **Edit from V03C; never use both.** V04's earlier stamp (17 Aug 07:21) shows the footage existed by then.
2. **V04 is misfiled.** It's in the cure folder but shows rolling (Step 4). So the cure folder holds **no cure or return-to-service video**; its step-05 content is the two stills.
3. **V02B is misfiled.** It's in `02-dose-and-mix` but shows wet rolling (Step 4). Jon's PDF p.4 photo "04 — Wet rolling to final compaction" is V02B at about 0.5 s.
4. **Not all portrait.** The pre-processing note said all seven clips were portrait. **V02A and V02B are landscape 1024x576 with no rotation flag** (re-checked with ffprobe). The other five are portrait.
5. **WhatsApp timestamps aren't capture times.** V03A, V03B and V03C are stamped 13:10 but lit by a very low sun; V01 is stamped 18:41 in flat daylight. Three files share the second 13:10:35 (suffixes none, "(1)", "(2)"), which reads as a batch forward (inference).
6. **WhatsApp order doesn't follow process order.** Dose (14 Aug) was saved before Prepare (16 Aug). See the timeline in [[Process Overview]].
7. **No speech anywhere.** faster-whisper large-v3 with VAD found **zero** speech segments in all seven videos. The non-VAD outputs ("Thank you for watching…", "Thank you.") are **stock Whisper hallucinations on machinery noise**, not dialogue. All audio is continuous machinery or ambient sound (no silence).
8. **No step-03 footage.** No grader or trimming appears in any clip, and Jon's own step-03 photo is a V03C/V04 still of the roller.
9. **Jon's step-05 photo is a different site** (`PDF-p4_img2.jpeg`). S04B, the cured canopy pad, isn't in the PDF.
10. **S04A is a cropped PNG re-save of a JPEG** (1034x1195), and the same photo as `PDF-p5_img2.jpeg` at 1.2x the size. It's a different yard from the canopy.
11. **Processing artefacts.** The V02B tail frame (`V02B-22.6s.jpg`) was extracted at 576x324. `waveform.png` rendered blank for several clips, so audio was characterised from the spectrograms and per-0.5 s stats.

## Where Jon's brochure photos came from

| PDF photo | Source clip | Confidence |
|---|---|---|
| `PDF-p3_img1.jpeg` "01 — Trimming the scarified base" | V01, 2.5–3.0 s | High |
| `PDF-p3_img2.jpeg` "02 — Binder and water through the full depth" | V02A, ≈24.0–24.5 s | High |
| `PDF-p3_img3.jpeg` "03 — Trimmed to level and crossfall" | V03C / V04, ≈0.77 s (a roller, not a grader) | High |
| `PDF-p4_img1.jpeg` "04 — Wet rolling to final compaction" | V02B, ≈0.5 s | High |
| `PDF-p4_img2.jpeg` "05 — Cured and back in service" | None (different site) | n/a |
| `PDF-p5_img2.jpeg` "Finished bound surface" | Same photograph as S04A | Certain |

## Technical spec of the source footage

All seven videos are **WhatsApp re-encodes**, not camera originals: H.264 Baseline, level 3.1, yuv420p, BT.709, variable frame rate around 30 fps, with AAC-LC 44.1 kHz stereo audio at about 62–66 kbps. Every file is stored at 1024x576.

| ID | Rotation flag | Displayed as | Avg fps | Frames | Video bitrate | Container bitrate | File size |
|---|---|---|---|---|---|---|---|
| V01 | −90° | **Portrait 576x1024** | 29.99 | 492 | 1627 kbps | 1693 kbps | 3.47 MB |
| V02A | none | **Landscape 1024x576** | 29.97 | 817 | 914 kbps | 983 kbps | 3.35 MB |
| V02B | none | **Landscape 1024x576** | 29.96 | 680 | 1315 kbps | 1384 kbps | 3.93 MB |
| V03A | −90° | **Portrait 576x1024** | 29.90 | 294 | 1326 kbps | 1392 kbps | 1.71 MB |
| V03B | −90° | **Portrait 576x1024** | 29.93 | 427 | 1319 kbps | 1386 kbps | 2.47 MB |
| V03C | −90° | **Portrait 576x1024** | 29.90 | 552 | 1312 kbps | 1378 kbps | 3.18 MB |
| V04 | −90° | **Portrait 576x1024** | 29.90 | 552 | 911 kbps | 977 kbps | 2.25 MB |

| Still | Format | Pixels | Notes |
|---|---|---|---|
| S04A | PNG, RGBA (alpha fully opaque) | 1034x1195 | Decoded JPEG re-saved as PNG; minimal EXIF; cropped |
| S04B | Progressive JPEG, about quality 75 | 895x813 | WhatsApp re-encode, no EXIF; sky clipped (6.4% of pixels) |

**What this means for the edit:**
- **9:16 (1080x1920)** is the natural deliverable: the five portrait clips need about a 1.9x upscale.
- The two **landscape** clips give only a 324x576 slice for 9:16 (a 3.3x upscale), so letterbox them on a charcoal (#25282A) panel or use a 1:1 crop.
- **16:9** from the portrait clips is only 576x324 of source, so pillarbox them, or use split screens.
- Denoise before any upscale, and expect macroblocking in gravel, mist and wet-film texture.
- Ask Jon for the **original phone files**. See [[CapCut Edit Guide]] and [[Remotion Build Notes]].

## Database view

The same notes as a sortable table (Obsidian Bases, from the notes' properties):

![[Footage.base]]
