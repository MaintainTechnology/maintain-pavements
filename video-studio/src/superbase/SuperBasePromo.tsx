import React, { useContext } from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  BrandHeader,
  EndCard,
  Kicker,
  StepCounter,
  TextLines,
  TwoToneHeadline,
} from "./components";
import { SuperBasePromoProps, SuperBaseShot } from "./schema";
import {
  bodyFont,
  headlineFont,
  palette,
  PromoMotionContext,
  useEntrance,
  usePromoLayout,
} from "./theme";

const Media: React.FC<{ shot: SuperBaseShot; volume: number }> = ({
  shot,
  volume,
}) => {
  const { fps } = useVideoConfig();
  const { portrait } = usePromoLayout();
  const media = shot.media;
  if (!media) return null;
  const style: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: portrait ? "cover" : "contain",
  };
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        left: portrait ? 0 : "51%",
        overflow: "hidden",
        background: palette.charcoal,
      }}
    >
      {media.kind === "video" ? (
        <OffthreadVideo
          src={staticFile(media.src)}
          startFrom={Math.round(media.startSeconds * fps)}
          volume={media.ai ? 0 : volume}
          muted={media.ai || volume === 0}
          style={style}
        />
      ) : (
        <Img
          src={staticFile(media.src)}
          style={{ ...style, objectFit: "contain" }}
        />
      )}
    </div>
  );
};

const AiLabel: React.FC = () => {
  const { margin, scale, portrait, landscape } = usePromoLayout();
  return (
    <div
      style={{
        position: "absolute",
        right: margin,
        top: (portrait ? 164 : 133) * scale,
        zIndex: 10,
        color: palette.white,
        background: palette.charcoal,
        padding: `${15 * scale}px ${20 * scale}px`,
        fontFamily: bodyFont,
        fontSize: (portrait ? 28 : landscape ? 26 : 23) * scale,
        fontWeight: 500,
        border: `1px solid ${palette.rule}`,
      }}
    >
      AI-generated · illustrative
    </div>
  );
};

