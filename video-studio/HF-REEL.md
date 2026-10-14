# HfReel: Higgsfield + Seedance presenter Reel

A 60.7-second, 1080 × 1920, 30 fps corporate Instagram Reel. An AI presenter in a white hard hat, standing in an office, explains the five SuperBase steps. Recorded site footage, a site photograph and two drawn diagrams cut in while he keeps talking. Subtitles, a music bed, the official wordmark and the design-system masthead run throughout, and the Reel closes on Jon's contact details and the Claims Register disclaimer.

This is a separate job from the Veo-based `SuperBasePresenter` in `PRESENTER-REEL.md`. It has its own Remotion entry point and does not edit `src/Root.tsx`, `src/presenter/*` or `.veo/`.

| Deliverable | Path |
|---|---|
| Final Reel (BT.709 yuv420p, faststart) | `out/hf-reel/maintain-pavements-hf-reel.mp4` |
| Subtitle sidecar | `out/hf-reel/maintain-pavements-hf-reel.srt` |
| Full-range master straight from Remotion | `out/hf-reel/maintain-pavements-hf-reel-master-pc.mp4` |
| Verification report | `out/hf-reel/verify-report.json` |
| Drafts 1 and 2, kept for comparison | `out/hf-reel/draft1/`, `out/hf-reel/draft2/` |
| Generation ledger (prompts, job JSON) | `out/hf-reel/ledger/` |

## Pipeline

1. **Script.** `scripts/hf/script.json` has 7 segments and 113 words. It is traced to the Capability Statement (Rev A), the Claims Register and the step notes, and was checked by three adversarial reviewers (claims, footage honesty, delivery). Each clause carries its source. The intro reads "the yard base you already have" (PDF p.1 wording) because "the base" was being heard as "the bass".
2. **Presenter still.** GPT Image 2.5 (`gpt_image_2_5`, high, 2k, 9:16) produced a generic synthetic man with no text or logos, saved as `public/ai/hf-reel/presenter/presenter-seed.png`. The prompt is in `out/hf-reel/ledger/presenter-prompt.txt`. Both Soul 2.0 candidates were rejected because they put invented lettering on the hard hat.
3. **Voice.** Text to Speech V2 (ElevenLabs engine) with the preset voice "Sterling", chosen on transcription accuracy, pace and pitch. There is one take per segment, and alternate takes were kept wherever Whisper missed a word. `scripts/hf/build_refs.py` adds a 0.25 s lead-in, tightens pauses longer than 0.6 s and pads each take to a whole-second clip length.
4. **Presenter clips.** `scripts/hf/generate-presenter.sh` calls Seedance 2.5 (`seedance_2_5`, `omni_reference` mode, 1080p, 9:16) with the still as the start image and the segment voice as the audio reference. Seedance re-voices the line and syncs the lips to its own take, so each clip's own audio is the narration. The TTS files are only references. Rejected takes are kept in `public/ai/hf-reel/clips/rejected/`.
5. **Music.** Sonilo Music produced a 66 s original instrumental (`public/audio/hf-reel/music/take-a.m4a`) with no vocals, confirmed by Whisper. It sits about 18 dB under the voice and is lifted on the title open and the end card.
6. **Timeline.** `scripts/hf/build-timeline.mjs` aligns each script cue to Whisper large-v3 word timings on the actual clip audio. Whisper starts words up to about 0.5 s early on these clips, so every cue change is snapped to the end of the real pause. Pauses come from the 20 ms RMS envelope, taken as anything at least 0.1 s below the clip's own noise floor + 7 dB; cue snapping ignores dips shorter than 0.2 s, which fall inside words. silencedetect is not used, because the room tone in some clips peaks above any useful threshold. The builder then anchors the inserts in `scripts/hf/edit.json` to those cues. Where a footage insert or diagram hides the presenter, pauses longer than 0.75 s are shortened: 0.61 s is removed in step 03 and 0.42 s in step 04. Segments end 0.35 s after the audible end of speech, and a dissolve holds the outgoing clip's last frame rather than cutting into its speech. The builder also re-encodes each clip, high-passed, lightly denoised to its floor and loudness-matched to −16 LUFS, into `clips/norm/` with a keyframe every second, because Seedance delivers one GOP per clip and Remotion cannot seek into it. Finally it writes `src/hf-reel/timeline.json` and the SRT.
7. **Render.** Bundle once, then run `scripts/hf/render.mjs`. It renders with an empty browser env and then converts the full-range BT.601 output to broadcast-range BT.709 `yuv420p` for Instagram.

