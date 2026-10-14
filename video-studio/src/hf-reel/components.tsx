import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  OffthreadVideo,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { HfCue, HfInsert, HfMask } from "./schema";
import { bodyFont, ease, headlineFont, layout, theme } from "./theme";

const bezier = Easing.bezier(...ease);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
// Tailwind's preflight caps img/video at max-width: 100%; media here is positioned and scaled explicitly.
const uncapped: React.CSSProperties = { maxWidth: "none", maxHeight: "none" };
const ms = (value: number, fps: number) => Math.round((value / 1000) * fps);

/** Opacity + short rise, eased; the design system's 320 ms reveal. */
export const useReveal = (delay = 0, durationMs = 320, rise = 16) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = bezier(interpolate(frame - delay, [0, ms(durationMs, fps)], [0, 1], clamp));
  return { opacity: p, transform: `translateY(${(1 - p) * rise}px)` };
};

export const Wordmark: React.FC<{ width: number; style?: React.CSSProperties }> = ({ width, style }) => (
  <Img src={staticFile("brand/wordmark-on-dark.svg")} style={{ width, height: "auto", display: "block", ...style }} />
);

/** 3 px lane line: 24 dash / 16 gap; optional 40 px crawl per 2.4 s. */
export const Lane: React.FC<{ top: number; left?: number; width?: number; crawl?: boolean }> = ({
  top,
  left = layout.columnLeft,
  width = layout.columnWidth,
  crawl = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const offset = crawl ? ((frame / (2.4 * fps)) * 40) % 40 : 0;
  return (
    <div
      style={{
        position: "absolute",
        top,
        left,
        width,
        height: 3,
        overflow: "hidden",
      }}
    >
      <svg width={width + 40} height={3} style={{ transform: `translateX(${-offset}px)` }}>
        <line x1={0} y1={1.5} x2={width + 40} y2={1.5} stroke={theme.white} strokeWidth={3} strokeDasharray="24 16" />
      </svg>
    </div>
  );
};

export const Label: React.FC<{ text: string; color?: string; size?: number }> = ({
  text,
  color = theme.greyLight,
  size = 22,
}) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
    <div style={{ width: 28, height: 2, background: color }} />
    <div
      style={{
        fontFamily: bodyFont,
        fontWeight: 600,
        fontSize: size,
        letterSpacing: "0.24em",
        textTransform: "uppercase",
        color,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  </div>
);

/** Solid charcoal band carrying the wordmark, provenance label and step number. Never re-animates. */
export const Masthead: React.FC<{ label: string; step: number | null }> = ({ label, step }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      top: 0,
      width: layout.width,
      height: layout.mastheadHeight,
      background: theme.charcoal,
    }}
  >
    <Wordmark
      width={layout.mastheadLogoWidth}
      style={{ position: "absolute", left: layout.columnLeft, top: layout.mastheadLogoTop }}
    />
    <div style={{ position: "absolute", left: layout.columnLeft, top: layout.labelTop }}>
      <Label text={label} size={24} />
    </div>
    {step !== null ? (
      <div
        style={{
          position: "absolute",
          right: layout.width - (layout.columnLeft + layout.columnWidth),
          top: layout.mastheadLogoTop - 10,
          fontFamily: headlineFont,
          fontWeight: 800,
          fontSize: 112,
          lineHeight: 0.9,
          letterSpacing: "-0.02em",
          color: theme.white,
          fontFeatureSettings: "'tnum'",
        }}
      >
        {String(step).padStart(2, "0")}
      </div>
    ) : null}
    <Lane top={layout.laneTop} crawl />
  </div>
);

/** Step name bar under the masthead, revealed 6 frames into each step. */
export const StepSuper: React.FC<{ name: string; holdFrames: number }> = ({ name, holdFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const reveal = useReveal(0, 320, 12);
  const out = interpolate(frame, [holdFrames, holdFrames + ms(200, fps)], [1, 0], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: layout.columnLeft,
        top: layout.superTop,
        width: layout.columnWidth,
        height: layout.superHeight,
        background: theme.plateSuper,
        opacity: reveal.opacity * out,
        transform: reveal.transform,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 24,
          top: 0,
          height: layout.superHeight,
          display: "flex",
          alignItems: "center",
          fontFamily: bodyFont,
          fontWeight: 600,
          fontSize: 26,
          letterSpacing: "0.24em",
          textTransform: "uppercase",
          color: theme.white,
        }}
      >
        {name}
      </div>
    </div>
  );
};

