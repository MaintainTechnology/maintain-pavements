---
name: Maintain Pavements
description: Hardstand & Industrial Surfaces. One colour, two states.
colors:
  charcoal: "#26282B"
  panel: "#2F3233"
  deep: "#1C1E20"
  black: "#131416"
  grey: "#99A1A7"
  grey-light: "#C4CAD0"
  slate: "#5C6670"
  paper: "#F5F4F1"
  row: "#F1F1F2"
  tint: "#E4E6E8"
  white: "#FFFFFF"
  sev-pass-fg: "#0C4A26"
  sev-pass-bg: "#E5F8EE"
  sev-low-fg: "#1E40AF"
  sev-low-bg: "#DBEAFE"
  sev-medium-fg: "#854D0E"
  sev-medium-bg: "#FEF9C3"
  sev-high-fg: "#9A3412"
  sev-high-bg: "#FFEDD5"
  sev-critical-fg: "#991B1B"
  sev-critical-bg: "#FEE2E2"
typography:
  display:
    fontFamily: "Figtree, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "clamp(2.75rem, 6vw, 4.5rem)"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Figtree, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "clamp(2rem, 4vw, 3rem)"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Figtree, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "1.375rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  subtitle:
    fontFamily: "Figtree, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  figure:
    fontFamily: "Figtree, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "clamp(3.5rem, 9vw, 6rem)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.02em"
    fontFeature: "tnum"
  body:
    fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.24em"
rounded:
  sharp: "0"
  sm: "2px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "24px"
  "6": "32px"
  "7": "48px"
  "8": "64px"
  "9": "96px"
  "10": "128px"
components:
  button-primary:
    backgroundColor: "{colors.white}"
    textColor: "{colors.charcoal}"
    rounded: "{rounded.sm}"
    padding: "0.85em 1.2em"
  button-primary-hover:
    backgroundColor: "{colors.grey-light}"
    textColor: "{colors.charcoal}"
  button-primary-on-light:
    backgroundColor: "{colors.charcoal}"
    textColor: "{colors.white}"
    rounded: "{rounded.sm}"
    padding: "0.85em 1.2em"
  button-primary-on-light-hover:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.white}"
  button-quiet:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.white}"
    rounded: "{rounded.sm}"
    padding: "0.85em 1.2em"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.white}"
    rounded: "{rounded.sm}"
    padding: "0.85em 1.2em"
  button-ghost-on-light:
    backgroundColor: "transparent"
    textColor: "{colors.charcoal}"
    rounded: "{rounded.sm}"
    padding: "0.85em 1.2em"
  button-ghost-on-light-hover:
    backgroundColor: "{colors.charcoal}"
    textColor: "{colors.white}"
  field:
    backgroundColor: "{colors.white}"
    textColor: "{colors.charcoal}"
    rounded: "{rounded.sm}"
    padding: "0.72em 0.85em"
  chip-severity-high:
    backgroundColor: "{colors.sev-high-bg}"
    textColor: "{colors.sev-high-fg}"
    rounded: "{rounded.sm}"
    padding: "0.32em 0.7em"
  card-finding:
    backgroundColor: "{colors.white}"
    textColor: "{colors.charcoal}"
    rounded: "{rounded.sharp}"
    padding: "24px"
  panel-figure:
    backgroundColor: "{colors.charcoal}"
    textColor: "{colors.white}"
    typography: "{typography.figure}"
    rounded: "{rounded.sharp}"
    padding: "48px 32px"
  nav:
    backgroundColor: "{colors.charcoal}"
    textColor: "{colors.white}"
    height: "64px"
    padding: "0 24px"
  callout:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.grey}"
    typography: "{typography.headline}"
    rounded: "{rounded.sharp}"
    padding: "48px 32px"
  table-head:
    backgroundColor: "{colors.charcoal}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    padding: "12px 16px"
---

# Design System: Maintain Pavements