```console
node scripts/hf/build-timeline.mjs
npx tsc --noEmit -p . && npx eslint src/hf-reel
npx remotion bundle src/hf-reel/index.ts --out-dir=out/hf-reel/bundle
node scripts/hf/stills.mjs out/hf-reel/still-frames.txt --scale=0.5
node scripts/hf/render.mjs
node scripts/hf/verify.mjs --asr
```

Studio preview uses its own port: `npx remotion studio src/hf-reel/index.ts --port=3123 --env-file=config/render.env`.

## Edit and evidence rules

| Segment | On screen | Why |
|---|---|---|
| Intro | Presenter | The intro is presenter plus logo only; no result imagery before step 05 |
| 01 Prepare | Presenter, then V01 0.0–2.95 s slowed to about 88% under "scarified to about 75 mm" (the loader's asset plate and fleet sticker are blurred on keyed tracks), with the qualifier "Indicative depth · varies by site" | V01 shows a loader working loose base; scarifying and its depth are not filmed; a worker's face appears from 3.0 s |
| 02 Dose and mix | V02A (tall window; the "740" decal and the cab-top fleet plate are blurred on keyed tracks) under the step label only, then the presenter, then the depth diagram ("coat on top" versus "full depth") | The contents of the water cart are unconfirmed, so no product claim is made over the spray |
| 03 Grade to level | Presenter, then the grade diagram | No grading footage exists for this site |
| 04 Roll and compact | Presenter, V02B (tall window at source x 100–672, so fleet no. 5335 is out of frame) under "Wet rolling builds the bond.", presenter for the density line | V02B is the only clip with visible water under the drum; no density test is filmed |
| 05 Cure | Presenter (framing matched to the end of step 04, dissolve), then the S04B site photo with "Cure times vary by site" | Cure timing and treatment of the pad are unconfirmed; no time claim is made |
| CTA | Presenter (lowered 60 px so the hard hat clears the strip) with the Claims Register micro-disclaimer strip under the masthead, which continues on the end card (about 16 s on screen in all) | Testing is described as method; no lab footage exists |

Spoken step labels ("First, prepare." and so on) are not burned in while the step super shows the same words, as `script.json` specifies; the SRT carries every spoken line. V04 and all earlier Veo atmosphere or levelling clips are excluded. The provenance label in the masthead changes at every cut: "AI presenter · illustrative", "Site footage", "Site photo", "Diagram · illustrative". The presenter is never named, and Jon appears only as the contact on the end card.

Still open for the client:

- commercial-use rights for the WhatsApp-sourced site clips;
- the CAT branding on the machines, which is still visible (fleet and asset numbers are blurred or cropped out);
- confirmation that the S04B canopy pad was treated with SuperBase;
- a listening sign-off on the synthetic voice, including step 03, where the lip-synced take says "bases is";
- when posting, turn on Instagram's AI label and set the cover to about 1.8 s (the full title card).

## Cost

These are Higgsfield credits on the jon@maintain.com.au team workspace, read back from `higgsfield account transactions`.

| Item | Credits |
|---|---|
| Seedance 2.5: seven 1080p clips (53 s), one intro retake (7 s) and one 720p pilot (5 s) | 755.00 |
| Text to Speech V2: voice tests and segment takes | ≈ 11 |
| Sonilo Music: two 66 s takes | 8.26 |
| GPT Image 2.5 (2) and Soul 2.0 (2) presenter candidates | 5.74 |
| **Total for this Reel** | **≈ 780** |

## QA record

A four-lens review (visual and brand, sync and audio, claims and copy, Instagram fit) found 41 items. Serious findings were adversarially verified before any fix. The fixes applied are:

- the clipped final words ("Pavements", "hardstand") and the click at the join;
- subtitle cues that vanished early or appeared early;
- doubled step labels;
- the missing CTA disclaimer strip;
- the grade-diagram spike and hook;
- subtitles sitting on the seam of the square window;
- the unblurred "740" decal and the visible "5335";
- over-long pauses;
- the compact-to-cure jump cut;
- a 1 s presenter flash between V01 and V02A;
- ghosting in the title and end-card crossfades;
- the double lane rule;
- undersized compliance text;
- incomplete colour tags.

Refuted on verification: the pacing of the end segments, the length of the grade diagram, and the music-bed level.

A second round confirmed those fixes and checked the revision for regressions. It found 20 more items and verified 8 of them before any change. Fixed in the final:

- four cue changes still landing mid-word (fixed with RMS-envelope pause detection);
- the grade spike, now levelled at the last vertex;
- the disclaimer strip hiding the crown of the hard hat;
- legible identifiers on the V01 loader and the V02A cab roof;
- a 30 px band under the masthead on the reframed cure shot;
- rushed gaps at the two dissolves;
- hum on the prepare clip;
- the music lift under the CTA (the bed is ducked to 0.08).
