# Maintain Pavements presenter Reel

## Production status

The completed Reel covers the introduction and all five narrated process steps. Independent local speech recognition checked the complete selected source and the extension joins; the 19 measured captions are integrated in the job. The checkpointed export, delivered-file technical verification and sampled visual review all passed on 25 September 2026. No direct auditory-listening or vocal-identity verification is claimed.

- Verified output: 60 seconds, portrait 9:16, 1080 × 1920, H.264 at 30 fps; 1800 frames with stereo AAC at 48 kHz.
- Files: [MP4](out/maintain-pavements-presenter-reel.mp4) and [matching SRT](out/maintain-pavements-presenter-reel.srt).
- Generation plan and exact requested speech: `scripts/presenter/plan.json`.
- Selected native presenter: `public/ai/presenter/cumulative-06-cure.mp4`, 43.083333 seconds. The edit retains 43 seconds, followed by a 17-second trial, contact and disclaimer end card. The final spoken word ends at 42.04 seconds, so the edit retains the complete narration.
- Process photos and footage are combined with an on-screen presenter, subtitles and background music.
- The existing original instrumental track, `public/audio/superbase-bed.wav`, is reused for the 60-second edit, faded at the new endpoint and kept below speech. The delivery derivative is `public/audio/presenter-bed.wav`; original music provenance remains in `public/audio/superbase-bed.manifest.json`.

The last planned spoken CTA request was refused by the provider for real-person names or likeness. No video was returned for it, and no further generation was attempted after the eight-request cap. A shorter invitation to a site trial and testing, plus Jon's contact, appears as end-card text. The originally planned laboratory comparison sentence is absent from both narration and on-screen copy. All five process steps are present in the accepted narration.

## Delivered-file verification

The [verification report](out/presenter-render-report.json) records the completed MP4 at **18,289,521 bytes**, SHA-256 `b62c75a5cf4bad2cbc860d95fc2378234b2e4f4a1a07dfda30e2deaca85f5c39`. Full video/audio decoding passed. Canonical brand assets, source hashes, audio provenance, all seven original videos, both stills, five process steps and 19 subtitle phrases passed their checks. The render browser received zero environment variables.

The exported mix measured **−16.99 LUFS** integrated loudness and **−2.55 dBTP** true peak. Sampled audio comparisons found no time offset: narration at 1–6 seconds correlated 0.98895 with the native-speech reference, gain 0.99943; music at 48–52 seconds correlated 0.99988, gain 0.64907, consistent with the 0.65 end-card level. These are signal checks, not a claim of direct listening or voice identity.

The [durable checkpoint record](out/presenter-frames/e3737ac507275f967b980641b7d48cb63901fc13db2b65ca8e347a59d0213fe6/checkpoint.json) records all 1800 completed frames. The stationary end card was independently rendered at frames 1300, 1549 and 1799; their JPEG hashes matched exactly. The recorded source review confirms that the end card is static after its ten-frame reveal, with a stationary lane and terrain. The identical hold was reused only after those checks.

The [final visual review](out/qa-final-presenter/review.json) used a 16-frame contact sheet extracted from this MP4, plus the full-size end card, and records the same MP4 SHA-256. The sampled presenter, process footage, stills, AI setup and grading schematic rendered cleanly; subtitles were readable without cropping or overlap. Contact details and the exact disclaimer were legible, and the actual 48-second and 58-second end-card images matched. This was sampled visual QA, alongside the separate full-file decode check. Canonical brand hashes were rechecked after export and still matched.

## Presenter and seed image

The presenter is an AI-generated corporate narrator based on the user-supplied visual references. Do not identify him as Jon Pepper or claim that the voice is Jon's real voice. The requested voice is a consistent generic adult male voice with a calm Australian English accent, a warm mid-low register and clear conversational delivery. It is not a voice clone.

The seed workflow uses the built-in image-generation tool. The first supplied portrait is the primary identity reference; the second supplies the corporate styling reference. The image direction is a clean professional office, a white protective hard hat, corporate clothing, realistic lighting, an unobstructed face and a composition suitable for portrait presenter footage. Keep the official logo out of generated lettering; place the exact supplied logo in the final edit.

- Primary portrait: `C:/Users/dalig/AppData/Local/Temp/codex-clipboard-41aab980-1551-4b01-afde-f1c179bfe552.png`.
- Corporate style reference: `C:/Users/dalig/AppData/Local/Temp/codex-clipboard-66d90fb5-4824-4fda-bb27-3faff7757da9.png`.
- Seed path: `public/ai/presenter/seeds/office-hardhat.png`.

