import { z } from "zod";
import { CLAIMS_REGISTER_DISCLAIMER } from "../superbase/schema";

export const CompleteShotSchema = z.object({
  id: z.string().min(1),
  sourceId: z.string().min(1),
  kind: z.enum(["opening", "intro", "process", "proof", "cost", "end"]),
  durationSeconds: z.number().positive(),
  step: z.number().int().min(1).max(5).optional(),
  setup: z.string(),
  payoff: z.string(),
  body: z.string().default(""),
  caption: z.string().default(""),
  entranceOffsetFrames: z.number().int().nonnegative().default(0),
  media: z
    .object({
      src: z.string().min(1),
      kind: z.enum(["video", "image"]),
      ai: z.boolean(),
      startSeconds: z.number().nonnegative().default(0),
      visibleSeconds: z.number().positive().optional(),
      framing: z
        .enum(["portrait", "landscape-master", "photo", "surface-detail"])
        .default("portrait"),
      position: z.string().default("50% 50%"),
      // Pixel bounds of active source content, excluding baked-in margins.
      crop: z
        .object({
          sourceWidth: z.number().positive().default(1080),
          sourceHeight: z.number().positive().default(1920),
          x: z.number().nonnegative(),
          y: z.number().nonnegative(),
          width: z.number().positive(),
          height: z.number().positive(),
        })
        .optional(),
    })
    .optional(),
});

export const SuperBaseCompleteSchema = z
  .object({
    jobId: z.string().min(1),
    brandName: z.string().default("Maintain Pavements"),
    productName: z.string().default("SuperBase"),
    contact: z.object({
      name: z.string(),
      phone: z.string(),
      email: z.string(),
      website: z.string(),
    }),
    disclaimer: z.literal(CLAIMS_REGISTER_DISCLAIMER),
    motion: z.enum(["full", "reduced"]).default("full"),
    music: z.object({
      src: z.string().min(1),
      volume: z.number().min(0).max(1).default(0.7),
    }),
    realFootageVolume: z.number().min(0).max(1).default(0.07),
    requiredSourceIds: z.array(z.string()).default([]),
    shots: z.array(CompleteShotSchema).min(1),
  })
  .superRefine((job, context) => {
    const steps = new Set(job.shots.map((shot) => shot.step));
    for (const step of [1, 2, 3, 4, 5]) {
      if (!steps.has(step))
        context.addIssue({
          code: "custom",
          path: ["shots"],
          message: `The complete process needs step ${step}.`,
        });
    }
    for (const sourceId of job.requiredSourceIds) {
      if (!job.shots.some((shot) => shot.sourceId === sourceId && shot.media))
        context.addIssue({
          code: "custom",
          path: ["shots"],
          message: `Missing required source: ${sourceId}.`,
        });
    }
    job.shots.forEach((shot, index) => {
      if (["opening", "intro", "process"].includes(shot.kind) && !shot.media)
        context.addIssue({
          code: "custom",
          path: ["shots", index, "media"],
          message: "This scene requires media.",
        });
      if (
        shot.media?.ai &&
        !(shot.kind === "opening" || shot.kind === "intro" || shot.step === 3)
      )
        context.addIssue({
          code: "custom",
          path: ["shots", index, "media", "ai"],
          message:
            "AI is permitted only as labelled opening atmosphere or the missing grading illustration.",
        });
    });
    const end = job.shots[job.shots.length - 1];
    if (end.kind !== "end" || end.durationSeconds < 12)
      context.addIssue({
        code: "custom",
        path: ["shots"],
        message:
          "Finish with at least 12 seconds for the contact and complete disclaimer.",
      });
  });

export type CompleteShot = z.infer<typeof CompleteShotSchema>;
export type SuperBaseCompleteProps = z.infer<typeof SuperBaseCompleteSchema>;

export const getCompleteDurationInFrames = (
  props: SuperBaseCompleteProps,
  fps = 30,
) =>
  props.shots.reduce(
    (total, shot) => total + Math.round(shot.durationSeconds * fps),
    0,
  );

export const getCompleteTimeline = (
  props: SuperBaseCompleteProps,
  fps = 30,
) => {
  let cursor = 0;
  return props.shots.map((shot) => {
    const durationInFrames = Math.round(shot.durationSeconds * fps);
    const entry = { shot, from: cursor, durationInFrames };
    cursor += durationInFrames;
    return entry;
  });
};