/** Phrase-chunk subtitles on flat per-line charcoal plates. Hard cuts between chunks. */
export const Subtitles: React.FC<{ cues: HfCue[]; segmentFrames: number }> = ({ cues, segmentFrames }) => {
  const frame = useCurrentFrame();
  const cue = cues.find((c) => frame >= c.from && frame < c.to);
  if (!cue || !cue.burnIn) return null;
  const isLast = cue === cues[cues.length - 1];
  const fadeOut = isLast ? interpolate(frame, [Math.min(cue.to, segmentFrames) - 4, Math.min(cue.to, segmentFrames)], [1, 0], clamp) : 1;
  return (
    <div
      style={{
        position: "absolute",
        left: layout.columnLeft,
        width: layout.columnWidth,
        bottom: layout.height - layout.subtitleBottom,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        opacity: fadeOut,
      }}
    >
      {cue.lines.map((line) => (
        <span
          key={line}
          style={{
            fontFamily: bodyFont,
            fontWeight: 600,
            fontSize: 50,
            lineHeight: 1.36,
            color: theme.white,
            background: theme.plateSubtitle,
            padding: "4px 16px",
            whiteSpace: "nowrap",
          }}
        >
          {line}
        </span>
      ))}
    </div>
  );
};

/** Small qualifier line that sits above the subtitle block. */
export const Qualifier: React.FC<{ text: string }> = ({ text }) => {
  const reveal = useReveal(0, 200, 8);
  return (
    <div
      style={{
        position: "absolute",
        left: layout.columnLeft,
        bottom: layout.height - layout.subtitleBottom + 172,
        background: theme.plateSubtitle,
        padding: "10px 16px",
        ...reveal,
      }}
    >
      <Label text={text} color={theme.greyLight} size={22} />
    </div>
  );
};

const bodyTop = layout.mastheadHeight;
const bodyHeight = layout.height - layout.mastheadHeight;
const squareBottom = 1540; // Instagram bottom UI begins here

const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <svg width={layout.width} height={bodyHeight} style={{ position: "absolute", left: 0, top: 0, opacity: 0.07, mixBlendMode: "overlay" }}>
      <filter id={`grain-${frame % 4}`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={frame % 4} />
      </filter>
      <rect width="100%" height="100%" filter={`url(#grain-${frame % 4})`} />
    </svg>
  );
};

/** Position of a keyed blur mask at a given source time (seconds after trimStart), in source px. */
const maskAt = (mask: HfMask, t: number) => {
  const keys = mask.keys;
  if (t <= keys[0].t) return keys[0];
  const last = keys[keys.length - 1];
  if (t >= last.t) return last;
  const i = keys.findIndex((k) => k.t > t);
  const a = keys[i - 1], b = keys[i];
  const p = (t - a.t) / (b.t - a.t);
  return { t, x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p, w: a.w + (b.w - a.w) * p, h: a.h + (b.h - a.h) * p };
};

/** Blurred copies of the footage clipped to each tracked mask. place(dx, dy) positions the footage relative to a patch. */
const MaskPatches: React.FC<{
  insert: Extract<HfInsert, { kind: "portrait" | "square" }>;
  scale: number;
  originX: number;
  originY: number;
  place: (dx: number, dy: number) => React.CSSProperties;
}> = ({ insert, scale, originX, originY, place }) => {
  const frame = useCurrentFrame();
  const t = (frame / 30) * insert.playbackRate;
  return (
    <>
      {(insert.masks ?? []).map((mask, i) => {
        const r = maskAt(mask, t);
        const x = (r.x - originX) * scale;
        const y = (r.y - originY) * scale;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, width: r.w * scale, height: r.h * scale, overflow: "hidden" }}>
            <OffthreadVideo
              src={staticFile(insert.src)}
              muted
              playbackRate={insert.playbackRate}
              trimBefore={Math.round(insert.trimStartSeconds * 30)}
              style={{ ...place(x, y), filter: `saturate(0.92) blur(${mask.blur}px)` }}
            />
          </div>
        );
      })}
    </>
  );
};