Label the synthetic presenter clearly as an AI presenter. Any AI process imagery must remain labelled illustrative. A presenter explaining a method does not establish that every action or result was recorded on the supplied site.

## Spoken script

The following is the exact originally requested script in `scripts/presenter/plan.json`. Times show the original generation plan, not the measured subtitle timings. The introduction and steps 01–05 were generated and their wording was checked through independent local ASR. The final CTA row was not generated and is excluded from the spoken edit. The first segment is eight seconds; each successful extension added about seven seconds.

| Expected time | Segment | Exact requested speech | Documentation basis |
|---|---|---|---|
| 0–8 s | Introduction | Maintain Pavements introduces SuperBase: a five-step process for turning suitable existing yard base into bound hardstand. | Capability Statement, page 1 and pages 3–4 [1] |
| 8–15 s | 01 — Prepare | First, prepare. Remove loose material and scarify the base to about seventy-five millimetres. | Capability Statement, page 3; Step 1 notes; Claims Register C3 [1, 3, 5] |
| 15–22 s | 02 — Dose and mix | Second, dose and mix. Add SuperBase and water at the designed ratio, mixing through the full depth. | Capability Statement, page 3; Step 2 notes; Claims Register C6 [1, 3, 6] |
| 22–29 s | 03 — Grade to level | Third, grade to level. Trim the workable base to the designed level and crossfall for drainage. | Capability Statement, page 3; Step 3 notes [1, 7] |
| 29–36 s | 04 — Roll and compact | Fourth, roll and compact. Use wet rolling, then check density against the dosage design. | Capability Statement, page 4; Step 4 notes; Claims Register C8 [1, 3, 8] |
| 36–43 s | 05 — Cure and return to service | Fifth, cure and return to service. Timing varies with base material, climate and duty. | Capability Statement, page 4 and page 6 disclaimer; Step 5 notes [1, 9] |
| Not included | Trial and contact — planned request refused | Start with a trial area. Laboratory testing compares your material before treatment and after cure. Contact Jon Pepper. | Capability Statement, pages 4 and 6; Claims Register C9 [1, 3]. This wording was not generated and is not displayed as end-card copy. The actual invitation is quoted below. |

The approximately 75 mm depth is an indicative method detail from the documentation, not a depth measured in the video or a universal specification for every site. Preserve “about” in the narration and subtitles. The source also states that treated depth and dosage are confirmed through site trial and testing.

The measured captions are integrated in `src/jobs/superbase-presenter-captions.json`, imported by the job with `captionsStatus: "verified"`. They match `out/presenter-qa/captions-proposal.json`: 19 readable phrases, with a maximum of 49 characters, ending at the actual final word “duty” at 42.04 seconds. They use actual ASR content rather than inserting the ungenerated CTA. Canonical brand spelling and ordinary punctuation are applied explicitly; “about 75 millimetres” remains qualified. The renderer writes the sidecar SRT from this same caption array.

## Speech and timing checks

`scripts/presenter/transcribe-local.py` uses local `faster-whisper` 1.2.1 and the already cached English `base.en` model, running on CPU in the isolated `.venv-asr` environment. No model was downloaded. Neither the intended script nor an initial prompt was given to recognition. Word timestamps and the original recognition results are preserved under `out/presenter-qa/`.

The full final-source result is `local-final43-full-base.json`; the reviewed result is `local-final43-reviewed.json`. Separate windows check the newly generated speech and preceding sentence endings. These verify the spoken method, the cure qualification and clean wording at the joins. Full-file decoder boundaries occasionally duplicated “and”, “water” or “drainage”; independent shorter windows contain each word once. The raw records and the reasons for removing those recognition duplicates are retained.

Recognition gives “Third” a zero-duration word alignment. A local FFmpeg silence check on the final source measured the new speech onset at approximately 22.352 seconds, which informs that caption's 22.35-second start. All timestamps remain source-relative. ASR alignment is approximate, so these checks are evidence of wording and phrase timing, not a frame-level lip-sync guarantee.

No direct auditory-listening or speaker-identity verification is claimed. The consistent synthetic voice is the Veo generation direction; ASR does not prove vocal identity. Final mix loudness and rendered audio signal checks passed as recorded above.

## Render sources

Native Veo files remain preserved. The accepted cure cumulative clip is selected as `public/ai/presenter/presenter.mp4`. `scripts/prepare-presenter-assets.mjs` prepares a separate `public/ai/presenter/presenter-render.mp4` at 30 fps with a short GOP for reliable random frame seeking across extension joins. The native files pass sequential decoding; the derivative addresses random-seek warnings in rendering. The final job uses that derivative, while narration is mastered from the native audio with its original timing. Asset manifests record raw and derivative SHA-256 values.

