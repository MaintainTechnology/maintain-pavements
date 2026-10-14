import brandTokens from "../../public/brand/tokens.json";
export { bodyFont, headlineFont } from "../superbase/theme";

// Resolve the published semantic roles; the design-system tokens are canonical.
const role = (name: keyof typeof brandTokens.semantic) => {
  const value = brandTokens.semantic[name];
  return value in brandTokens.brand
    ? brandTokens.brand[value as keyof typeof brandTokens.brand]
    : value;
};
export const theme = {
  background: role("bg"),
  panel: role("bg-raised"),
  deep: role("bg-deep"),
  paper: role("surface-soft"),
  ink: role("text"),
  white: role("on-dark"),
  muted: role("on-dark-muted"),
  setup: role("setup"),
  setupOnLight: role("setup-on-light"),
  line: role("line"),
  lineLight: role("line-light"),
};
