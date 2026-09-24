import { z } from "zod";

// Verbatim micro-disclaimer from MaintainPavements/01 Jon's Plan/Claims Register.md.
export const CLAIMS_REGISTER_DISCLAIMER =
  "Figures indicative only. Rates, cure times and results vary with base material, climate and duty, and are confirmed by site trial and testing. Comparison vs engineered concrete hardstand.";

export const SuperBaseMediaSchema = z.object({
  src: z.string().min(1),
  kind: z.enum(["video", "image"]),
  startSeconds: z.number().min(0).default(0),
  ai: z.boolean(),
});

export const SuperBaseShotSchema = z
  .object({
    id: z.string().min(1),
    kind: z.enum([
      "problem",
      "intro",
      "process",
      "grade",
      "surface",
      "proof",
      "cost",
      "end",
    ]),
    durationSeconds: z.number().positive(),
    media: SuperBaseMediaSchema.optional(),
    step: z.number().int().min(1).max(5).optional(),
    kicker: z.string(),
    setup: z.string(),
    payoff: z.string(),
    body: z.string().default(""),
    caption: z.string().default(""),
    // Keeps titles still across a montage without coupling the template to a job.
    entranceOffsetFrames: z.number().int().min(0).default(0),
  })
  .superRefine((shot, context) => {
    if (shot.media?.ai && !["problem", "intro"].includes(shot.kind)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["media", "ai"],
        message:
          "AI footage is limited to the illustrative opening and atmosphere.",
      });
    }
    if (
      ["problem", "intro", "process", "surface"].includes(shot.kind) &&
      !shot.media
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["media"],
        message: "This shot needs a media source.",
      });
    }
  });

export const SuperBasePromoSchema = z.object({
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
  realFootageVolume: z.number().min(0).max(1).default(0.12),
  shots: z.array(SuperBaseShotSchema).min(1),
});

export type SuperBaseShot = z.infer<typeof SuperBaseShotSchema>;
export type SuperBasePromoProps = z.infer<typeof SuperBasePromoSchema>;

export const getPromoDurationInFrames = (
  props: SuperBasePromoProps,
  fps = 30,
) =>
  props.shots.reduce(
    (total, shot) => total + Math.round(shot.durationSeconds * fps),
    0,
  );
