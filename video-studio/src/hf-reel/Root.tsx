import "../index.css";
import { Composition } from "remotion";
import { HfReel } from "./Reel";
import { HF_FPS, HfReelSchema, getHfReelDurationInFrames, type HfReelProps } from "./schema";
import timeline from "./timeline.json";

// Separate entry point for the Higgsfield/Seedance presenter Reel; it does not touch src/Root.tsx.
const defaultProps = HfReelSchema.parse(timeline);

export const HfReelRoot: React.FC = () => (
  <Composition
    id="HfReel"
    component={HfReel}
    schema={HfReelSchema}
    defaultProps={defaultProps}
    width={1080}
    height={1920}
    fps={HF_FPS}
    durationInFrames={getHfReelDurationInFrames(defaultProps)}
    calculateMetadata={({ props }: { props: HfReelProps }) => ({
      durationInFrames: getHfReelDurationInFrames(HfReelSchema.parse(props)),
    })}
  />
);
