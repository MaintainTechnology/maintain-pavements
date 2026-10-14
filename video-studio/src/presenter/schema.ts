import { z } from "zod";
import { CLAIMS_REGISTER_DISCLAIMER } from "../superbase/schema";

export const PresenterCaptionSchema = z.object({
  fromSeconds: z.number().nonnegative(),
  toSeconds: z.number().positive(),
  text: z.string().min(1),
});

export const PresenterChapterSchema = z.object({
  id: z.string().min(1),
  fromSeconds: z.number().nonnegative(),
  toSeconds: z.number().positive(),
  step: z.number().int().min(1).max(5).nullable(),
  setup: z.string(),
  payoff: z.string(),
});

export const PresenterShotSchema = z.object({
  id: z.string().min(1),
  sourceId: z.string().min(1),
  fromSeconds: z.number().nonnegative(),
  toSeconds: z.number().positive(),
  src: z.string().default(""),
  kind: z.enum(["video", "image", "schematic"]),
  startSeconds: z.number().nonnegative().default(0),
  ai: z.boolean().default(false),
  caption: z.string(),
  evidenceNote: z.string(),
  position: z.string().default("50% 50%"),
  crop: z
    .object({
      sourceWidth: z.number().positive(),
      sourceHeight: z.number().positive(),
      x: z.number().nonnegative(),
      y: z.number().nonnegative(),
      width: z.number().positive(),
      height: z.number().positive(),
    })
    .optional(),
});

export const SuperBasePresenterSchema = z
  .object({
    jobId: z.string().min(1),
    narrationSeconds: z.number().positive().default(43),
    endCardSeconds: z.number().min(12).default(17),
    previewOnlySeed: z.boolean().default(false),
    captionsStatus: z.enum(["draft", "verified"]),
    motion: z.enum(["full", "reduced"]).default("full"),
    presenter: z.object({
      src: z.string(),
      seed: z.string(),
      disclosure: z.string().default("AI presenter · illustrative"),
    }),
    audio: z.object({
      narrationSrc: z.string(),
      narrationVolume: z.number().min(0).max(2).default(1),
      musicSrc: z.string(),
      musicUnderVoice: z.number().min(0).max(1).default(0.23),
      musicEndCard: z.number().min(0).max(1).default(0.65),
    }),
    contact: z.object({
      name: z.string(),
      phone: z.string(),
      email: z.string(),
      website: z.string(),
    }),
    disclaimer: z.literal(CLAIMS_REGISTER_DISCLAIMER),
    requiredSourceIds: z.array(z.string()),
    chapters: z.array(PresenterChapterSchema).min(6),
    captions: z.array(PresenterCaptionSchema).min(1),
    shots: z.array(PresenterShotSchema),
  })
  .superRefine((job, ctx) => {
    const issue = (path: (string | number)[], message: string) =>
      ctx.addIssue({ code: "custom", path, message });
    const steps = new Set(job.chapters.map((chapter) => chapter.step));
    for (const step of [1, 2, 3, 4, 5]) {
      if (!steps.has(step))
        issue(["chapters"], `Missing process step ${step}.`);
    }
    job.chapters.forEach((chapter, i) => {
      if (chapter.toSeconds <= chapter.fromSeconds)
        issue(["chapters", i], "Chapter must have positive duration.");
      if (
        i === 0
          ? chapter.fromSeconds !== 0
          : chapter.fromSeconds !== job.chapters[i - 1].toSeconds
      )
        issue(
          ["chapters", i],
          "Narrator chapters must be contiguous from zero.",
        );
    });
    if (
      job.chapters[job.chapters.length - 1].toSeconds !== job.narrationSeconds
    )
      issue(["chapters"], "Chapters must end with the narration.");
    job.captions.forEach((caption, i) => {
      if (
        caption.toSeconds <= caption.fromSeconds ||
        caption.toSeconds > job.narrationSeconds
      )
        issue(["captions", i], "Caption timing is outside the narration.");
      if (i > 0 && caption.fromSeconds < job.captions[i - 1].toSeconds)
        issue(["captions", i], "Captions must not overlap.");
    });
    job.shots.forEach((shot, i) => {
      if (
        shot.toSeconds <= shot.fromSeconds ||
        shot.toSeconds > job.narrationSeconds
      )
        issue(["shots", i], "Shot timing is outside the narration.");
      if (i > 0 && shot.fromSeconds < job.shots[i - 1].toSeconds)
        issue(["shots", i], "Footage shots must not overlap.");
      if (shot.kind !== "schematic" && !shot.src)
        issue(["shots", i, "src"], "Media source required.");
    });
    for (const source of job.requiredSourceIds) {
      if (!job.shots.some((shot) => shot.sourceId === source))
        issue(["shots"], `Required source missing: ${source}.`);
    }
  });

export type SuperBasePresenterProps = z.infer<typeof SuperBasePresenterSchema>;
export type PresenterCaption = z.infer<typeof PresenterCaptionSchema>;
export type PresenterShot = z.infer<typeof PresenterShotSchema>;
export type PresenterChapter = z.infer<typeof PresenterChapterSchema>;
export const PRESENTER_FPS = 30;
export const getPresenterDurationInFrames = (
  props: SuperBasePresenterProps,
  fps = PRESENTER_FPS,
) => Math.round((props.narrationSeconds + props.endCardSeconds) * fps);
export const getPresenterTimeline = (
  props: SuperBasePresenterProps,
  fps = PRESENTER_FPS,
) =>
  props.shots.map((shot) => ({
    shot,
    from: Math.round(shot.fromSeconds * fps),
    durationInFrames: Math.round((shot.toSeconds - shot.fromSeconds) * fps),
  }));