/** Process footage, photographs and diagrams, drawn in the body window below the masthead. */
export const InsertLayer: React.FC<{ insert: HfInsert }> = ({ insert }) => {
  const frame = useCurrentFrame();
  const length = insert.to - insert.from;
  const window: React.CSSProperties = {
    position: "absolute",
    left: 0,
    top: bodyTop,
    width: layout.width,
    height: bodyHeight,
    overflow: "hidden",
    background: theme.charcoal,
  };
  if (insert.kind === "portrait") {
    const portraitPlace = (dx: number, dy: number): React.CSSProperties => ({
      ...uncapped,
      position: "absolute",
      left: -dx,
      top: -(1920 - bodyHeight) / 2 - dy,
      width: 1080,
      height: 1920,
      filter: "saturate(0.92)",
    });
    return (
      <div style={window}>
        <OffthreadVideo
          src={staticFile(insert.src)}
          muted
          playbackRate={insert.playbackRate}
          trimBefore={Math.round(insert.trimStartSeconds * 30)}
          style={portraitPlace(0, 0)}
        />
        <MaskPatches insert={insert} scale={1} originX={0} originY={(1920 - bodyHeight) / 2} place={portraitPlace} />
        <Grain />
      </div>
    );
  }
  if (insert.kind === "square") {
    // The landscape band (608 px tall) fills y 392–1540, so subtitles sit on picture rather than on the seam.
    const height = squareBottom - bodyTop - 24;
    const scale = height / 608;
    const place = (dx: number, dy: number): React.CSSProperties => ({
      ...uncapped,
      position: "absolute",
      left: -insert.cropX * scale - dx,
      top: -656 * scale - dy,
      width: 1080 * scale,
      height: 1920 * scale,
      filter: "saturate(0.92)",
    });
    return (
      <div style={window}>
        <div style={{ position: "absolute", left: 0, top: 24, width: layout.width, height, overflow: "hidden" }}>
          <OffthreadVideo
            src={staticFile(insert.src)}
            muted
            playbackRate={insert.playbackRate}
            trimBefore={Math.round(insert.trimStartSeconds * 30)}
            style={place(0, 0)}
          />
          <MaskPatches insert={insert} scale={scale} originX={insert.cropX} originY={656} place={place} />
        </div>
        <Grain />
      </div>
    );
  }
  if (insert.kind === "still") {
    const push = interpolate(frame, [0, length], [1, 1.05], clamp);
    const scale = Math.max(layout.width / insert.crop.w, bodyHeight / insert.crop.h);
    return (
      <div style={window}>
        <div style={{ position: "absolute", inset: 0, transform: `scale(${push})`, transformOrigin: "50% 45%" }}>
          <Img
            src={staticFile(insert.src)}
            style={{
              ...uncapped,
              position: "absolute",
              left: (layout.width - insert.crop.w * scale) / 2 - insert.crop.x * scale,
              top: (bodyHeight - insert.crop.h * scale) / 2 - insert.crop.y * scale,
              width: insert.sourceSize.w * scale,
              height: insert.sourceSize.h * scale,
              filter: "saturate(0.92)",
            }}
          />
        </div>
        <Grain />
      </div>
    );
  }
  return (
    <div style={window}>
      {insert.diagram === "depth" ? <DepthDiagram length={length} /> : <GradeDiagram length={length} />}
    </div>
  );
};

const DiagramNote: React.FC = () => (
  <div style={{ position: "absolute", left: layout.columnLeft, top: 900, width: layout.columnWidth, borderTop: `1px solid ${theme.lineStrong}`, paddingTop: 18 }}>
    <div style={{ fontFamily: bodyFont, fontWeight: 500, fontSize: 26, color: theme.faint }}>Illustrative diagram · not to scale</div>
  </div>
);

const Granules: React.FC<{ id: string; tone: "loose" | "bound" }> = ({ id, tone }) => (
  <pattern id={id} width={44} height={38} patternUnits="userSpaceOnUse">
    {tone === "loose" ? (
      <>
        <circle cx={8} cy={10} r={6} fill={theme.charcoal} opacity={0.55} />
        <circle cx={30} cy={24} r={7} fill={theme.greyLight} opacity={0.28} />
        <path d="M14 32 L21 22 L28 33 Z" fill={theme.charcoal} opacity={0.5} />
        <circle cx={38} cy={6} r={3} fill={theme.greyLight} opacity={0.3} />
      </>
    ) : (
      <>
        <circle cx={8} cy={10} r={3} fill={theme.charcoal} opacity={0.32} />
        <circle cx={28} cy={22} r={3.4} fill={theme.slate} opacity={0.55} />
        <circle cx={18} cy={33} r={2.4} fill={theme.charcoal} opacity={0.3} />
        <circle cx={38} cy={8} r={2} fill={theme.slate} opacity={0.5} />
      </>
    )}
  </pattern>
);

