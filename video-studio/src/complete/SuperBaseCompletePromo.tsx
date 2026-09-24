import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { bodyFont, headlineFont, palette } from "../superbase/theme";
import { GradingSchematic } from "./GradingSchematic";
import {
  CompleteShot,
  getCompleteTimeline,
  SuperBaseCompleteProps,
} from "./schema";

const STEP_NAMES = [
  "PREPARE",
  "DOSE + MIX",
  "GRADE TO LEVEL",
  "ROLL + COMPACT",
  "CURE + RETURN",
];
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const margin = 72;

const useReveal = (props: SuperBaseCompleteProps, offset = 0) => {
  const frame = useCurrentFrame() + offset;
  const amount =
    props.motion === "reduced" ? 1 : interpolate(frame, [0, 12], [0, 1], clamp);
  return {
    opacity: amount,
    transform: `translateY(${(1 - Easing.out(Easing.cubic)(amount)) * 18}px)`,
  };
};

const Brand: React.FC<{ props: SuperBaseCompleteProps; light?: boolean }> = ({
  props,
  light = false,
}) => (
  <div
    style={{
      position: "absolute",
      left: margin,
      right: margin,
      top: 60,
      height: 75,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      borderBottom: `1px solid ${light ? "#CBD0D2" : palette.rule}`,
      fontFamily: bodyFont,
      fontSize: 29,
      color: light ? palette.ink : palette.white,
    }}
  >
    <span style={{ fontWeight: 600 }}>{props.brandName}</span>
    <span style={{ color: light ? palette.slate : palette.grey }}>
      {props.productName}
    </span>
  </div>
);

const Kicker: React.FC<{ children: React.ReactNode; light?: boolean }> = ({
  children,
  light,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 18,
      fontFamily: bodyFont,
      fontSize: 25,
      letterSpacing: 4,
      fontWeight: 500,
      color: light ? palette.slate : palette.grey,
      textTransform: "uppercase",
    }}
  >
    <span
      style={{
        display: "block",
        width: 42,
        height: 2,
        background: "currentColor",
      }}
    />
    {children}
  </div>
);

const Headline: React.FC<{
  setup: string;
  payoff: string;
  light?: boolean;
  size?: number;
}> = ({ setup, payoff, light = false, size = 100 }) => (
  <div
    style={{
      fontFamily: headlineFont,
      fontWeight: 700,
      fontSize: size,
      letterSpacing: -4.5,
      lineHeight: 0.98,
      whiteSpace: "pre-line",
    }}
  >
    <div style={{ color: light ? palette.slate : palette.grey }}>{setup}</div>
    <div style={{ color: light ? palette.ink : palette.white, marginTop: 9 }}>
      {payoff}
    </div>
  </div>
);

const StepCounter: React.FC<{ step: number }> = ({ step }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      height: 64,
      borderBottom: `1px solid #CAD0D2`,
      paddingBottom: 23,
      fontFamily: bodyFont,
    }}
  >
    <span
      style={{
        fontSize: 26,
        fontWeight: 600,
        color: palette.ink,
        letterSpacing: 1.7,
      }}
    >
      THE METHOD
    </span>
    <div style={{ display: "flex", gap: 22 }}>
      {[1, 2, 3, 4, 5].map((value) => (
        <span
          key={value}
          style={{
            color:
              value === step
                ? palette.ink
                : value < step
                  ? palette.slate
                  : "#A9AEB1",
            fontSize: 30,
            fontWeight: value === step ? 600 : 400,
            minWidth: 49,
            textAlign: "center",
            borderBottom: `3px solid ${value === step ? palette.ink : "transparent"}`,
            paddingBottom: 8,
          }}
        >
          {String(value).padStart(2, "0")}
        </span>
      ))}
    </div>
  </div>
);

const AiLabel: React.FC = () => (
  // Disclosure stays fully opaque, including the first and final exposed frames.
  <div
    style={{
      position: "absolute",
      top: 177,
      right: 38,
      zIndex: 5,
      fontFamily: bodyFont,
      fontSize: 26,
      fontWeight: 500,
      lineHeight: 1.3,
      color: palette.white,
      background: palette.charcoal,
      border: `1px solid ${palette.grey}`,
      padding: "14px 19px",
    }}
  >
    AI-generated · illustrative
  </div>
);

