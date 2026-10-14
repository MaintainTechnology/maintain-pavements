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
import {
  getPresenterTimeline,
  PresenterChapter,
  PresenterShot,
  SuperBasePresenterProps,
} from "./schema";
import { bodyFont, headlineFont, theme } from "./theme";

const safe = { left: 64, width: 824 };
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const reveal = (frame: number, reduced: boolean) => {
  const t = reduced ? 1 : interpolate(frame, [0, 10], [0, 1], clamp);
  return {
    opacity: t,
    transform: `translateY(${(1 - Easing.bezier(0.22, 1, 0.36, 1)(t)) * 14}px)`,
  };
};

const Lane: React.FC<{ width: number; dark?: boolean; moving?: boolean }> = ({
  width,
  dark = false,
  moving = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const offset = moving ? ((Math.min(frame / fps, 4.8) / 2.4) * 40) % 40 : 0;
  return (
    <div
      style={{
        width,
        height: 3,
        overflow: "hidden",
        color: dark ? theme.ink : theme.white,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 16,
          width: width + 80,
          transform: `translateX(${-offset}px)`,
        }}
      >
        {Array.from({ length: Math.ceil(width / 40) + 2 }, (_, i) => (
          <span
            key={i}
            style={{ flex: "0 0 24px", height: 3, background: "currentColor" }}
          />
        ))}
      </div>
    </div>
  );
};

const Logo: React.FC<{ light?: boolean; large?: boolean }> = ({
  light = false,
  large = false,
}) => (
  <Img
    src={staticFile(
      light ? "brand/wordmark-on-light.svg" : "brand/wordmark-on-dark.svg",
    )}
    style={{ width: large ? 480 : 352, height: "auto", display: "block" }}
  />
);

const Heading: React.FC<{
  chapter: PresenterChapter;
  reduced: boolean;
  seconds: number;
}> = ({ chapter, reduced, seconds }) => {
  const { fps } = useVideoConfig();
  return (
    <div
      style={{
        position: "absolute",
        top: 258,
        ...safe,
        display: "flex",
        gap: 36,
        alignItems: "flex-start",
        ...reveal((seconds - chapter.fromSeconds) * fps, reduced),
      }}
    >
      {chapter.step !== null ? (
        <span
          style={{
            width: 108,
            flexShrink: 0,
            fontFamily: headlineFont,
            fontSize: 104,
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: -5,
            color: theme.white,
          }}
        >
          {String(chapter.step).padStart(2, "0")}
        </span>
      ) : null}
      <div
        style={{
          fontFamily: headlineFont,
          fontWeight: 800,
          fontSize: chapter.step === null ? 67 : 70,
          lineHeight: 1.02,
          letterSpacing: -2.1,
        }}
      >
        <div style={{ color: theme.setup }}>{chapter.setup}</div>
        <div style={{ color: theme.white, marginTop: 4 }}>{chapter.payoff}</div>
      </div>
    </div>
  );
};

const MethodProgress: React.FC<{ step: number | null }> = ({ step }) => (
  <div
    style={{
      display: "flex",
      width: 520,
      justifyContent: "space-between",
      alignItems: "center",
      borderTop: `1px solid ${theme.line}`,
      paddingTop: 26,
    }}
  >
    {[1, 2, 3, 4, 5].map((n) => (
      <div
        key={n}
        style={{
          fontFamily: headlineFont,
          fontSize: 28,
          fontWeight: 800,
          color: n === step ? theme.white : theme.setup,
          display: "flex",
          gap: 10,
          alignItems: "center",
        }}
      >
        <span
          style={{
            width: 16,
            height: 3,
            background: n === step ? theme.white : "transparent",
          }}
        />
        {String(n).padStart(2, "0")}
      </div>
    ))}
  </div>
);

const GradeDrawing: React.FC<{ duration: number; reduced: boolean }> = ({
  duration,
  reduced,
}) => {
  const frame = useCurrentFrame();
  const progress = reduced
    ? 0.7
    : interpolate(frame, [8, duration - 10], [0.12, 0.88], clamp);
  const x = 80 + progress * 664;
  const y = 386 + progress * 35;
  const rough = Array.from(
    { length: 35 },
    (_, n) =>
      `${80 + n * 20},${415 + Math.sin(n * 1.3) * 17 + Math.cos(n * 2.8) * 11}`,
  ).join(" ");
  return (
    <AbsoluteFill style={{ background: theme.panel, color: theme.white }}>
      <svg width={824} height={780} viewBox="0 0 824 780">
        <defs>
          <clipPath id="presenter-grade-left">
            <rect x={80} y={300} width={x - 80} height={300} />
          </clipPath>
          <clipPath id="presenter-grade-right">
            <rect x={x} y={300} width={764 - x} height={300} />
          </clipPath>
        </defs>
        <g clipPath="url(#presenter-grade-right)">
          <polygon
            points={`${rough} 764,588 80,588`}
            fill={theme.setupOnLight}
          />
          <polyline
            points={rough}
            stroke={theme.setup}
            fill="none"
            strokeWidth={3}
          />
        </g>
        <g clipPath="url(#presenter-grade-left)">
          <polygon points="80,386 764,422 764,588 80,588" fill={theme.setup} />
          <path d="M80 386 L764 422" stroke={theme.paper} strokeWidth={4} />
        </g>
        <g transform={`translate(${x},${y})`}>
          <path
            d="M-48 -14 L-48 -57 L48 -57 L48 -14 Z"
            fill={theme.background}
            stroke={theme.paper}
            strokeWidth={4}
          />
          {[-24, 0, 24].map((n) => (
            <line
              key={n}
              x1={n}
              x2={n}
              y1={-56}
              y2={-14}
              stroke={theme.paper}
              strokeWidth={3}
            />
          ))}
          <path d="M-59 -8 L59 -2" stroke={theme.white} strokeWidth={7} />
          <path d="M0 -60 L0 -130" stroke={theme.setup} strokeWidth={2} />
        </g>
        <text
          x={82}
          y={670}
          fill={theme.muted}
          fontFamily={bodyFont}
          fontSize={25}
        >
          Workable base
        </text>
        <text
          x={742}
          y={236}
          textAnchor="end"
          fill={theme.muted}
          fontFamily={bodyFont}
          fontSize={25}
        >
          Designed crossfall
        </text>
        <path d="M500 258 L738 271" stroke={theme.setup} strokeWidth={2} />
      </svg>
    </AbsoluteFill>
  );
};

const Footage: React.FC<{ shot: PresenterShot; reduced: boolean }> = ({
  shot,
  reduced,
}) => {
  const { fps } = useVideoConfig();
  const duration = Math.round((shot.toSeconds - shot.fromSeconds) * fps);
  let mediaStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: shot.position,
  };
  if (shot.crop) {
    const crop = shot.crop;
    // Landscape source content stays whole; portrait crops fill the editorial window.
    const scale =
      crop.width / crop.height > 1.4
        ? Math.min(824 / crop.width, 780 / crop.height)
        : Math.max(824 / crop.width, 780 / crop.height);
    mediaStyle = {
      position: "absolute",
      width: crop.sourceWidth * scale,
      height: crop.sourceHeight * scale,
      maxWidth: "none",
      left: (824 - crop.width * scale) / 2 - crop.x * scale,
      top: (780 - crop.height * scale) / 2 - crop.y * scale,
    };
  }
  return (
    <AbsoluteFill style={{ background: theme.deep }}>
      {shot.kind === "schematic" ? (
        <GradeDrawing duration={duration} reduced={reduced} />
      ) : shot.kind === "image" ? (
        <Img src={staticFile(shot.src)} style={mediaStyle} />
      ) : (
        <OffthreadVideo
          src={staticFile(shot.src)}
          trimBefore={Math.round(shot.startSeconds * fps)}
          muted
          style={mediaStyle}
        />
      )}
      {shot.ai ? (
        <div
          style={{
            position: "absolute",
            left: 20,
            top: 20,
            background: theme.background,
            color: theme.white,
            padding: "10px 14px",
            fontSize: 22,
            fontFamily: bodyFont,
          }}
        >
          AI footage · illustrative
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

const Presenter: React.FC<{
  props: SuperBasePresenterProps;
  inset: boolean;
}> = ({ props, inset }) => {
  const rect: React.CSSProperties = inset
    ? {
        left: 634,
        top: 1000,
        width: 254,
        height: 448,
        border: `2px solid ${theme.paper}`,
      }
    : { left: 64, top: 450, width: 824, height: 972 };
  return (
    <div
      style={{
        position: "absolute",
        ...rect,
        overflow: "hidden",
        background: theme.panel,
        zIndex: 3,
      }}
    >
      {props.previewOnlySeed ? (
        <Img
          src={staticFile(props.presenter.seed)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: inset ? "50% 28%" : "50% 20%",
          }}
        />
      ) : (
        <OffthreadVideo
          src={staticFile(props.presenter.src)}
          muted
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: inset ? "50% 28%" : "50% 20%",
          }}
        />
      )}
    </div>
  );
};

const Subtitles: React.FC<{
  props: SuperBasePresenterProps;
  seconds: number;
}> = ({ props, seconds }) => {
  const caption = props.captions.find(
    (item) => seconds >= item.fromSeconds && seconds < item.toSeconds,
  );
  if (!caption) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: safe.left,
        width: safe.width,
        top: 1494,
        minHeight: 104,
        fontFamily: bodyFont,
        color: theme.white,
        fontWeight: 600,
        fontSize: 39,
        lineHeight: 1.24,
        letterSpacing: -0.4,
        textAlign: "left",
        zIndex: 6,
      }}
    >
      {caption.text}
    </div>
  );
};

