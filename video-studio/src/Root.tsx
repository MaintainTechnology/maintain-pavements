import "./index.css";
import { MyComposition } from "./Composition";
import { Composition } from "remotion";
import {
  SuperBasePromo,
  SuperBasePromoSchema,
  getPromoDurationInFrames,
  type SuperBasePromoProps,
} from "./superbase";
import { superBaseTestJob } from "./jobs/superbase-test";
import {
  SuperBaseCompletePromo,
  SuperBaseCompleteSchema,
  getCompleteDurationInFrames,
  type SuperBaseCompleteProps,
} from "./complete";
import { superBaseCompleteJob } from "./jobs/superbase-complete";
import { SuperBasePresenterPromo, SuperBasePresenterSchema, getPresenterDurationInFrames, type SuperBasePresenterProps } from "./presenter";
import { superBasePresenterJob } from "./jobs/superbase-presenter";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="SuperBasePresenter"
        component={SuperBasePresenterPromo}
        schema={SuperBasePresenterSchema}
        defaultProps={superBasePresenterJob}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={getPresenterDurationInFrames(superBasePresenterJob)}
        calculateMetadata={({ props }: { props: SuperBasePresenterProps }) => ({ durationInFrames: getPresenterDurationInFrames(SuperBasePresenterSchema.parse(props)) })}
      />
      <Composition
        id="SuperBaseComplete"
        component={SuperBaseCompletePromo}
        schema={SuperBaseCompleteSchema}
        defaultProps={superBaseCompleteJob}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={getCompleteDurationInFrames(superBaseCompleteJob)}
        calculateMetadata={({ props }: { props: SuperBaseCompleteProps }) => ({
          durationInFrames: getCompleteDurationInFrames(
            SuperBaseCompleteSchema.parse(props),
          ),
        })}
      />
      {[
        { id: "SuperBasePromo", width: 1080, height: 1920 },
        { id: "SuperBasePromo-Square", width: 1080, height: 1080 },
        { id: "SuperBasePromo-Landscape", width: 1920, height: 1080 },
      ].map(({ id, width, height }) => (
        <Composition
          key={id}
          id={id}
          component={SuperBasePromo}
          schema={SuperBasePromoSchema}
          defaultProps={superBaseTestJob}
          fps={30}
          width={width}
          height={height}
          durationInFrames={getPromoDurationInFrames(superBaseTestJob)}
          calculateMetadata={({ props }: { props: SuperBasePromoProps }) => ({
            durationInFrames: getPromoDurationInFrames(
              SuperBasePromoSchema.parse(props),
            ),
          })}
        />
      ))}
      <MyComposition />
    </>
  );
};