const Media: React.FC<{
  shot: CompleteShot;
  props: SuperBaseCompleteProps;
}> = ({ shot, props }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const media = shot.media;
  if (!media) return null;
  const landscape = media.framing === "landscape-master";
  const zoom =
    props.motion === "reduced"
      ? 1
      : interpolate(frame, [0, shot.durationSeconds * fps], [1, 1.025], clamp);
  const commonStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: media.position,
  };
  const crop =
    media.crop ??
    (landscape
      ? {
          sourceWidth: 1080,
          sourceHeight: 1920,
          x: 0,
          y: 656,
          width: 1080,
          height: 608,
        }
      : undefined);
  const cropScale = crop
    ? Math.max(1080 / crop.width, (landscape ? 608 : 1080) / crop.height)
    : 1;
  const croppedStyle: React.CSSProperties | undefined = crop
    ? {
        position: "absolute",
        width: crop.sourceWidth * cropScale,
        height: crop.sourceHeight * cropScale,
        maxWidth: "none",
        left: (1080 - crop.width * cropScale) / 2 - crop.x * cropScale,
        top:
          ((landscape ? 608 : 1080) - crop.height * cropScale) / 2 -
          crop.y * cropScale,
      }
    : undefined;
  const gradeVideoFrames =
    shot.step === 3 && media.visibleSeconds
      ? Math.round(media.visibleSeconds * fps)
      : null;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 154,
        height: 1080,
        overflow: "hidden",
        background: palette.charcoal,
      }}
    >
      {gradeVideoFrames ? (
        <>
          <Sequence durationInFrames={gradeVideoFrames}>
            <OffthreadVideo
              src={staticFile(media.src)}
              startFrom={Math.round(media.startSeconds * fps)}
              muted
              volume={0}
              style={croppedStyle ?? commonStyle}
            />
          </Sequence>
          <Sequence from={gradeVideoFrames - 8}>
            <GradingSchematic
              durationInFrames={
                Math.round(shot.durationSeconds * fps) - gradeVideoFrames + 8
              }
              reducedMotion={props.motion === "reduced"}
            />
          </Sequence>
        </>
      ) : landscape ? (
        <>
          <div
            style={{
              position: "absolute",
              top: 60,
              left: margin,
              right: margin,
              display: "flex",
              justifyContent: "space-between",
              color: palette.grey,
              fontFamily: bodyFont,
              fontSize: 25,
              letterSpacing: 3,
            }}
          >
            <span>{media.ai ? "ILLUSTRATIVE" : "ON SITE"}</span>
            <span>{shot.step ? STEP_NAMES[shot.step - 1] : "SUPERBASE"}</span>
          </div>
          <div
            style={{
              position: "absolute",
              top: 197,
              left: 0,
              width: 1080,
              height: 608,
              overflow: "hidden",
            }}
          >
            {/* Remove only the normalisation bars. Preserve the full original 16:9 field of view. */}
            <OffthreadVideo
              src={staticFile(media.src)}
              startFrom={Math.round(media.startSeconds * fps)}
              muted={media.ai || props.realFootageVolume === 0}
              volume={media.ai ? 0 : props.realFootageVolume}
              style={croppedStyle}
            />
          </div>
          <div
            style={{
              position: "absolute",
              left: margin,
              right: margin,
              top: 869,
              borderTop: `1px solid ${palette.rule}`,
              paddingTop: 29,
              color: palette.grey,
              fontSize: 27,
              lineHeight: 1.5,
              whiteSpace: "pre-line",
              fontFamily: bodyFont,
            }}
          >
            {shot.step === 2
              ? "Mixing through depth is not shown in this footage."
              : shot.step === 4
                ? "Compaction builds the bond."
                : "The SuperBase method, in five steps."}
          </div>
        </>
      ) : media.kind === "video" ? (
        <OffthreadVideo
          src={staticFile(media.src)}
          startFrom={Math.round(media.startSeconds * fps)}
          muted={media.ai || props.realFootageVolume === 0}
          volume={media.ai ? 0 : props.realFootageVolume}
          style={croppedStyle ?? commonStyle}
        />
      ) : media.framing === "surface-detail" ? (
        <Img
          src={staticFile(media.src)}
          style={{
            position: "absolute",
            bottom: 0,
            left: "-7%",
            width: "114%",
            maxWidth: "none",
            height: "auto",
            transform: `scale(${zoom})`,
            transformOrigin: "50% 100%",
          }}
        />
      ) : (
        <Img
          src={staticFile(media.src)}
          style={{ ...commonStyle, transform: `scale(${zoom})` }}
        />
      )}
    </div>
  );
};

