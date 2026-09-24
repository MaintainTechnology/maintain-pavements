import React from "react";
import { AbsoluteFill } from "remotion";
import { SuperBasePromoProps, SuperBaseShot } from "./schema";
import {
  bodyFont,
  headlineFont,
  palette,
  useEntrance,
  usePromoLayout,
} from "./theme";

export const Kicker: React.FC<{
  children: React.ReactNode;
  light?: boolean;
}> = ({ children, light = false }) => {
  const { scale, portrait } = usePromoLayout();
  return (
    <div style={{ display: "flex", gap: 20 * scale, alignItems: "center" }}>
      <div
        style={{
          height: 2 * scale,
          width: 48 * scale,
          background: palette.grey,
        }}
      />
      <div
        style={{
          fontFamily: bodyFont,
          fontSize: (portrait ? 27 : 23) * scale,
          lineHeight: 1.3,
          fontWeight: 600,
          letterSpacing: 3.5 * scale,
          textTransform: "uppercase",
          color: light ? palette.slate : palette.grey,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const TwoToneHeadline: React.FC<{
  setup: string;
  payoff: string;
  light?: boolean;
  fontSize?: number;
}> = ({ setup, payoff, light = false, fontSize }) => {
  const { titleSize } = usePromoLayout();
  return (
    <div
      style={{
        fontFamily: headlineFont,
        fontWeight: 800,
        letterSpacing: "-0.04em",
        lineHeight: 0.98,
        fontSize: fontSize ?? titleSize,
      }}
    >
      <div style={{ color: light ? palette.slate : palette.grey }}>{setup}</div>
      <div
        style={{
          color: light ? palette.ink : palette.white,
          marginTop: "0.06em",
        }}
      >
        {payoff}
      </div>
    </div>
  );
};

const stepNames = ["Prepare", "Dose + mix", "Grade", "Roll + compact", "Cure"];

export const StepCounter: React.FC<{ step: number; light?: boolean }> = ({
  step,
  light = false,
}) => {
  const { scale, portrait, landscape } = usePromoLayout();
  const active = light ? palette.ink : palette.white;
  return (
    <div style={{ fontFamily: bodyFont }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 22 * scale }}>
        <span
          style={{
            fontFamily: headlineFont,
            fontWeight: 600,
            fontSize: (portrait ? 78 : 64) * scale,
            color: active,
            letterSpacing: -3 * scale,
          }}
        >
          {String(step).padStart(2, "0")}
        </span>
        <span
          style={{
            fontSize: (portrait ? 26 : landscape ? 26 : 20) * scale,
            color: light ? palette.slate : palette.grey,
            textTransform: "uppercase",
            letterSpacing: 2.5 * scale,
          }}
        >
          {stepNames[step - 1]}
        </span>
      </div>
      <div style={{ display: "flex", gap: 10 * scale, marginTop: 8 * scale }}>
        {stepNames.map((name, index) => (
          <div key={name} style={{ flex: 1 }}>
            <div
              style={{
                height: 3 * scale,
                background:
                  index + 1 === step
                    ? active
                    : light
                      ? "#CED0CE"
                      : palette.rule,
              }}
            />
            <div
              style={{
                marginTop: 8 * scale,
                fontSize: 18 * scale,
                color: index + 1 === step ? active : palette.grey,
              }}
            >
              {String(index + 1).padStart(2, "0")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const BrandHeader: React.FC<{
  brandName: string;
  productName: string;
  light?: boolean;
}> = ({ brandName, productName, light = false }) => {
  const { margin, scale, portrait, landscape } = usePromoLayout();
  return (
    <div
      style={{
        position: "absolute",
        top: margin,
        left: margin,
        right: margin,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 20 * scale,
        fontFamily: bodyFont,
        fontWeight: 600,
        fontSize: (portrait ? 27 : landscape ? 24 : 19) * scale,
        letterSpacing: 2 * scale,
        color: light ? palette.ink : palette.white,
        textTransform: "uppercase",
        zIndex: 3,
      }}
    >
      <span>{brandName}</span>
      <span
        style={{ color: light ? palette.slate : palette.grey, fontWeight: 400 }}
      >
        {productName}
      </span>
    </div>
  );
};

export const TextLines: React.FC<{ text: string }> = ({ text }) => (
  <>
    {text.split("\n").map((line, index) => (
      <React.Fragment key={index}>
        {index > 0 ? <br /> : null}
        {line}
      </React.Fragment>
    ))}
  </>
);

export const EndCard: React.FC<
  Pick<
    SuperBasePromoProps,
    "brandName" | "productName" | "contact" | "disclaimer"
  > &
    Pick<SuperBaseShot, "kicker" | "setup" | "payoff" | "body">
> = ({
  brandName,
  productName,
  contact,
  disclaimer,
  kicker,
  setup,
  payoff,
  body,
}) => {
  const { portrait, landscape, scale, margin, height, width } =
    usePromoLayout();
  const entrance = useEntrance();
  return (
    <AbsoluteFill
      style={{
        background: palette.charcoal,
        color: palette.white,
        fontFamily: bodyFont,
      }}
    >
      <BrandHeader brandName={brandName} productName={productName} />
      <div
        style={{
          position: "absolute",
          left: margin,
          right: margin,
          top: portrait ? 290 * scale : 185 * scale,
          ...entrance,
        }}
      >
        <Kicker>{kicker}</Kicker>
        <div
          style={{
            marginTop: (portrait ? 54 : 32) * scale,
            maxWidth: landscape ? width * 0.51 : undefined,
          }}
        >
          <TwoToneHeadline
            setup={setup}
            payoff={payoff}
            fontSize={(portrait ? 128 : landscape ? 116 : 90) * scale}
          />
        </div>
        <div
          style={{
            color: palette.grey,
            fontSize: (portrait ? 35 : 30) * scale,
            lineHeight: 1.45,
            maxWidth: landscape ? width * 0.46 : undefined,
            marginTop: 38 * scale,
          }}
        >
          <TextLines text={body} />
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: landscape ? width * 0.6 : margin,
          right: margin,
          top: portrait ? 985 * scale : landscape ? 253 * scale : 590 * scale,
          borderTop: `1px solid ${palette.rule}`,
          paddingTop: 30 * scale,
        }}
      >
        <div
          style={{
            color: palette.grey,
            fontSize: (portrait ? 30 : 25) * scale,
            marginBottom: 14 * scale,
          }}
        >
          {contact.name}
        </div>
        <div
          style={{
            fontFamily: headlineFont,
            fontSize: (portrait ? 70 : landscape ? 59 : 50) * scale,
            fontWeight: 600,
            letterSpacing: -2 * scale,
            whiteSpace: "nowrap",
          }}
        >
          {contact.phone}
        </div>
        <div
          style={{
            fontSize: (portrait ? 40 : 31) * scale,
            marginTop: 20 * scale,
          }}
        >
          {contact.email}
        </div>
        <div
          style={{
            fontSize: (portrait ? 40 : 31) * scale,
            marginTop: 13 * scale,
            color: palette.grey,
          }}
        >
          {contact.website}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: margin,
          right: margin,
          bottom: margin,
          borderTop: `1px solid ${palette.rule}`,
          paddingTop: 27 * scale,
          maxHeight: height * 0.25,
          color: "#D0D3D5",
          fontSize: (portrait ? 34 : landscape ? 28 : 27) * scale,
          lineHeight: 1.5,
        }}
      >
        {disclaimer}
      </div>
    </AbsoluteFill>
  );
};
