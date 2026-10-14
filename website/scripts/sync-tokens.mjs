// The design system owns the tokens. This copies them in before every dev/build run so the site
// never drifts. No design-system folder (e.g. a deploy of website/ alone)? Keep the committed copy.
import { copyFileSync, existsSync } from "node:fs";

const source = new URL("../../design-system/tokens.css", import.meta.url);
if (existsSync(source)) copyFileSync(source, new URL("../app/tokens.css", import.meta.url));