The preparation B-roll uses two verified V01 source windows, 0–4.5 seconds and 7–9.5 seconds, avoiding the blurred zoom around 5 seconds. Dosing footage uses V02A source 18.5–22 seconds. The edit returns to the full presenter during timeline 18.5–22 seconds. The contact/testing section is a text end card, with no invented spoken CTA.

For this reviewed job, `node scripts/mix-presenter-audio.mjs` reads the validated final coverage, accepted selection and hashed audio masters. It writes `public/audio/presenter-mix.wav` and `public/audio/presenter-mix.manifest.json`, preserving native speech timing and matching the Remotion music fade and volume curves. It requires current `out/presenter-render-coverage.json`; do not mix against an old job snapshot.

`npm run render:presenter` now uses `scripts/presenter/render-checkpointed.mjs` by default. It validates the media and mixed audio, captures durable frame batches, and retains `out/presenter-frames/<fingerprint>/checkpoint.json`. A rerun with the same source, job, bundle, media and brand inputs resumes verified missing frames. Changed inputs receive a different fingerprint. The renderer encodes the completed frames with the verified 60-second stereo mix and writes the final MP4 only after its encoding checks. `npm run verify:presenter` performs the separate delivered-file checks. Neither command generates new AI media. If a fresh or changed job stops for an absent or stale audio mix, the render entrypoint has already written its validated final coverage: run the mixer against that coverage, then rerun the export.

## Process coverage and evidence limits

All five documented steps belong in the edit. The footage supports different parts of those steps; file folder names are not evidence of the activity shown.

| Step | Material selected in this edit | What it can and cannot show |
|---|---|---|
| 01 — Prepare | V01 source 0–4.5 s and 7–9.5 s | Loader and loose-base preparation context. The act of scarifying and its depth are not recorded. |
| 02 — Dose and mix | V02A source 18.5–22 s, followed by the full presenter | Water-cart application. The liquid contents and mixing through the full depth cannot be confirmed from the images; the footage caption states both limits. |
| 03 — Grade to level | Three seconds of labelled AI loader setup, then four seconds of grading schematic | None of the seven original videos shows a grader or a verified trimming cut. These are labelled method illustrations, not evidence of work on this site. The defective later AI action is excluded. No grader still from another site is used here. |
| 04 — Roll and compact | V02B source 0–2 s, V03A 5–7.5 s and V03B 5.5–8 s; the opening also uses V03C 0–2 s and V04 14.5–16.5 s | V02B shows water application ahead of the drum; the others show rolling. No density test is filmed. V04 is a lower-quality encode of the same action as V03C, despite being filed under cure. Distinct portions cover both files without repeating the same view. |
| 05 — Cure and return to service | S04B and S04A stills | S04B is the empty finished-looking canopy pad; treatment and cure timing are unconfirmed. S04A is a different yard. Neither demonstrates the elapsed cure interval or traffic returning to the canopy pad. |

The source documentation describes trial and laboratory-testing methodology, but this edit only invites a site trial and testing; it does not explain the before/after laboratory comparison. There is no laboratory, sampling or test-result footage. Do not invent a test value, label a rolling clip as cure, imply a named customer, or present different sites as a matched before-and-after sequence. No guaranteed result, quantified saving or fixed return-to-service time is included in the selected script.

## Brand treatment

The current design system is the visual source of truth. It contains actual vector logo assets, superseding the older vault note that said a vector logo was unavailable.

- Specification: `../DESIGN.md`.
- Tokens: `../design-system/tokens.json` and `../design-system/tokens.css`.
- White logo for charcoal: `../design-system/assets/logo/wordmark-on-dark.svg`.
- Charcoal logo for light backgrounds: `../design-system/assets/logo/wordmark-on-light.svg`.
- Mark-only assets: `../design-system/assets/logo/mark.svg` and `mark-on-dark.svg`.
- Optional supplied terrain and tonal art: `../design-system/graphics/web/`.

Copied render assets and their hashes live in `public/brand/`. When only the canonical logo, terrain art or tokens change, refresh them with `node scripts/prepare-presenter-assets.mjs --brand-only` before rebuilding. This updates the exact copies and brand manifest without remastering or changing audio or video. Current token copies include the canonical contrast and layering metadata; the unused accent role has been removed, with no accent colour introduced.

Use canonical charcoal `#26282B`, paper `#F5F4F1` and white. Use mid-grey `#99A1A7` for secondary text on dark; use slate `#5C6670` on light. Figtree 800 carries headlines and step numbers; Inter carries subtitles, labels and body text. Photography supplies colour. Keep corners square, use generous margins and hairlines, and retain the two-tone headline treatment and numbered 01–05 sequence.