const FootageScene: React.FC<{
  shot: SuperBaseShot;
  props: SuperBasePromoProps;
}> = ({ shot, props }) => {
  const { portrait, landscape, margin, scale, height } = usePromoLayout();
  const entrance = useEntrance(shot.entranceOffsetFrames);
  const intro = ["intro", "problem"].includes(shot.kind);
  const panelHeight = (intro ? 650 : 710) * scale;
  return (
    <AbsoluteFill
      style={{ background: palette.charcoal, color: palette.white }}
    >
      <Media shot={shot} volume={props.realFootageVolume} />
      {/* Opaque brand and copy panels preserve the document's no-gradient visual language. */}
      {portrait ? (
        <>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 135 * scale,
              background: palette.charcoal,
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: panelHeight,
              background: palette.charcoal,
            }}
          />
        </>
      ) : (
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            width: "51%",
            background: palette.charcoal,
          }}
        />
      )}
      <BrandHeader
        brandName={props.brandName}
        productName={props.productName}
      />
      {shot.media?.ai ? <AiLabel /> : null}
      <div
        style={{
          position: "absolute",
          left: margin,
          right: portrait ? margin : "54%",
          top: portrait ? height - panelHeight + 42 * scale : 215 * scale,
          ...entrance,
        }}
      >
        {shot.step ? (
          <StepCounter step={shot.step} />
        ) : (
          <Kicker>{shot.kicker}</Kicker>
        )}
        <div style={{ marginTop: (shot.step ? 35 : 36) * scale }}>
          <TwoToneHeadline
            setup={shot.setup}
            payoff={shot.payoff}
            fontSize={
              (portrait
                ? shot.kind === "problem"
                  ? 96
                  : intro
                    ? 114
                    : 99
                : landscape
                  ? 91
                  : intro
                    ? 64
                    : 59) * scale
            }
          />
        </div>
        {shot.body ? (
          <div
            style={{
              fontFamily: bodyFont,
              fontSize: (portrait ? 35 : landscape ? 32 : 26) * scale,
              color: "#CED1D3",
              lineHeight: 1.4,
              marginTop: 30 * scale,
            }}
          >
            {shot.body}
          </div>
        ) : null}
      </div>
      {shot.caption ? (
        <div
          style={{
            position: "absolute",
            left: margin,
            right: portrait ? margin : "54%",
            bottom: margin,
            fontFamily: bodyFont,
            fontSize: (portrait ? 25 : landscape ? 24 : 21) * scale,
            letterSpacing: 1.7 * scale,
            lineHeight: 1.5,
            textTransform: "uppercase",
            color: palette.grey,
          }}
        >
          {shot.caption}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

const GradeDiagram: React.FC = () => {
  const motion = useContext(PromoMotionContext);
  const { scale, portrait } = usePromoLayout();
  const frame = useCurrentFrame();
  const progress =
    motion === "reduced"
      ? 1
      : interpolate(frame, [10, 65], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
  return (
    <div
      style={{
        width: "100%",
        height: (portrait ? 430 : 360) * scale,
        position: "relative",
      }}
    >
      <svg
        viewBox="0 0 900 380"
        width="100%"
        height="100%"
        aria-label="Schematic design level and crossfall"
      >
        <path d="M25 205 L875 260 L875 345 L25 345 Z" fill="#DBDDDA" />
        <path
          d="M25 205 L875 260"
          fill="none"
          stroke={palette.ink}
          strokeWidth="6"
          strokeDasharray="900"
          strokeDashoffset={900 * (1 - progress)}
        />
        <path
          d="M25 150 L25 180 M875 205 L875 235"
          stroke={palette.slate}
          strokeWidth="2"
        />
        <path
          d="M25 165 L875 220"
          stroke={palette.slate}
          strokeWidth="2"
          strokeDasharray="8 10"
        />
        <text
          x="25"
          y="100"
          fill={palette.slate}
          fontFamily={bodyFont}
          fontSize="26"
          letterSpacing="2"
        >
          DESIGN LEVEL + CROSSFALL
        </text>
        <text
          x="25"
          y="310"
          fill={palette.slate}
          fontFamily={bodyFont}
          fontSize="27"
        >
          TREATED BASE
        </text>
      </svg>
    </div>
  );
};

const GraphicScene: React.FC<{
  shot: SuperBaseShot;
  props: SuperBasePromoProps;
}> = ({ shot, props }) => {
  const { portrait, landscape, margin, scale, width } = usePromoLayout();
  const entrance = useEntrance();
  const light = shot.kind !== "cost";
  const cost = shot.kind === "cost";
  const grade = shot.kind === "grade";
  return (
    <AbsoluteFill
      style={{
        background: light ? palette.paper : palette.charcoal,
        color: light ? palette.ink : palette.white,
        fontFamily: bodyFont,
      }}
    >
      <BrandHeader
        brandName={props.brandName}
        productName={props.productName}
        light={light}
      />
      <div
        style={{
          position: "absolute",
          left: margin,
          right: margin,
          top: (portrait ? 290 : 194) * scale,
          ...entrance,
        }}
      >
        {shot.step ? (
          <StepCounter step={shot.step} light={light} />
        ) : (
          <Kicker light={light}>{shot.kicker}</Kicker>
        )}
        {cost ? (
          <>
            <div
              style={{
                fontFamily: headlineFont,
                fontWeight: 700,
                fontSize: (portrait ? 233 : landscape ? 246 : 192) * scale,
                letterSpacing: "-0.065em",
                marginTop: (portrait ? 100 : 36) * scale,
                lineHeight: 1,
              }}
            >
              {shot.setup}
            </div>
            <div
              style={{
                fontFamily: headlineFont,
                color: palette.white,
                fontWeight: 600,
                fontSize: (portrait ? 73 : landscape ? 66 : 53) * scale,
                lineHeight: 1.05,
                letterSpacing: -2 * scale,
                maxWidth: landscape ? width * 0.65 : undefined,
                marginTop: 30 * scale,
              }}
            >
              <TextLines text={shot.payoff} />
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                marginTop: (portrait ? 72 : 48) * scale,
                maxWidth: landscape ? width * 0.61 : undefined,
              }}
            >
              <TwoToneHeadline
                setup={shot.setup}
                payoff={shot.payoff}
                light
                fontSize={(portrait ? 116 : landscape ? 102 : 76) * scale}
              />
            </div>
            <div
              style={{
                fontSize: (portrait ? 39 : landscape ? 34 : 30) * scale,
                color: palette.slate,
                maxWidth: landscape ? width * 0.58 : undefined,
                lineHeight: 1.4,
                marginTop: 37 * scale,
              }}
            >
              {shot.body}
            </div>
          </>
        )}
      </div>
      {grade ? (
        <div
          style={{
            position: "absolute",
            left: landscape ? width * 0.57 : margin,
            right: margin,
            bottom: (portrait ? 320 : 185) * scale,
            width: landscape ? width * 0.37 : undefined,
          }}
        >
          <GradeDiagram />
        </div>
      ) : null}
      {shot.kind === "proof" ? (
        <div
          style={{
            position: "absolute",
            left: margin,
            right: margin,
            bottom: (portrait ? 390 : 235) * scale,
            display: "flex",
            gap: 30 * scale,
          }}
        >
          {["BEFORE", "AFTER"].map((label, index) => (
            <div
              key={label}
              style={{
                flex: 1,
                borderTop: `2px solid ${palette.ink}`,
                paddingTop: 25 * scale,
              }}
            >
              <div
                style={{
                  fontFamily: headlineFont,
                  fontSize: (portrait ? 98 : 70) * scale,
                  fontWeight: 600,
                  color: palette.slate,
                }}
              >
                {index === 0 ? "01" : "02"}
              </div>
              <div
                style={{
                  fontSize: (portrait ? 27 : 24) * scale,
                  letterSpacing: 3 * scale,
                  marginTop: 12 * scale,
                }}
              >
                {label}
              </div>
              <div
                style={{
                  fontSize: (portrait ? 29 : 25) * scale,
                  color: palette.slate,
                  marginTop: 12 * scale,
                }}
              >
                Soaked CBR test
              </div>
            </div>
          ))}
        </div>
      ) : null}
      <div
        style={{
          position: "absolute",
          left: margin,
          right: margin,
          bottom: margin,
          borderTop: `1px solid ${light ? "#C6C9C7" : palette.rule}`,
          paddingTop: 28 * scale,
          fontSize: (portrait ? (cost ? 34 : 29) : 27) * scale,
          color: light ? palette.slate : "#D0D3D5",
          lineHeight: 1.5,
        }}
      >
        {cost
          ? "Indicative. Varies with base material, climate and duty. Confirmed by site trial."
          : shot.caption}
      </div>
    </AbsoluteFill>
  );
};

export const SuperBasePromo: React.FC<SuperBasePromoProps> = (props) => {
  const { fps } = useVideoConfig();
  let from = 0;
  return (
    <PromoMotionContext.Provider value={props.motion}>
      <AbsoluteFill style={{ background: palette.charcoal }}>
        {props.shots.map((shot) => {
          const durationInFrames = Math.round(shot.durationSeconds * fps);
          const start = from;
          from += durationInFrames;
          return (
            <Sequence
              key={shot.id}
              from={start}
              durationInFrames={durationInFrames}
              name={shot.id}
            >
              {shot.kind === "end" ? (
                <EndCard
                  {...props}
                  kicker={shot.kicker}
                  setup={shot.setup}
                  payoff={shot.payoff}
                  body={shot.body}
                />
              ) : ["grade", "proof", "cost"].includes(shot.kind) ? (
                <GraphicScene shot={shot} props={props} />
              ) : (
                <FootageScene shot={shot} props={props} />
              )}
            </Sequence>
          );
        })}
      </AbsoluteFill>
    </PromoMotionContext.Provider>
  );
};
