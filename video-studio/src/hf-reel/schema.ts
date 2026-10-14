import { z } from "zod";
import { CLAIMS_REGISTER_DISCLAIMER } from "../superbase/schema";

export const HF_FPS = 30;

// Frames are relative to the owning segment unless stated otherwise.
export const HfCueSchema = z.object({
  lines: z.array(z.string().min(1)).min(1).max(2),
  // Spoken step labels are not burned in while the step super shows the same words; the SRT keeps them.
  burnIn: z.boolean(),
  from: z.number().int().min(0),
  to: z.number().int().positive(),
});

// A blur patch tracked through keyframes: t is source seconds after trimStartSeconds; x/y/w/h are
// normalised-source pixels (the 1080 × 1920 footage file), interpolated linearly between keys.
const HfMaskSchema = z.object({
  keys: z
    .array(z.object({ t: z.number().min(0), x: z.number(), y: z.number(), w: z.number().positive(), h: z.number().positive() }))
    .min(1),
  blur: z.number().min(2).max(40),
});

export const HfInsertSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("portrait"),
    src: z.string().min(1),
    trimStartSeconds: z.number().min(0),
    playbackRate: z.number().min(0.7).max(1),
    masks: z.array(HfMaskSchema).optional(),
    from: z.number().int().min(0),
    to: z.number().int().positive(),
    label: z.string().min(1),
  }),
  z.object({
    kind: z.literal("square"),
    src: z.string().min(1),
    trimStartSeconds: z.number().min(0),
    playbackRate: z.number().min(0.7).max(1),
    // Left edge (source px) of the window taken from the landscape band (y 656–1264) of the normalised
    // 1080 × 1920 file. The band is scaled to fill y 392–1540, so about 572 source px of width are visible.
    cropX: z.number().min(0).max(472),
    masks: z.array(HfMaskSchema).optional(),
    from: z.number().int().min(0),
    to: z.number().int().positive(),
    label: z.string().min(1),
  }),
  z.object({
    kind: z.literal("still"),
    src: z.string().min(1),
    // Source-pixel crop of the still, filled into the body window below the masthead.
    crop: z.object({ x: z.number(), y: z.number(), w: z.number(), h: z.number() }),
    sourceSize: z.object({ w: z.number(), h: z.number() }),
    from: z.number().int().min(0),
    to: z.number().int().positive(),
    label: z.string().min(1),
  }),
  z.object({
    kind: z.literal("diagram"),
    diagram: z.enum(["depth", "grade"]),
    from: z.number().int().min(0),
    to: z.number().int().positive(),
    label: z.string().min(1),
  }),
]);

export const HfSegmentSchema = z.object({
  id: z.string().min(1),
  step: z.number().int().min(1).max(5).nullable(),
  stepName: z.string().nullable(),
  clip: z.string().min(1),
  voiceGain: z.number().positive().max(4),
  // Per-clip framing correction: scale about the top centre, then shift down (px).
  presenterScale: z.number().min(0.9).max(1.2),
  presenterDy: z.number().min(-120).max(120),
  from: z.number().int().min(0),
  durationInFrames: z.number().int().positive(),
  // Dissolve in from the previous presenter clip when the cut would otherwise be presenter-to-presenter.
  dissolveIn: z.boolean(),
  // Presenter clip pieces; pauses hidden under an insert are removed between pieces.
  pieces: z
    .array(z.object({ clipFromFrame: z.number().int().min(0), from: z.number().int().min(0), durationInFrames: z.number().int().positive() }))
    .min(1),
  cues: z.array(HfCueSchema).min(1),
  inserts: z.array(HfInsertSchema),
  caption: z
    .object({ text: z.string().min(1), from: z.number().int().min(0), to: z.number().int().positive() })
    .nullable(),
});

export const HfReelSchema = z.object({
  titleFrames: z.number().int().positive(),
  endFrames: z.number().int().min(180),
  presenterLabel: z.literal("AI presenter · illustrative"),
  segments: z.array(HfSegmentSchema).min(1),
  music: z.object({
    src: z.string().min(1),
    bedVolume: z.number().min(0).max(1),
    // The track lifts in its last third; hold it further down under the CTA voice.
    ctaBedVolume: z.number().min(0).max(1),
    openVolume: z.number().min(0).max(1),
  }),
  title: z.object({ setup: z.string(), payoff: z.string(), caption: z.string() }),
  endCard: z.object({
    setup: z.string(),
    payoff: z.string(),
    name: z.string(),
    phone: z.string(),
    email: z.string(),
    web: z.string(),
    disclaimer: z.literal(CLAIMS_REGISTER_DISCLAIMER),
    aiDisclosure: z.string().min(1),
  }),
});

export type HfCue = z.infer<typeof HfCueSchema>;
export type HfMask = z.infer<typeof HfMaskSchema>;
export type HfInsert = z.infer<typeof HfInsertSchema>;
export type HfSegment = z.infer<typeof HfSegmentSchema>;
export type HfReelProps = z.infer<typeof HfReelSchema>;

export const getBodyFrames = (props: HfReelProps) => {
  const last = props.segments[props.segments.length - 1];
  return last.from + last.durationInFrames;
};

export const getHfReelDurationInFrames = (props: HfReelProps) =>
  props.titleFrames + getBodyFrames(props) + props.endFrames;