The durable visual decisions for the Maintain Pavements brand (v1, "Standing
Ground"). The machine-readable source of truth is
[`design-system/tokens.css`](design-system/tokens.css) /
[`tokens.json`](design-system/tokens.json); the living render is
[`design-system/index.html`](design-system/index.html). When this document and
the tokens disagree, the tokens win; then fix this document.

## Overview

**Creative North Star: "Standing Ground"**

Maintain Pavements builds bound hardstand out of the yard base a site already
has: dosed, mixed through the full depth, graded to level, rolled and
compacted. The brand looks like the finished pad: level, dense, quietly
engineered, done. Its name comes from Jon Pepper's own line, "the base you
already have, turned into standing ground".

The system is one colour in two states. Charcoal `#26282B`, the ground of the
chevron mark, is the brand: white on charcoal, charcoal on paper. Everything
else is the greys of the page, hairline rules and very large numbers. There is
no accent colour. Signal comes from the inversion itself, and colour comes from
the site photography: hi-vis, plant yellow, red soil, blue sky. The layout is
editorial and generous, in the manner of a capability statement rather than an
app: wide margins, sharp edges, tracked-caps captions, numbered steps, and
headlines that set up in grey and pay off in white.

The voice matches the look: measured, not asserted. Every figure travels with
its qualifier.

**Key Characteristics:**
- One brand colour, charcoal `#26282B`, used in two states; no accent.
- Figtree 800 two-tone headlines over Inter body; tracked-caps labels.
- Sharp corners (2px ceiling on small controls), hairline rules, flat surfaces.
- Numbers as heroes: the method's 01–05 and the big-number panel.
- Surveyed terrain art toned onto the charcoal ramp; real site photography first.

## Colors

A near-monochrome, industrial-premium palette: warm paper and cool charcoal,
with the greys of a printed page between them.

### Primary
- **Charcoal** (#26282B): the brand. The logo on light surfaces, the signature
  dark ground (cover, hero, call-out panels, table heads), and the ink of all
  body text and headlines on paper. Supplied as the ground of the brand mark,
  and identical to the ink of Jon's capability statement, whose cover prints a
  single step away at #25282A. Charcoal is canonical.

### Neutral
- **Charcoal Panel** (#2F3233): the raised panel on charcoal (Jon's p.6 call-out). White on it is 12.9:1.
- **Deep Charcoal** (#1C1E20): recessed wells and the footer. White on it is 16.7:1.
- **Black** (#131416): the deepest base; scrims and shadow tint only.
- **Mid Grey** (#99A1A7): the two-tone setup line and secondary detail **on dark only** (5.6:1 on charcoal; 2.6:1 on white, which fails).
- **Grey-Light** (#C4CAD0): icons, detail and hover fills on dark (8.9:1 on charcoal).
- **Slate** (#5C6670): muted text, captions and the two-tone setup line on light (5.9:1 on white, 5.3:1 on paper).
- **Paper** (#F5F4F1): the warm off-white page; charcoal on it is 13.4:1.
- **Row Tint** (#F1F1F2): alternating table rows.
- **Tint** (#E4E6E8): chips, code and highlight fills on light.
- **White** (#FFFFFF): pure surface for cards and fields, and the action colour on charcoal.

Text on dark uses white at three strengths: full, 72% (`--mp-on-dark-muted`,
8.4:1) and 55% (`--mp-on-dark-faint`, 5.5:1, captions and metadata only).
Hairlines are white at 12% on dark and charcoal at 14% on light; never opaque
grey borders.

**Status severity** (`--sev-pass|low|medium|high|critical`, fg/bg pairs in the
frontmatter) is the only hue in the system and is deliberately not brand:
functional traffic-light ratings for condition and defect findings. Every pair
clears 6.3:1. Always paired with a label, never colour alone.

### Named Rules
**The Two States Rule.** Charcoal on paper and white; white on charcoal. There is no third state. Charcoal on the dark grounds is 1.1:1, so the logo and any charcoal shape invert to white there.

**The No Accent Rule.** No brand hue exists beyond charcoal. The one primary action on a surface is made by inversion: white with charcoal ink on a dark ground, charcoal with white ink on a light one. If a surface seems to need colour, use a photograph.

**The Grey Setup Rule.** Mid grey #99A1A7 is a dark-ground colour. On paper or white the setup line of a two-tone headline is slate #5C6670 (`.mp-two-tone.on-light`).

## Typography

**Display Font:** Figtree (with system-ui fallback)
**Body Font:** Inter (with system-ui fallback)
**Label/Mono Font:** Inter tracked caps for labels; `ui-monospace` for code and token names only

**Character:** a heavy, geometric grotesk that hits hard and sits tight,
against a neutral workhorse that stays out of the way. Figtree matches the
headline face of Jon's capability statement (its embedded Type3 fonts can't
be named, so Figtree is the chosen stand-in) and is already used by the
SuperBase Remotion build.

### Hierarchy
- **Display** (Figtree 800, `clamp(2.75rem, 6vw, 4.5rem)`, 1.05, −0.02em): cover and hero headlines, usually two-tone.
- **Headline** (Figtree 800, `clamp(2rem, 4vw, 3rem)`, 1.05): section headlines.
- **Title** (Figtree 700, 1.375rem, −0.01em): sub-section heads. h2 sits between Headline and Title at 700, `clamp(1.5rem, 3vw, 2rem)`.
- **Subtitle** (Figtree 700, 1.125rem, 1.2, −0.01em): group labels, card, panel and finding titles.
- **Figure** (Figtree 800, `clamp(3.5rem, 9vw, 6rem)`, 0.95, tabular): the big number in a figure panel. The 01–05 method numerals use the same face at h2 size.
- **Body** (Inter 400, 1rem, 1.6): reading text at 65–75ch. Body-lg 1.125rem for leads; small 0.875rem for notes.
- **Label** (Inter 600, 0.6875rem, 0.24em, uppercase, after a 28px rule): captions, lower-thirds, table heads and step labels.

### Named Rules
**The Two-Tone Rule.** A display headline may set up in grey and pay off in white (or slate and charcoal on light): "Stop patching the yard. **Bind it.**" One payoff per headline, and the payoff is always the shorter half.

**The Label Is Not an Eyebrow Rule.** The tracked-caps label captions things: photos, footage, table columns, steps. It never sits stacked above a headline; the headline carries its own weight.

## Layout

A single editorial column on a 1140px container with 24px gutters (16px under
560px). Sections breathe at 96px vertical padding (64px on phones), and the
page alternates between charcoal and paper grounds, in the way Jon's
document moves from a charcoal cover to paper pages and back to a charcoal
call-out. Within a section, groups are separated by 64px and tightened
internally to 16–24px.

Spacing is a 4px scale: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128. Grids
use `auto-fill` tracks (swatches from 172px, galleries and tiles from 240px)
and collapse to one column under 760px. The breakpoints are 560px (phone
gutter), 640px (compact: stacked spec rows, tighter section padding), 760px
(single-column grids) and 860px (hero stacks, nav scrolls). Wide tables scroll
inside their own keyboard-reachable frame; the page never scrolls sideways.

### Named Rules
**The Margin Is the Material Rule.** Generous margins and hairlines do the structural work that boxes and fills would do elsewhere. When in doubt, add space, not a container.

## Elevation & Depth

Flat by default. Depth is tonal: charcoal → panel for a raised surface,
charcoal → deep for a recessed one, paper → white for a card on a light page,
each edged with a hairline. Shadows exist only for layers that float above
content.

### Shadow Vocabulary
- **Float** (`box-shadow: 0 12px 32px rgba(19,20,22,.28)`): menus, dialogs and toasts on charcoal.
- **Float on light** (`box-shadow: 0 8px 24px rgba(38,40,43,.14)`): the same layers on paper.

### Named Rules
**The Flat Pad Rule.** Surfaces at rest carry no shadow. A card is a white plane with a hairline edge, not a lifted tile.

## Shapes

Sharp. Panels, cards, images, tables, tiles and the page itself use square
corners (`--radius-sharp: 0`). Buttons, inputs and chips may take 2px
(`--radius-sm`), which echoes the machined corners of the chevron mark.
Nothing is rounder than that; there are no pills. Edges are drawn with 1px
hairlines. The recurring silhouettes are the mark's rising parallelograms and
the lane-line dash: 24px of paint, 16px of gap.

### Named Rules
**The Two Pixel Ceiling Rule.** No radius above 2px anywhere, on anything.

## Components

Built straight from the semantic tokens: tactile, plain and decisive.

### Buttons
- **Shape:** sharp, with a 2px corner (`--radius-sm`); Inter 600 at 1rem, padding 0.85em × 1.2em.
- **Primary on charcoal:** white with charcoal ink (`--color-primary` / `--color-primary-ink`); hover greys to grey-light #C4CAD0 (charcoal on it is 8.9:1). One per surface.
- **Primary on light:** charcoal with white ink (`--color-primary-on-light` / `-ink`); hover lifts to panel #2F3233.
- **Quiet (on charcoal):** panel fill, white text, 24% white hairline; hover edges in mid grey.
- **Ghost:** transparent with a mid-grey edge on charcoal (5.6:1, so the control boundary clears 3:1), or a charcoal edge on light, which fills charcoal on hover.
- **Focus:** a 2px outline, offset 3px, white on dark and charcoal on light. **Disabled:** 50% opacity, no hover change.
- A trailing arrow icon nudges 3px right on hover; nothing else moves.

### Chips
- **Severity chips:** the `--sev-*` bg/fg pair, 2px corner, icon plus label, 0.875rem Inter 600.
- **Metadata chips (on charcoal):** transparent with a 24% white hairline and muted white text.

### Cards / Containers
- **Corner Style:** square (0).
- **Background:** white on paper; panel #2F3233 on charcoal.
- **Shadow Strategy:** none (see Elevation & Depth).
- **Border:** 1px hairline (`--color-line-light` on light, `--color-line` on dark).
- **Internal Padding:** 24px; figure and call-out panels 48px × 32px.
- **Condition finding card:** severity chip and location icon, Figtree 700 title, slate body, and a tracked-caps reference label ("Condition finding 03 · Gate approach").

### Inputs / Fields
- **Style:** white fill, 1px slate border (5.9:1), 2px corner, charcoal text, slate placeholder.
- **Focus:** 2px charcoal outline, offset 1px; the border darkens to charcoal on hover.
- **Error:** the border and hint turn `--sev-critical-fg`; the hint names the problem and the fix ("Enter the area in square metres, for example 2400.").
- **Label:** Inter 600 0.875rem above; hint Inter 0.75rem slate below.

### Navigation
- A sticky, solid charcoal bar, 64px tall, with the white wordmark at 28px and Inter 500 0.875rem links in 72% white. On hover a link turns white and gains a 2px underline. On narrow screens the links scroll sideways under a fade mask; the page itself never does.

### Method Table (signature)
Jon's numbered method as a table: charcoal head row in tracked-caps labels,
white body with row-tint alternation, the step number in Figtree 800 at
h2 size, the step name in Figtree 700, the description in slate. The
numerals carry the sequence; no icons.

### Figure Panel (signature)
A charcoal panel with one huge Figtree 800 figure, a white tracked-caps label,
and the qualifier in 55% white beneath. The qualifier is part of the
component, not optional copy.

### Two-Tone Call-out (signature)
A panel-coloured block holding one two-tone statement at h2 size: "The choice
is usually 'keep making it good' or 'pour a slab'. **There is a third
option.**"

### Lower-Third (signature)
A 92% charcoal bar across the foot of an image or footage: a 3px lane line,
then the label ("02 — Binder and water through the full depth"). The same
device works as a photo caption and as a video super.

## Do's and Don'ts

### Do:
- **Do** build against the semantic roles (`--color-primary`, `--color-text`, `--color-setup`…), never raw hex; raw `--mp-*` values only define new roles.
- **Do** invert, never recolour: white on charcoal (14.8:1), charcoal on paper (13.4:1) and white (14.8:1).
- **Do** keep one primary action per surface.
- **Do** set the two-tone setup in mid grey #99A1A7 on dark and in slate #5C6670 on light.
- **Do** attach the qualifier to every figure: "Indicative. Varies with base material, climate and duty. Confirmed by site trial."
- **Do** keep corners square, with 2px only on buttons, inputs and chips.
- **Do** contrast-check any new colour pair with `python design-system/contrast.py` and record it in `tokens.json` and here.

### Don't:
- **Don't** introduce an accent colour, amber, hi-vis orange or otherwise, as a UI colour. Colour belongs to the photography.
- **Don't** place the charcoal logo or charcoal shapes on a dark ground (1.1:1).
- **Don't** use mid grey #99A1A7 as text on paper or white (2.4–2.6:1).
- **Don't** use a radius above 2px, pill shapes, or drop shadows on resting cards.
- **Don't** use gradient fills or gradient text in UI. Gradients live only inside the imagery.
- **Don't** stack a tracked-caps label above a headline as an eyebrow.
- **Don't** set PAVEMENTS, or any part of the lockup, in a typeface.

## Logo & Brand Assets

**Construction.** The Maintain family mark (three rising chevron terraces),
the word Maintain in the family letterforms, and **PAVEMENTS** letter-spaced
across the wordmark's full width, from the left edge of the M to the right edge
of the final n: an engineering nameplate, not a subtitle. PAVEMENTS is
drawn geometry in the exact grammar of the family's sub-words: 19.69-unit
cap height, 3.37-unit monoline stroke, straight strokes as filled polygons,
round strokes (the P bowl and the S) as butt-capped arcs, and nine letters at
equal 17.19-unit gaps. The M and N are the family's own glyphs. The lettering
survives any environment because it isn't text.

**Files** (in [`design-system/assets/logo/`](design-system/assets/logo)):

| File | Use |
|---|---|
| `wordmark-on-dark.svg` | Full lockup, all white: charcoal grounds and imagery |
| `wordmark-on-light.svg` | Full lockup, all charcoal #26282B: paper and white |
| `mark.svg` | The chevron mark alone, charcoal: watermarks and light surfaces |
| `mark-on-dark.svg` | The chevron mark alone, white: charcoal grounds and imagery |
| `app-icon.svg` | White mark on a square charcoal tile: favicon, avatar, app icon |

The wordmark is also a `<symbol id="wordmark">` in `assets/sprite.svg`
(`currentColor`, so it inverts with its context).

**Rules.**
- Clear space on every side is at least the cap height of "Maintain"; the minimum lockup width is 120px.
- On photography, sit the white lockup over a charcoal scrim of at least 50%.
- Never stretch, outline, shadow, gradient-fill or recolour the lockup, and never set PAVEMENTS in a font.
- The descriptor HARDSTAND & INDUSTRIAL SURFACES, when used, is set separately in tracked caps (Inter 600, 0.24em) in mid grey on charcoal or slate on paper. It is not part of the drawn lockup.

**Iconography.** Fourteen line icons at 24×24, `stroke: currentColor`, width
2, round caps and joins: check, clipboard, search, shield, chart, network,
speed, star, cpu, mail, phone, pin, arrow-right, menu. The individual files in
`design-system/assets/icons/` ship with charcoal ink; the same set is bundled in
`assets/sprite.svg`. Tint them grey-light #C4CAD0 on charcoal and charcoal on
paper. New icons are drawn in the same grammar; the method uses numerals,
not icons.

## Imagery

- **Photography first.** Real, unstaged site photography (plant working,
  low-angle drum shots, wide finished-yard shots under hard Australian light)
  carries the brand's colour. Keep it natural; cool the grade slightly toward
  the brand greys rather than pushing saturation.
- **Brand art.** Surveyed-terrain wireframes, washes and glows in
  `design-system/graphics/`, gradient-mapped onto the charcoal ramp by
  `graphics/tone.py` (darks on charcoal, lights on paper). Web copies live in
  `graphics/web/`. Filenames keep legacy colour words on purpose.
- **Textures.** The setting-out grid (`.mp-grid-bg`: 1px lines at 5% white,
  40px pitch, charcoal only) and the lane line (`.mp-laneline`: 24px paint /
  16px gap in `currentColor`, 3–6px tall; a keyline, never a fill behind
  text).
- **Motion.** 120/200/320ms on `cubic-bezier(0.22,1,0.36,1)`. The one
  signature moment is the **lane crawl**: the hero lane line slides along its
  own axis, one dash period per 2.4s, twice as the page loads (4.8s), then
  rests. Staying under 5s means no pause control is needed (WCAG 2.2.2). One
  per page, and `prefers-reduced-motion` skips it (the tokens ship the guard).

## Voice

Measured, not asserted. Lead with the point, then the method, then the test
that proves it. Say nothing stronger than Jon's capability statement says:
the Claims Register (`MaintainPavements/01 Jon's Plan/Claims Register.md`)
holds the approved wording and the must-not-say list. Controls name their
action in the brand's own words ("Nominate a trial area", "Book a yard walk").
Errors name the problem and the recovery. Australian spelling.

## Open Questions

- Legal entity and ABN for Maintain Pavements footers (the style guide's footer
  carries a TODO; it currently reads "part of the Maintain group").
- The original headline and body typefaces of Jon's PDF. Its Type3 fonts can't
  be named, so Figtree + Inter are confirmed stand-ins; swap them if Jon
  supplies the originals.
- Whether a stacked lockup (mark above "Maintain" / PAVEMENTS, as on the PDF
  cover) and a lockup carrying the descriptor are needed as drawn files.
- Owned, cleared site photography. The current footage carries third-party
  marks (CAT, Hastings Deering, fleet and tank numbers) that need a decision
  before brand use.