const DiagramTitle: React.FC<{ text: string; sub?: string; color?: string; style?: React.CSSProperties }> = ({ text, sub, color = theme.white, style }) => (
  <div style={{ position: "absolute", ...style }}>
    <div style={{ fontFamily: bodyFont, fontWeight: 600, fontSize: 38, color, lineHeight: 1.2 }}>{text}</div>
    {sub ? <div style={{ fontFamily: bodyFont, fontWeight: 500, fontSize: 30, color: theme.muted, marginTop: 6 }}>{sub}</div> : null}
  </div>
);

/** Dose and mix (PDF p.3): the binder sits through the full depth of the layer rather than on top of it. */
const DepthDiagram: React.FC<{ length: number }> = ({ length }) => {
  const frame = useCurrentFrame();
  const top = 330;
  const bottom = 780;
  const w = 380;
  const gap = layout.columnWidth - 2 * w;
  const leftA = layout.columnLeft;
  const leftB = layout.columnLeft + w + gap;
  const coat = 34;
  const p = bezier(interpolate(frame, [8, Math.max(14, length - 12)], [0, 1], clamp));
  const front = top + (bottom - top) * p;
  const a = useReveal(0, 320, 12);
  const b = useReveal(6, 320, 12);
  return (
    <AbsoluteFill>
      <svg width={layout.width} height={bodyHeight} style={{ position: "absolute", left: 0, top: 0 }}>
        <defs>
          <Granules id="loose" tone="loose" />
          <Granules id="bound" tone="bound" />
        </defs>
        {/* A: coat on top, loose base beneath */}
        <g opacity={a.opacity * 0.62}>
          <rect x={leftA} y={top} width={w} height={bottom - top} fill={theme.slate} />
          <rect x={leftA} y={top} width={w} height={bottom - top} fill="url(#loose)" />
          <rect x={leftA} y={top} width={w} height={coat} fill={theme.greyLight} />
          <line x1={leftA} y1={top} x2={leftA + w} y2={top} stroke={theme.white} strokeWidth={4} />
        </g>
        {/* B: bound through the full depth */}
        <g opacity={b.opacity}>
          <rect x={leftB} y={top} width={w} height={bottom - top} fill={theme.slate} />
          <rect x={leftB} y={top} width={w} height={bottom - top} fill="url(#loose)" />
          <rect x={leftB} y={top} width={w} height={front - top} fill={theme.greyLight} />
          <rect x={leftB} y={top} width={w} height={front - top} fill="url(#bound)" />
          {p < 0.995 ? <line x1={leftB} y1={front} x2={leftB + w} y2={front} stroke={theme.white} strokeWidth={4} strokeDasharray="24 16" /> : null}
          <line x1={leftB} y1={top} x2={leftB + w} y2={top} stroke={theme.white} strokeWidth={4} />
          <line x1={leftB} y1={bottom} x2={leftB + w} y2={bottom} stroke={theme.white} strokeWidth={2} opacity={0.5} />
        </g>
      </svg>
      <DiagramTitle text="Coat on top" sub="sits on the surface" color={theme.muted} style={{ left: leftA, top: top - 150, ...a, opacity: a.opacity * 0.8 }} />
      <DiagramTitle text="Full depth" sub="mixed through the layer" style={{ left: leftB, top: top - 150, ...b }} />
      <div style={{ position: "absolute", left: leftB, top: bottom + 28, ...b }}>
        <Label text="SuperBase" color={theme.white} size={22} />
      </div>
      <DiagramNote />
    </AbsoluteFill>
  );
};