const MediaScene: React.FC<{
  shot: CompleteShot;
  props: SuperBaseCompleteProps;
}> = ({ shot, props }) => {
  const entrance = useReveal(props, shot.entranceOffsetFrames);
  const process = shot.kind === "process";
  const opening = shot.kind === "opening";
  return (
    <AbsoluteFill
      style={{ background: palette.charcoal, color: palette.white }}
    >
      <Brand props={props} />
      <Media shot={shot} props={props} />
      {shot.media?.ai ? <AiLabel /> : null}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1234,
          bottom: 0,
          background: process ? palette.paper : palette.charcoal,
        }}
      />
      <div
        style={{ position: "absolute", left: margin, right: margin, top: 1270 }}
      >
        {process && shot.step ? (
          <StepCounter step={shot.step} />
        ) : (
          <Kicker>
            {opening ? "The maintenance cycle" : "SuperBase for hardstand"}
          </Kicker>
        )}
      </div>
      <div
        style={{
          position: "absolute",
          left: margin,
          right: margin,
          top: process ? 1380 : 1349,
          ...entrance,
        }}
      >
        <Headline
          setup={shot.setup}
          payoff={shot.payoff}
          light={process}
          size={shot.step === 5 ? 87 : opening ? 91 : 103}
        />
        {shot.body ? (
          <div
            style={{
              marginTop: 30,
              color: process ? palette.slate : "#D0D3D5",
              fontFamily: bodyFont,
              fontSize: 34,
              lineHeight: 1.42,
              whiteSpace: "pre-line",
            }}
          >
            {shot.body}
          </div>
        ) : null}
      </div>
      <div
        style={{
          position: "absolute",
          left: margin,
          right: margin,
          bottom: 64,
          borderTop: `1px solid ${process ? "#CAD0D2" : palette.rule}`,
          paddingTop: 23,
          color: process ? palette.slate : palette.grey,
          fontSize: 24,
          lineHeight: 1.45,
          fontFamily: bodyFont,
        }}
      >
        {shot.caption}
      </div>
    </AbsoluteFill>
  );
};

const ProofScene: React.FC<{
  shot: CompleteShot;
  props: SuperBaseCompleteProps;
}> = ({ shot, props }) => {
  const entrance = useReveal(props);
  return (
    <AbsoluteFill
      style={{
        background: palette.paper,
        color: palette.ink,
        fontFamily: bodyFont,
      }}
    >
      <Brand props={props} light />
      <div
        style={{
          position: "absolute",
          top: 262,
          left: margin,
          right: margin,
          ...entrance,
        }}
      >
        <Kicker light>Confirm on your own base</Kicker>
        <div style={{ marginTop: 67 }}>
          <Headline setup={shot.setup} payoff={shot.payoff} light size={112} />
        </div>
        <div
          style={{
            fontSize: 38,
            lineHeight: 1.46,
            color: palette.slate,
            marginTop: 55,
            whiteSpace: "pre-line",
          }}
        >
          {shot.body}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 972,
          left: margin,
          right: margin,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 34,
        }}
      >
        {[
          {
            number: "01",
            title: "Before",
            text: "Your existing\nyard material",
          },
          {
            number: "02",
            title: "After",
            text: "The treated base,\nafter cure",
          },
        ].map((item) => (
          <div
            key={item.number}
            style={{
              borderTop: `2px solid ${palette.ink}`,
              borderBottom: "1px solid #CAD0D2",
              padding: "35px 0 43px",
            }}
          >
            <div style={{ color: palette.slate, fontSize: 28 }}>
              {item.number} / LABORATORY
            </div>
            <div
              style={{
                fontFamily: headlineFont,
                fontWeight: 700,
                letterSpacing: -2,
                fontSize: 78,
                marginTop: 40,
              }}
            >
              {item.title}
            </div>
            <div
              style={{
                color: palette.slate,
                whiteSpace: "pre-line",
                fontSize: 30,
                lineHeight: 1.5,
                marginTop: 24,
              }}
            >
              {item.text}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 206,
          left: margin,
          right: margin,
          fontSize: 33,
          color: palette.ink,
        }}
      >
        Site trial. Test. Confirm.
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 73,
          left: margin,
          right: margin,
          fontSize: 25,
          color: palette.slate,
          borderTop: "1px solid #CAD0D2",
          paddingTop: 26,
        }}
      >
        {shot.caption}
      </div>
    </AbsoluteFill>
  );
};

const CostScene: React.FC<{
  shot: CompleteShot;
  props: SuperBaseCompleteProps;
}> = ({ shot, props }) => {
  const entrance = useReveal(props);
  return (
    <AbsoluteFill
      style={{
        background: palette.charcoal,
        color: palette.white,
        fontFamily: bodyFont,
      }}
    >
      <Brand props={props} />
      <div
        style={{ position: "absolute", left: margin, right: margin, top: 296 }}
      >
        <Kicker>Indicative unit-rate comparison</Kicker>
      </div>
      <div
        style={{
          position: "absolute",
          top: 480,
          left: margin - 9,
          right: margin,
          ...entrance,
        }}
      >
        <div
          style={{
            fontFamily: headlineFont,
            fontWeight: 700,
            fontSize: 240,
            letterSpacing: -13,
            lineHeight: 1,
          }}
        >
          {shot.setup}
        </div>
        <div
          style={{
            fontFamily: headlineFont,
            fontSize: 75,
            letterSpacing: -2.5,
            fontWeight: 600,
            color: palette.grey,
            whiteSpace: "pre-line",
            lineHeight: 1.13,
            marginTop: 50,
          }}
        >
          {shot.payoff}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: margin,
          right: margin,
          top: 1310,
          paddingTop: 36,
          borderTop: `1px solid ${palette.rule}`,
          fontSize: 35,
          color: "#D0D3D5",
          lineHeight: 1.5,
        }}
      >
        {shot.body}
      </div>
      <div
        style={{
          position: "absolute",
          left: margin,
          right: margin,
          bottom: 74,
          fontSize: 24,
          lineHeight: 1.5,
          color: palette.grey,
        }}
      >
        {shot.caption}
      </div>
    </AbsoluteFill>
  );
};

