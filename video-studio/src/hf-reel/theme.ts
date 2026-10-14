import brandTokens from "../../public/brand/tokens.json";
export { bodyFont, headlineFont } from "../superbase/theme";

// Resolve published semantic roles; public/brand/tokens.json mirrors design-system/tokens.json.
const role = (name: keyof typeof brandTokens.semantic) => {
  const value = brandTokens.semantic[name];
  return value in brandTokens.brand
    ? brandTokens.brand[value as keyof typeof brandTokens.brand]
    : value;
};

export const theme = {
  charcoal: role("bg"),
  white: role("on-dark"),
  muted: role("on-dark-muted"),
  faint: role("on-dark-faint"),
  setup: role("setup"),
  greyLight: brandTokens.brand["grey-light"],
  slate: brandTokens.brand.slate,
  line: role("line"),
  lineStrong: role("line-strong"),
  // Plates are the charcoal brand colour at fixed opacity; no gradients or shadows.
  plateSubtitle: "rgba(38,40,43,0.88)",
  plateSuper: "rgba(38,40,43,0.92)",
  grid: "rgba(255,255,255,0.05)",
};

// Fixed 1080 × 1920 geometry. Instagram UI covers top 0–220, bottom 1540–1920 and right 940–1080.
export const layout = {
  width: 1080,
  height: 1920,
  columnLeft: 64,
  columnWidth: 824,
  mastheadHeight: 368,
  mastheadLogoTop: 244,
  mastheadLogoWidth: 232,
  labelTop: 318,
  laneTop: 365,
  superTop: 392,
  superHeight: 72,
  subtitleBottom: 1512,
  // Presenter clips are shifted down so the hard hat clears the masthead.
  presenterOffsetY: 300,
};

export const ease = [0.22, 1, 0.36, 1] as const;
