import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { bodyFont, palette } from "../superbase/theme";

// A process diagram, not site evidence or a numerical crossfall specification.
export const GradingSchematic: React.FC<{
  durationInFrames: number;
  reducedMotion: boolean;
}> = ({ durationInFrames, reducedMotion }) => {
  const frame = useCurrentFrame();
  const fraction = reducedMotion
    ? 0.76
    : interpolate(frame, [8, durationInFrames - 28], [0.14, 0.94], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
  const toolX = 80 + fraction * 920;
  const toolY = 589 + fraction * 38;
  const roughPoints = Array.from(
    { length: 47 },
    (_, index) =>
      `${80 + index * 20},${610 + Math.sin(index * 2.1) * 23 + Math.cos(index * 0.9) * 11}`,
  ).join(" ");
  const opacity = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        background: palette.charcoal,
        opacity,
        color: palette.white,
        fontFamily: bodyFont,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 72,
          top: 124,
          color: palette.grey,
          fontSize: 27,
          letterSpacing: 2.5,
        }}
      >
        TRIM TO LEVEL + CROSSFALL
      </div>
      <svg
        viewBox="0 0 1080 1080"
        width={1080}
        height={1080}
        aria-label="Illustrative cross-section: a levelling bar moves across rough material, leaving a smooth surface with a slight fall."
      >
        <defs>
          <clipPath id="graded-zone">
            <rect x={80} y={350} width={toolX - 80} height={520} />
          </clipPath>
          <clipPath id="rough-zone">
            <rect x={toolX} y={350} width={1000 - toolX} height={520} />
          </clipPath>
          <pattern
            id="base-granules"
            width={36}
            height={31}
            patternUnits="userSpaceOnUse"
          >
            <circle cx={7} cy={9} r={3} fill="#25282A" opacity={0.3} />
            <circle cx={27} cy={21} r={4} fill="#F5F4F1" opacity={0.22} />
            <path d="M13 22 L17 18 L23 25 Z" fill="#25282A" opacity={0.35} />
          </pattern>
        </defs>
        <line
          x1={80}
          y1={833}
          x2={1000}
          y2={833}
          stroke={palette.rule}
          strokeWidth={2}
        />
        <g clipPath="url(#rough-zone)">
          <polygon
            points={`${roughPoints} 1000,830 80,830`}
            fill={palette.slate}
          />
          <polygon
            points={`${roughPoints} 1000,830 80,830`}
            fill="url(#base-granules)"
          />
          <polyline
            points={roughPoints}
            fill="none"
            stroke={palette.grey}
            strokeWidth={4}
          />
        </g>
        <g clipPath="url(#graded-zone)">
          <polygon points="80,589 1000,627 1000,830 80,830" fill="#ADB3B6" />
          <polygon
            points="80,589 1000,627 1000,830 80,830"
            fill="url(#base-granules)"
          />
          <line
            x1={80}
            y1={589}
            x2={1000}
            y2={627}
            stroke={palette.paper}
            strokeWidth={5}
          />
        </g>
        <g transform={`translate(${toolX}, ${toolY})`}>
          <path
            d="M-74 -16 L-74 -61 L74 -61 L74 -16 Z"
            fill={palette.charcoal}
            stroke={palette.paper}
            strokeWidth={5}
          />
          {[-48, -16, 16, 48].map((x) => (
            <line
              key={x}
              x1={x}
              y1={-60}
              x2={x}
              y2={-16}
              stroke={palette.paper}
              strokeWidth={4}
            />
          ))}
          <line
            x1={-83}
            y1={-9}
            x2={83}
            y2={-2}
            stroke={palette.paper}
            strokeWidth={8}
          />
          <line
            x1={0}
            y1={-63}
            x2={0}
            y2={-140}
            stroke={palette.grey}
            strokeWidth={2}
          />
        </g>
        <text
          x={toolX}
          y={toolY - 162}
          textAnchor="middle"
          fill={palette.paper}
          fontFamily={bodyFont}
          fontSize={26}
        >
          Levelling bar
        </text>
        <text
          x={82}
          y={920}
          fill={palette.grey}
          fontFamily={bodyFont}
          fontSize={27}
        >
          Workable base
        </text>
        <text
          x={1000}
          y={920}
          textAnchor="end"
          fill={palette.grey}
          fontFamily={bodyFont}
          fontSize={27}
        >
          Slight designed fall
        </text>
      </svg>
      <div
        style={{
          position: "absolute",
          left: 72,
          right: 72,
          bottom: 51,
          borderTop: `1px solid ${palette.rule}`,
          paddingTop: 22,
          fontSize: 27,
          color: palette.grey,
        }}
      >
        Grading schematic · not to scale
      </div>
    </AbsoluteFill>
  );
};
