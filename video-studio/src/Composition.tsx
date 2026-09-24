import { loadFont as loadFigtree } from "@remotion/google-fonts/Figtree";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import {
  AbsoluteFill,
  Composition,
  interpolate,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
} from "remotion";

const { fontFamily: headlineFont } = loadFigtree("normal", {
  weights: ["700", "800"],
  subsets: ["latin"],
});
const { fontFamily: bodyFont } = loadInter("normal", {
  weights: ["400", "600"],
  subsets: ["latin"],
});

const sceneFrames = 90;
const transitionFrames = 12;

type TemplateProps = {
  brandName: string;
  previewLabel: string;
  prepareTitle: string;
  prepareClip: string;
  doseTitle: string;
  doseClip: string;
  rollTitle: string;
  rollClip: string;
};

type SceneProps = {
  brandName: string;
  previewLabel: string;
  number: string;
  title: string;
  clip: string;
  fit: "contain" | "cover";
  startFrom?: number;
};

const FootageScene: React.FC<SceneProps> = ({
  brandName,
  previewLabel,
  number,
  title,
  clip,
  fit,
  startFrom = 0,
}) => {
  const frame = useCurrentFrame();
  const textOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#25282A", color: "#FFFFFF" }}>
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: "56%",
          overflow: "hidden",
          backgroundColor: "#2F3233",
        }}
      >
        <OffthreadVideo
          src={clip}
          startFrom={startFrom}
          volume={0}
          style={{ width: "100%", height: "100%", objectFit: fit }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: "44%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "58px 54px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            fontFamily: bodyFont,
            fontSize: 19,
            fontWeight: 600,
            letterSpacing: 2.8,
            textTransform: "uppercase",
          }}
        >
          {brandName}
        </div>
        <div style={{ opacity: textOpacity }}>
          <div
            style={{
              width: 44,
              height: 2,
              backgroundColor: "#99A1A7",
              marginBottom: 22,
            }}
          />
          <div
            style={{
              color: "#99A1A7",
              fontFamily: bodyFont,
              fontSize: 17,
              fontWeight: 600,
              letterSpacing: 4,
            }}
          >
            {number} / PROCESS
          </div>
          <div
            style={{
              fontFamily: headlineFont,
              fontSize: 64,
              fontWeight: 800,
              lineHeight: 1.04,
              letterSpacing: -2.4,
              marginTop: 18,
            }}
          >
            {title}
          </div>
        </div>
        <div
          style={{
            color: "#99A1A7",
            fontFamily: bodyFont,
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: 2.8,
            textTransform: "uppercase",
          }}
        >
          {previewLabel}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const ProcessTemplate: React.FC<TemplateProps> = (props) => {
  const shared = {
    brandName: props.brandName,
    previewLabel: props.previewLabel,
  };

  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={sceneFrames}>
        <FootageScene
          {...shared}
          number="01"
          title={props.prepareTitle}
          clip={props.prepareClip}
          fit="contain"
        />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: transitionFrames })}
      />
      <TransitionSeries.Sequence durationInFrames={sceneFrames}>
        <FootageScene
          {...shared}
          number="02"
          title={props.doseTitle}
          clip={props.doseClip}
          fit="cover"
          startFrom={555}
        />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: transitionFrames })}
      />
      <TransitionSeries.Sequence durationInFrames={sceneFrames}>
        <FootageScene
          {...shared}
          number="03"
          title={props.rollTitle}
          clip={props.rollClip}
          fit="contain"
        />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};

export const MyComposition = () => {
  return (
    <Composition
      id="PavementsProcessTemplate"
      component={ProcessTemplate}
      durationInFrames={sceneFrames * 3 - transitionFrames * 2}
      fps={30}
      width={1280}
      height={720}
      defaultProps={{
        brandName: "Maintain Pavements",
        previewLabel: "Internal preview",
        prepareTitle: "Prepare",
        prepareClip: staticFile(
          "footage/01-prepare/WhatsApp Video 2026-08-16 at 18.41.33.mp4",
        ),
        doseTitle: "Dose and mix",
        doseClip: staticFile(
          "footage/02-dose-and-mix/WhatsApp Video 2026-08-14 at 11.39.44.mp4",
        ),
        rollTitle: "Roll and compact",
        rollClip: staticFile(
          "footage/03-roll-and-compact/WhatsApp Video 2026-08-22 at 13.10.35 (2).mp4",
        ),
      }}
    />
  );
};
