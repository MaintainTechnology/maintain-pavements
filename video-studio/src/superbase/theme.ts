import { loadFont as loadFigtree } from "@remotion/google-fonts/Figtree";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { createContext, useContext } from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

export const PromoMotionContext = createContext<"full" | "reduced">("full");

export const { fontFamily: headlineFont } = loadFigtree("normal", {
  weights: ["600", "700", "800"],
  subsets: ["latin"],
});

export const { fontFamily: bodyFont } = loadInter("normal", {
  weights: ["400", "500", "600"],
  subsets: ["latin"],
});

export const palette = {
  charcoal: "#25282A",
  panel: "#2F3233",
  ink: "#26282B",
  slate: "#5C6670",
  grey: "#99A1A7",
  paper: "#F5F4F1",
  white: "#FFFFFF",
  rule: "#52585C",
} as const;

export const usePromoLayout = () => {
  const { width, height } = useVideoConfig();
  const portrait = height > width * 1.2;
  const landscape = width > height * 1.2;
  const scale = Math.min(width, height) / 1080;
  return {
    width,
    height,
    portrait,
    landscape,
    scale,
    margin: (portrait ? 72 : 60) * scale,
    titleSize: (portrait ? 108 : landscape ? 96 : 60) * scale,
  };
};

export const useEntrance = (offset = 0) => {
  const motion = useContext(PromoMotionContext);
  const frame = useCurrentFrame() + offset;
  const progress = interpolate(frame, [0, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const eased = Easing.bezier(0.23, 1, 0.32, 1)(progress);
  if (motion === "reduced") return { opacity: 1, transform: "none" };
  return { opacity: progress, transform: `translateY(${(1 - eased) * 24}px)` };
};
