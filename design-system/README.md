# Maintain Pavements — Design System

The canonical reference for every Maintain Pavements visual: capability
statements, decks, video supers, social graphics, reports, letterhead, web and
product UI. **Build against this, not ad-hoc values.**

## Files

| File | What it is |
|---|---|
| [`../DESIGN.md`](../DESIGN.md) | **The spec.** Colour, type, layout, shapes, components, logo, imagery, voice, usage rules and open questions. Start here. |
| [`tokens.css`](tokens.css) | CSS custom properties + signature utilities. Link this in any web build. |
| [`tokens.json`](tokens.json) | The same tokens, machine-readable (scripts, Figma sync, Remotion, other tooling), with the measured contrast table. |
| [`contrast.py`](contrast.py) | Recomputes every ratio in `tokens.json` and fails on drift. Run it after touching a colour. |
| [`index.html`](index.html) | **Living style guide**: renders the whole system. Open it to see everything at once. |
| [`assets/logo/`](assets/logo) | `wordmark-on-dark.svg`, `wordmark-on-light.svg`, `mark.svg`, `mark-on-dark.svg`, `app-icon.svg` |
| [`assets/icons/`](assets/icons) | 14 line icons (`i-*.svg`) |
| [`assets/sprite.svg`](assets/sprite.svg) | Icons + wordmark bundled for `<use>` |
| [`graphics/`](graphics) | Full-resolution terrain, wash and glow art, toned onto the brand ramp |

## The palette

One brand colour, taken from the ground of the mark: **charcoal `#26282B`**.
The system is monochrome by rule. There is no accent; signal comes from the
inversion itself.

| | Hex | Role |
|---|---|---|
| **Charcoal** | **`#26282B`** | The brand. Logo on light, the dark ground, ink on paper. |
| Panel / Deep / Black | `#2F3233` / `#1C1E20` / `#131416` | Raised panel / recessed well / deepest base |
| Mid grey | `#99A1A7` | Two-tone setup line **on dark only** (2.6:1 on white) |
| Grey-light | `#C4CAD0` | Icons and detail on dark |
| Slate | `#5C6670` | Muted text and two-tone setup on light |
| Paper / Row / Tint / White | `#F5F4F1` / `#F1F1F2` / `#E4E6E8` / `#FFFFFF` | Light grounds |

White on charcoal is 14.8:1; charcoal on paper is 13.4:1. Every pair shipped
here is measured (`python contrast.py`).

## Use it

**Web / HTML**
```html
<link rel="stylesheet" href="design-system/tokens.css">
<!-- the one primary action on a charcoal ground -->
<button style="background:var(--color-primary); color:var(--color-primary-ink)">Nominate a trial area</button>
<!-- and on a light ground -->
<button style="background:var(--color-primary-on-light); color:var(--color-primary-on-light-ink)">Nominate a trial area</button>
<!-- two-tone headline: grey setup, white payoff (add .on-light on paper) -->
<h1 class="mp-two-tone">Stop patching the yard. <strong>Bind it.</strong></h1>
<!-- tracked-caps label for captions, lower-thirds, step labels -->
<p class="mp-label">02 — Binder and water through the full depth</p>
<!-- lane-line keyline: paints in currentColor, white on charcoal, charcoal on paper -->
<div class="mp-laneline"></div>
<!-- icon from the sprite -->
<svg class="icon" width="24" height="24" style="color:var(--mp-grey-light)"><use href="design-system/assets/sprite.svg#i-shield"/></svg>
```
Icon base style: `.icon{fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}`.

**Documents, decks, video (non-web)**
Use the hex values in [`tokens.json`](tokens.json) and the fonts **Figtree**
(display, 600–800) + **Inter** (body, 400–600), both free on Google Fonts. The
logo and icon SVGs in `assets/` import directly into Canva, Figma,
Illustrator, Word and Remotion.

**View the style guide**
Open [`index.html`](index.html) directly, or serve the repo root and visit
`/design-system/index.html` (`python -m http.server 8123`; a launch config
named `design-system` exists in `../.claude/launch.json`).

## Rules that keep it coherent

- **One colour, two states.** Charcoal on paper and white; white on charcoal.
  Charcoal on the dark grounds is 1.1:1, so the logo and any charcoal shape
  invert to white there.
- **No accent colour.** One primary action per surface, made by inversion:
  white on charcoal, charcoal on light. Photography supplies the colour.
- **Mid grey is dark-only.** On light, the two-tone setup line is slate.
- **Sharp corners.** 0 on panels, cards, images and tables; 2px is the ceiling
  on buttons, inputs and chips. Hairlines instead of boxes.
- **Status severity** (`--sev-*`) is functional, not brand: traffic-light
  condition ratings, always paired with a label.
- Brand art in `graphics/` is toned onto the charcoal ramp by `graphics/tone.py`.
  Filenames keep legacy colour words on purpose (see `graphics/README.md`).
