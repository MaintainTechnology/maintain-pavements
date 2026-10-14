import React from "react";
import {
  AbsoluteFill,
  Audio,
  Freeze,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { DisclaimerStrip, EndCard, InsertLayer, Masthead, Qualifier, StepSuper, Subtitles, TitleOpen } from "./components";
import { getBodyFrames, getHfReelDurationInFrames, type HfReelProps, type HfSegment } from "./schema";
import { layout, theme } from "./theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const DISSOLVE = 6;
const TITLE_FADE = 6; // title content dips to charcoal before the cut to the presenter
const END_FADE = 8; // end card rises from charcoal after the last word
const AUDIO_RAMP = 2; // frames of gain ramp at every clip join, to avoid ticks

type Piece = HfSegment["pieces"][number];

const presenterStyle = (segment: HfSegment): React.CSSProperties => ({
  position: "absolute",
  left: 0,
  top: layout.presenterOffsetY + segment.presenterDy,
  width: 1080,
  height: 1920,
  maxWidth: "none",
  maxHeight: "none",
  transform: `scale(${segment.presenterScale})`,
  transformOrigin: "50% 0",
});

const PresenterPiece: React.FC<{ segment: HfSegment; piece: Piece; fadeIn: boolean }> = ({ segment, piece, fadeIn }) => {
  const frame = useCurrentFrame();
  const opacity = fadeIn ? interpolate(frame, [0, DISSOLVE], [0, 1], clamp) : 1;
  const length = piece.durationInFrames;
  return (
    <AbsoluteFill style={{ opacity }}>
      <OffthreadVideo
        src={staticFile(segment.clip)}
        trimBefore={piece.clipFromFrame}
        volume={(f) =>
          segment.voiceGain *
          interpolate(f, [0, AUDIO_RAMP, length - AUDIO_RAMP, length], [0, 1, 1, 0], clamp)
        }
        style={presenterStyle(segment)}
      />
    </AbsoluteFill>
  );
};

/** One segment's presenter pieces. Under the next segment's dissolve, the last frame is held (silent). */
const Presenter: React.FC<{ segment: HfSegment; tail: number }> = ({ segment, tail }) => {
  const last = segment.pieces[segment.pieces.length - 1];
  return (
    <>
      {segment.pieces.map((piece, i) => (
        <Sequence key={i} from={piece.from} durationInFrames={piece.durationInFrames} layout="none">
          <PresenterPiece segment={segment} piece={piece} fadeIn={i === 0 && segment.dissolveIn} />
        </Sequence>
      ))}
      {tail > 0 ? (
        <Sequence from={last.from + last.durationInFrames} durationInFrames={tail} layout="none">
          <Freeze frame={0}>
            <AbsoluteFill>
              <OffthreadVideo
                src={staticFile(segment.clip)}
                muted
                trimBefore={last.clipFromFrame + last.durationInFrames - 1}
                style={presenterStyle(segment)}
              />
            </AbsoluteFill>
          </Freeze>
        </Sequence>
      ) : null}
    </>
  );
};

const SegmentLayers: React.FC<{ segment: HfSegment }> = ({ segment }) => (
  <>
    {segment.inserts.map((insert, i) => (
      <Sequence key={i} from={insert.from} durationInFrames={insert.to - insert.from} layout="none">
        <InsertLayer insert={insert} />
      </Sequence>
    ))}
    {segment.stepName ? (
      <Sequence from={6} durationInFrames={Math.min(90, segment.durationInFrames - 6)} layout="none">
        <StepSuper name={segment.stepName} holdFrames={Math.min(78, segment.durationInFrames - 14)} />
      </Sequence>
    ) : null}
    {segment.caption ? (
      <Sequence from={segment.caption.from} durationInFrames={segment.caption.to - segment.caption.from} layout="none">
        <Qualifier text={segment.caption.text} />
      </Sequence>
    ) : null}
    <Subtitles cues={segment.cues} segmentFrames={segment.durationInFrames} />
  </>
);

/** The masthead lives above every segment so it never re-animates; only its label and step number change. */
const BodyMasthead: React.FC<{ props: HfReelProps }> = ({ props }) => {
  const frame = useCurrentFrame();
  const segment = [...props.segments].reverse().find((s) => frame >= s.from) ?? props.segments[0];
  const local = frame - segment.from;
  const insert = segment.inserts.find((i) => local >= i.from && local < i.to);
  return <Masthead label={insert ? insert.label : props.presenterLabel} step={segment.step} />;
};

const Body: React.FC<{ props: HfReelProps }> = ({ props }) => {
  const segments = props.segments;
  const cta = segments[segments.length - 1];
  return (
    <AbsoluteFill style={{ background: theme.charcoal }}>
      {segments.map((segment, i) => (
        <Sequence key={segment.id} from={segment.from} durationInFrames={segment.durationInFrames + (segments[i + 1]?.dissolveIn ? DISSOLVE : 0)} layout="none">
          <Presenter segment={segment} tail={segments[i + 1]?.dissolveIn ? DISSOLVE : 0} />
        </Sequence>
      ))}
      {segments.map((segment) => (
        <Sequence key={`${segment.id}-layers`} from={segment.from} durationInFrames={segment.durationInFrames} layout="none">
          <SegmentLayers segment={segment} />
        </Sequence>
      ))}
      <Sequence from={cta.from + 6} durationInFrames={cta.durationInFrames - 6} layout="none">
        <DisclaimerStrip text={props.endCard.disclaimer} />
      </Sequence>
      <BodyMasthead props={props} />
    </AbsoluteFill>
  );
};

const TitleLayer: React.FC<{ props: HfReelProps }> = ({ props }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [props.titleFrames - TITLE_FADE, props.titleFrames], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity }}>
      <TitleOpen {...props.title} />
    </AbsoluteFill>
  );
};

const EndLayer: React.FC<{ props: HfReelProps }> = ({ props }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: interpolate(frame, [0, END_FADE], [0, 1], clamp) }}>
      <EndCard {...props.endCard} />
    </AbsoluteFill>
  );
};

export const HfReel: React.FC<HfReelProps> = (props) => {
  const bodyFrames = getBodyFrames(props);
  const total = getHfReelDurationInFrames(props);
  const bodyStart = props.titleFrames;
  const endStart = bodyStart + bodyFrames;
  const { bedVolume, openVolume, ctaBedVolume } = props.music;
  const ctaStart = bodyStart + props.segments[props.segments.length - 1].from;
  return (
    <AbsoluteFill style={{ background: theme.charcoal }}>
      <Sequence durationInFrames={bodyStart} layout="none">
        <TitleLayer props={props} />
      </Sequence>
      <Sequence from={bodyStart} durationInFrames={bodyFrames} layout="none">
        <Body props={props} />
      </Sequence>
      <Sequence from={endStart} durationInFrames={props.endFrames} layout="none">
        <EndLayer props={props} />
      </Sequence>
      <Audio
        src={staticFile(props.music.src)}
        volume={(f) =>
          interpolate(
            f,
            [0, 12, bodyStart - 4, bodyStart + 10, ctaStart - 15, ctaStart + 15, endStart, endStart + 18, total - 36, total - 1],
            [0, openVolume, openVolume, bedVolume, bedVolume, ctaBedVolume, ctaBedVolume, openVolume, openVolume, 0],
            clamp,
          )
        }
      />
    </AbsoluteFill>
  );
};