const EndScene: React.FC<{
  shot: CompleteShot;
  props: SuperBaseCompleteProps;
}> = ({ shot, props }) => {
  const entrance = useReveal(props);
  return (
    <AbsoluteFill
      style={{
        background: palette.charcoal,
        color: palette.white,
        fontFamily: bodyFont,
      }}
    >
      <Brand props={props} />
      <div
        style={{
          position: "absolute",
          left: margin,
          right: margin,
          top: 281,
          ...entrance,
        }}
      >
        <Kicker>Start with a site trial</Kicker>
        <div style={{ marginTop: 62 }}>
          <Headline setup={shot.setup} payoff={shot.payoff} size={124} />
        </div>
        <div
          style={{
            fontSize: 36,
            color: "#C3C8CB",
            whiteSpace: "pre-line",
            lineHeight: 1.48,
            marginTop: 43,
          }}
        >
          {shot.body}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: margin,
          right: margin,
          top: 970,
          borderTop: `1px solid ${palette.rule}`,
          paddingTop: 33,
        }}
      >
        <div style={{ color: palette.grey, fontSize: 32, marginBottom: 16 }}>
          {props.contact.name}
        </div>
        <div
          style={{
            fontFamily: headlineFont,
            fontWeight: 600,
            fontSize: 78,
            letterSpacing: -2,
          }}
        >
          {props.contact.phone}
        </div>
        <div style={{ fontSize: 39, marginTop: 21 }}>{props.contact.email}</div>
        <div style={{ fontSize: 39, color: palette.grey, marginTop: 15 }}>
          {props.contact.website}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: margin,
          right: margin,
          bottom: 76,
          borderTop: `1px solid ${palette.rule}`,
          paddingTop: 28,
          color: "#D0D3D5",
          fontSize: 33,
          lineHeight: 1.5,
        }}
      >
        {props.disclaimer}
      </div>
    </AbsoluteFill>
  );
};

export const SuperBaseCompletePromo: React.FC<SuperBaseCompleteProps> = (
  props,
) => {
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const timeline = getCompleteTimeline(props, fps);
  const scale = Math.min(width / 1080, height / 1920);
  const machineryRanges = timeline.filter(
    ({ shot }) => shot.media?.kind === "video" && !shot.media.ai,
  );
  return (
    <AbsoluteFill style={{ background: palette.charcoal }}>
      <Audio
        src={staticFile(props.music.src)}
        volume={(frame) => {
          const fade = interpolate(
            frame,
            [0, fps * 1.25, durationInFrames - fps * 2.5, durationInFrames - 1],
            [0, 1, 1, 0],
            clamp,
          );
          // Ease the bed down around real machinery; AI sound is never used.
          const duck = machineryRanges.reduce((lowest, range) => {
            const amount = interpolate(
              frame,
              [
                range.from - 12,
                range.from,
                range.from + range.durationInFrames,
                range.from + range.durationInFrames + 12,
              ],
              [1, 0.76, 0.76, 1],
              clamp,
            );
            return Math.min(lowest, amount);
          }, 1);
          return props.music.volume * fade * duck;
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 1080,
          height: 1920,
          left: (width - 1080 * scale) / 2,
          top: (height - 1920 * scale) / 2,
          transform: `scale(${scale})`,
          transformOrigin: "0 0",
        }}
      >
        {timeline.map(({ shot, from, durationInFrames: shotFrames }) => (
          <Sequence
            key={shot.id}
            from={from}
            durationInFrames={shotFrames}
            premountFor={fps}
            name={`${shot.sourceId} · ${shot.kind}`}
          >
            {shot.kind === "proof" ? (
              <ProofScene shot={shot} props={props} />
            ) : shot.kind === "cost" ? (
              <CostScene shot={shot} props={props} />
            ) : shot.kind === "end" ? (
              <EndScene shot={shot} props={props} />
            ) : (
              <MediaScene shot={shot} props={props} />
            )}
          </Sequence>
        ))}
      </div>
    </AbsoluteFill>
  );
};