/** Grade to level (PDF p.3): trimmed to design level and crossfall; getting fall right stops water ponding. */
const GradeDiagram: React.FC<{ length: number }> = ({ length }) => {
  const frame = useCurrentFrame();
  const left = layout.columnLeft;
  const right = layout.columnLeft + layout.columnWidth;
  const bottom = 800;
  const levelAt = (x: number) => 420 + ((x - left) / (right - left)) * 80; // designed fall to the right
  const roughAt = (x: number) => {
    const t = (x - left) / (right - left);
    const dip = Math.exp(-Math.pow((t - 0.45) / 0.1, 2)) * 70; // low spot that holds water
    return 440 + Math.sin(t * 17) * 20 + Math.cos(t * 6.1) * 14 + dip;
  };
  const sweep = bezier(interpolate(frame, [10, Math.max(18, length * 0.7)], [0, 1], clamp));
  // Snap to fully level as the blade disappears, so no rough remnant is left at the right edge.
  const barX = sweep >= 0.99 ? right : left + sweep * (right - left);
  const steps = 96;
  const surface = Array.from({ length: steps + 1 }, (_, i) => {
    const x = left + (i / steps) * (right - left);
    return `${x.toFixed(1)},${(x < barX || sweep >= 0.99 ? levelAt(x) : roughAt(x)).toFixed(1)}`;
  }).join(" ");
  const pondX = left + 0.45 * (right - left);
  const pond = interpolate(barX, [pondX - 60, pondX + 20], [1, 0], clamp);
  const runoff = interpolate(frame, [length * 0.7, length * 0.7 + 14], [0, 1], clamp);
  const intro = useReveal(0, 320, 12);
  const title = useReveal(8, 320, 10);
  return (
    <AbsoluteFill>
      <svg width={layout.width} height={bodyHeight} style={{ position: "absolute", left: 0, top: 0, ...intro }}>
        <defs>
          <Granules id="base" tone="loose" />
        </defs>
        <polygon points={`${surface} ${right},${bottom} ${left},${bottom}`} fill={theme.slate} />
        <polygon points={`${surface} ${right},${bottom} ${left},${bottom}`} fill="url(#base)" />
        <polyline points={surface} fill="none" stroke={theme.white} strokeWidth={5} strokeLinejoin="round" />
        <line x1={left} y1={bottom} x2={right} y2={bottom} stroke={theme.white} strokeWidth={2} opacity={0.5} />
        {/* Water sitting in the low spot until the surface is trimmed */}
        <path
          d={`M ${pondX - 92} ${roughAt(pondX) - 44} Q ${pondX} ${roughAt(pondX) + 10} ${pondX + 92} ${roughAt(pondX) - 44} Z`}
          fill={theme.white}
          opacity={0.6 * pond}
        />
        {sweep > 0.01 && sweep < 0.99 ? (
          <g transform={`translate(${barX}, ${levelAt(barX)})`}>
            <line x1={0} y1={-120} x2={0} y2={-8} stroke={theme.greyLight} strokeWidth={3} />
            <rect x={-14} y={-54} width={28} height={48} fill={theme.charcoal} stroke={theme.white} strokeWidth={5} />
          </g>
        ) : null}
        <g opacity={runoff}>
          <line x1={right - 360} y1={levelAt(right - 360) - 56} x2={right - 30} y2={levelAt(right - 30) - 56} stroke={theme.white} strokeWidth={4} />
          <path d={`M ${right - 22} ${levelAt(right - 22) - 55} l -30 -16 l 5 30 z`} fill={theme.white} />
        </g>
      </svg>
      <DiagramTitle text="Trimmed to level" sub="and crossfall" style={{ left, top: 200, ...title }} />
      <div style={{ position: "absolute", right: layout.width - right, top: 830, opacity: runoff }}>
        <Label text="Falls to shed water" color={theme.white} size={22} />
      </div>
      <DiagramNote />
    </AbsoluteFill>
  );
};