Use the official drawn wordmark without stretching, recolouring or retyping it. Preserve clear space of at least the cap height of “Maintain”. On photographs, the white wordmark requires a charcoal scrim of at least 50%. A 92% charcoal lower-third with the supplied lane-line treatment can carry captions. Keep background music and motion restrained so the process explanation remains clear.

The current signature lane motion runs for two 2.4-second periods, then rests at 4.8 seconds. `src/presenter/SuperBasePresenterPromo.tsx` clamps its lane time accordingly. Reduced motion skips the crawl; the end-card lane is stationary. This follows the current canonical token rule rather than the older continuous loop.

## Contact and exact end-card disclaimer

The current `EndCard` in `src/presenter/SuperBasePresenterPromo.tsx` displays this invitation:

> Let’s look at your yard.
>
> Start with your material.
> Confirm with a site trial and testing.

It is followed by the contact details and disclaimer below, plus “Includes an AI presenter and labelled process illustrations.” There is no spoken CTA and no on-screen laboratory comparison sentence.

Jon Pepper  
0414 530 836  
jon@maintain.com.au  
maintain.com.au

Use the Claims Register's exact micro-disclaimer:

> Figures indicative only. Rates, cure times and results vary with base material, climate and duty, and are confirmed by site trial and testing. Comparison vs engineered concrete hardstand.

Keep it readable for the end-card hold. Jon's contact is the call to action; it does not identify the synthetic presenter as Jon.

## Generation plan and cost estimates

The Gemini model is `veo-3.1-fast-generate-preview`, portrait 9:16 at 720p. The original plan called for seven successful generations: an eight-second introduction and six extensions, or approximately 50 seconds. The final selection uses six successful results: introduction and all five process steps. Eight request slots were consumed in total: six successful generations, one HTTP 400 aspect-ratio rejection, and the refused CTA request. No further request was made after the cap.

The public generation ledger is `public/ai/presenter/manifest.json`. It records **US$4.80** on the eight-seconds-per-successful-request basis and a conservative **US$15.32** estimate based on cumulative returned durations. The original seven-success plan estimates were US$5.60 and US$20.30 respectively; they are not the final selection's cost figures. Extension billing granularity remains uncertain. Actual provider billing is not verified, and `billingActualUSD` remains null. These figures are estimates, not receipts or confirmed charges. Seed-image generation is a separate built-in image-generation workflow and is not priced by these Veo estimates.

Official references: [Gemini Veo generation and extension documentation](https://ai.google.dev/gemini-api/docs/veo) and [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing). The main production task checked the listed Veo Fast 720p rate of US$0.10 per generated second on 25 September 2026. The provider's extension billing granularity was not established by that pricing page.

Generation runs outside the Remotion bundle. Keep `GEMINI_API_KEY` private, reserve each request durably before submission, and do not automatically repeat an uncertain request. Record operation status and actual output duration so the production notes can later be updated from evidence.

## Documentation sources

All paths below are relative to `video-studio/`.

1. [SuperBase Capability Statement — Rev A](../MaintainPavements/01%20Jon%27s%20Plan/SuperBase%20Capability%20Statement%20-%20Rev%20A.md): method on pages 3–4, testing on pages 4 and 6, contact on page 1, full disclaimer on page 6.
2. [Process Overview](../MaintainPavements/02%20Process/Process%20Overview.md): five-step coverage matrix and documented footage gaps.
3. [Claims Register](../MaintainPavements/01%20Jon%27s%20Plan/Claims%20Register.md): claims C3, C6, C8 and C9, wording limits and end-card micro-disclaimer.
4. [Shot Library](../MaintainPavements/04%20Promo%20Video/Shot%20Library.md): verified source windows, orientation and V03C/V04 duplicate finding.
5. [Step 1 — Prepare](../MaintainPavements/02%20Process/Step%201%20-%20Prepare.md).
6. [Step 2 — Dose and Mix](../MaintainPavements/02%20Process/Step%202%20-%20Dose%20and%20Mix.md).
7. [Step 3 — Grade to Level](../MaintainPavements/02%20Process/Step%203%20-%20Grade%20to%20Level.md).
8. [Step 4 — Roll and Compact](../MaintainPavements/02%20Process/Step%204%20-%20Roll%20and%20Compact.md).
9. [Step 5 — Cure and Return to Service](../MaintainPavements/02%20Process/Step%205%20-%20Cure%20and%20Return%20to%20Service.md).
10. [Maintain Pavements design system](../DESIGN.md) and [tokens](../design-system/tokens.json).