const EndCard: React.FC<{ props: SuperBasePresenterProps }> = ({ props }) => {
  const frame = useCurrentFrame();
  const reduced = props.motion === "reduced";
  return (
    <AbsoluteFill style={{ background: theme.paper, color: theme.ink }}>
      <Img
        src={staticFile("brand/terrain-cover.jpg")}
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          height: 800,
          objectFit: "cover",
          opacity: 0.07,
          mixBlendMode: "multiply",
        }}
      />
      <div style={{ position: "absolute", left: safe.left, top: 116 }}>
        <Logo light large />
      </div>
      <div
        style={{
          position: "absolute",
          left: safe.left,
          top: 368,
          width: safe.width,
          ...reveal(frame, reduced),
        }}
      >
        <div
          style={{
            fontFamily: headlineFont,
            fontSize: 92,
            fontWeight: 800,
            letterSpacing: -3.2,
            lineHeight: 1.02,
          }}
        >
          <div style={{ color: theme.setupOnLight }}>Let’s look at</div>
          <div>your yard.</div>
        </div>
        <div
          style={{
            fontFamily: bodyFont,
            color: theme.setupOnLight,
            fontSize: 33,
            lineHeight: 1.45,
            marginTop: 42,
            width: 720,
          }}
        >
          Start with your material.
          <br />
          Confirm with a site trial and testing.
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: safe.left,
          top: 786,
          width: safe.width,
        }}
      >
        <Lane width={safe.width} dark />
        <div
          style={{
            fontFamily: headlineFont,
            fontWeight: 800,
            fontSize: 48,
            marginTop: 42,
          }}
        >
          {props.contact.name}
        </div>
        <div
          style={{
            fontFamily: bodyFont,
            fontSize: 44,
            lineHeight: 1.4,
            marginTop: 16,
          }}
        >
          {props.contact.phone}
        </div>
        <div style={{ fontFamily: bodyFont, fontSize: 35, lineHeight: 1.5 }}>
          {props.contact.email}
        </div>
        <div style={{ fontFamily: bodyFont, fontSize: 35, lineHeight: 1.5 }}>
          {props.contact.website}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: safe.left,
          top: 1258,
          width: safe.width,
          borderTop: `1px solid ${theme.lineLight}`,
          paddingTop: 28,
          fontFamily: bodyFont,
          fontSize: 27,
          lineHeight: 1.5,
          color: theme.setupOnLight,
        }}
      >
        {props.disclaimer}
      </div>
      <div
        style={{
          position: "absolute",
          left: safe.left,
          top: 1554,
          width: safe.width,
          fontFamily: bodyFont,
          fontSize: 23,
          color: theme.setupOnLight,
        }}
      >
        Includes an AI presenter and labelled process illustrations.
      </div>
    </AbsoluteFill>
  );
};