/** Two-tone Figtree headline: grey set-up, white pay-off. Words reveal with a 60 ms stagger. */
export const TwoTone: React.FC<{ setup: string; payoff: string; size: number; delay?: number; staggerMs?: number; revealMs?: number }> = ({
  setup,
  payoff,
  size,
  delay = 8,
  staggerMs = 60,
  revealMs = 620,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = [
    ...setup.split(" ").map((w) => ({ w, color: theme.setup })),
    ...payoff.split(" ").map((w) => ({ w, color: theme.white })),
  ];
  return (
    <div style={{ fontFamily: headlineFont, fontWeight: 800, fontSize: size, lineHeight: 1.05, letterSpacing: "-0.02em" }}>
      {words.map(({ w, color }, i) => {
        const start = delay + i * ms(staggerMs, fps);
        const p = bezier(interpolate(frame - start, [0, ms(revealMs, fps)], [0, 1], clamp));
        const breakBefore = i === setup.split(" ").length;
        return (
          <React.Fragment key={`${w}-${i}`}>
            {breakBefore ? <br /> : null}
            <span style={{ display: "inline-block", color, opacity: p, transform: `translateY(${(1 - p) * 28}px)`, marginRight: "0.24em" }}>
              {w}
            </span>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export const TitleOpen: React.FC<{ setup: string; payoff: string; caption: string }> = ({ setup, payoff, caption }) => (
  <AbsoluteFill style={{ background: theme.charcoal }}>
    <Img
      src={staticFile("brand/terrain-cover.jpg")}
      style={{ ...uncapped, position: "absolute", right: 0, bottom: 0, height: 900, width: 1600, mixBlendMode: "lighten", opacity: 0.9 }}
    />
    <Wordmark width={560} style={{ position: "absolute", left: layout.columnLeft, top: 400 }} />
    <div style={{ position: "absolute", left: layout.columnLeft, top: 640, width: layout.columnWidth }}>
      <TwoTone setup={setup} payoff={payoff} size={96} delay={2} staggerMs={35} revealMs={380} />
    </div>
    <div style={{ position: "absolute", left: layout.columnLeft, top: 1130, ...useReveal(10, 320, 8) }}>
      <Label text={caption} size={26} />
    </div>
  </AbsoluteFill>
);

export const EndCard: React.FC<{
  setup: string;
  payoff: string;
  name: string;
  phone: string;
  email: string;
  web: string;
  disclaimer: string;
  aiDisclosure: string;
}> = (p) => {
  const logo = useReveal(4, 320, 10);
  const contact = useReveal(8, 320, 10);
  const r = (i: number) => (i === 0 ? logo : contact);
  return (
    <AbsoluteFill style={{ background: theme.charcoal }}>
      <svg width={layout.width} height={layout.height} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <pattern id="setting-out" width={40} height={40} patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke={theme.grid} strokeWidth={1} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#setting-out)" />
      </svg>
      <Wordmark width={440} style={{ position: "absolute", left: layout.columnLeft, top: 280, ...r(0) }} />
      {/* Narrower measure so the set-up breaks as "Stop patching / the yard." instead of leaving an orphan. */}
      <div style={{ position: "absolute", left: layout.columnLeft, top: 440, width: 660 }}>
        <TwoTone setup={p.setup} payoff={p.payoff} size={96} delay={6} />
      </div>
      <Lane top={790} />
      <div style={{ position: "absolute", left: layout.columnLeft, top: 842, width: layout.columnWidth, ...r(2) }}>
        <div style={{ fontFamily: bodyFont, fontWeight: 600, fontSize: 36, color: theme.muted }}>{p.name}</div>
        <div style={{ fontFamily: headlineFont, fontWeight: 700, fontSize: 76, color: theme.white, fontFeatureSettings: "'tnum'", marginTop: 6 }}>
          {p.phone}
        </div>
        <div style={{ fontFamily: bodyFont, fontWeight: 500, fontSize: 44, color: theme.white, marginTop: 10 }}>{p.email}</div>
        <div style={{ fontFamily: bodyFont, fontWeight: 500, fontSize: 44, color: theme.muted, marginTop: 6 }}>{p.web}</div>
      </div>
      <div style={{ position: "absolute", left: layout.columnLeft, top: 1200, width: layout.columnWidth, height: 1, background: theme.line }} />
      <div
        style={{
          position: "absolute",
          left: layout.columnLeft,
          top: 1228,
          width: layout.columnWidth,
          fontFamily: bodyFont,
          fontWeight: 400,
          fontSize: 30,
          lineHeight: 1.45,
          color: theme.muted,
        }}
      >
        {p.disclaimer}
      </div>
      <div style={{ position: "absolute", left: layout.columnLeft, top: 1466, width: layout.columnWidth, fontFamily: bodyFont, fontWeight: 500, fontSize: 26, color: theme.muted }}>
        {p.aiDisclosure}
      </div>
    </AbsoluteFill>
  );
};

/** Micro-disclaimer strip carried from the ask (CTA) into the end card. */
export const DisclaimerStrip: React.FC<{ text: string }> = ({ text }) => {
  const reveal = useReveal(0, 320, 8);
  return (
    <div
      style={{
        position: "absolute",
        left: layout.columnLeft,
        top: layout.superTop,
        width: layout.columnWidth,
        background: theme.plateSuper,
        padding: "10px 20px",
        fontFamily: bodyFont,
        fontWeight: 400,
        fontSize: 24,
        lineHeight: 1.3,
        color: theme.muted,
        ...reveal,
      }}
    >
      {text}
    </div>
  );
};