export const SuperBasePresenterPromo: React.FC<SuperBasePresenterProps> = (
  props,
) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const seconds = frame / fps;
  const chapter = props.chapters.find(
    (item) => seconds >= item.fromSeconds && seconds < item.toSeconds,
  );
  const activeShot = props.shots.find(
    (shot) => seconds >= shot.fromSeconds && seconds < shot.toSeconds,
  );
  const narrationFrames = Math.round(props.narrationSeconds * fps);
  const isNarration = frame < narrationFrames;
  return (
    <AbsoluteFill
      style={{ background: theme.background, fontFamily: bodyFont }}
    >
      {!props.previewOnlySeed ? (
        <>
          <Sequence durationInFrames={narrationFrames} layout="none">
            <Audio
              src={staticFile(props.audio.narrationSrc)}
              volume={() => props.audio.narrationVolume}
            />
          </Sequence>
          <Audio
            src={staticFile(props.audio.musicSrc)}
            volume={(f) => {
              const level = interpolate(
                f,
                [narrationFrames - 1, narrationFrames + fps * 1.3],
                [props.audio.musicUnderVoice, props.audio.musicEndCard],
                clamp,
              );
              return (
                level *
                interpolate(
                  f,
                  [
                    0,
                    fps * 0.8,
                    durationInFrames - fps * 2.5,
                    durationInFrames - 1,
                  ],
                  [0, 1, 1, 0],
                  clamp,
                )
              );
            }}
          />
        </>
      ) : null}
      {isNarration && chapter ? (
        <>
          <div style={{ position: "absolute", left: safe.left, top: 104 }}>
            <Logo />
          </div>
          <div style={{ position: "absolute", left: safe.left, top: 213 }}>
            <Lane width={safe.width} moving={props.motion !== "reduced"} />
          </div>
          <Heading
            chapter={chapter}
            reduced={props.motion === "reduced"}
            seconds={seconds}
          />
          {getPresenterTimeline(props, fps).map(
            ({ shot, from, durationInFrames: duration }) => (
              <Sequence
                key={shot.id}
                from={from}
                durationInFrames={duration}
                layout="none"
              >
                <div
                  style={{
                    position: "absolute",
                    ...safe,
                    top: 430,
                    height: 780,
                    overflow: "hidden",
                  }}
                >
                  <Footage shot={shot} reduced={props.motion === "reduced"} />
                </div>
              </Sequence>
            ),
          )}
          <Sequence durationInFrames={narrationFrames} layout="none">
            <Presenter props={props} inset={Boolean(activeShot)} />
          </Sequence>
          {activeShot ? (
            <div
              style={{
                position: "absolute",
                left: safe.left,
                top: 1234,
                width: 520,
                color: theme.muted,
                fontFamily: bodyFont,
              fontSize: 24,
              lineHeight: 1.35,
              whiteSpace: "pre-line",
              }}
            >
              {activeShot.caption}
              <div style={{ marginTop: 28 }}>
                <MethodProgress step={chapter.step} />
              </div>
            </div>
          ) : null}
          <div
            style={{
              position: "absolute",
              left: safe.left,
              top: activeShot ? 1425 : 1442,
              width: 520,
              fontFamily: bodyFont,
              fontSize: 22,
              lineHeight: 1.2,
              color: theme.setup,
            }}
          >
            {props.presenter.disclosure}
          </div>
          <Subtitles props={props} seconds={seconds} />
        </>
      ) : null}
      <Sequence
        from={narrationFrames}
        durationInFrames={Math.round(props.endCardSeconds * fps)}
      >
        <EndCard props={props} />
      </Sequence>
    </AbsoluteFill>
  );
};
