# Brand graphics (charcoal)

Backgrounds, washes, glows and wireframe-terrain graphics for **Maintain
Pavements**, toned onto the brand's own neutral ramp: darks land on charcoal
`#26282B`, mids on slate `#5C6670` and mid grey `#99A1A7`, lights on paper
`#F5F4F1`. Beside a charcoal UI ground the art reads as the same material,
not as a neutral grey stuck on top. The terrain reads as surveyed ground:
the pad before it is built.

## History (why the filenames have colour words)

The art started life as Maintain Audits work (green highlights on deep teal),
was hue-shifted onto the Maintain family ramp, then desaturated to neutral grey
for Maintain Mining. For Pavements it was **gradient-mapped onto the charcoal
ramp** by `tone.py`. Structure, wireframe density and glow falloff are
untouched throughout; only colour ever moved. The neutral-grey originals are
kept in `../../../maintain-mining/design-system/graphics/`.

> **Filenames keep their legacy colour words** (`green-gradient.png`,
> `blue-gradient.png`, `blu-gradient.svg`). Renaming them would break any deck or
> doc that already links them; the contents are charcoal.

Don't re-tint the rasters by hand. `tone.py` only acts on neutral-grey input,
so re-running it is a no-op; to re-tone from scratch, copy the grey originals
back in first.

## Files

| File | What it is |
|---|---|
| `cover.jpg` | Wireframe terrain: the hero and cover background |
| `cover 2.jpg` | Diagonal charcoal wash |
| `mountain forms 1.png` / `mountain forms 2.png` | Wireframe terrain, light lines on charcoal (alpha PNG) |
| `section.jpg` | Dark section background with a soft floor light |
| `green-gradient.png` | Radial glow blob (alpha PNG) |
| `blue-gradient.png` | Softer glow blob (alpha PNG) |
| `Gradient-pantone-1.png` | Tall glow for rails and sidebars (alpha PNG) |
| `gradient.jpg` / `gradient.png` | Perspective wash (landscape / portrait) |
| `gradient-white.jpg` | Soft white-to-grey wash (light background) |
| `white bg.jpg` | Light base with a corner glow |
| `white-gradient.png` / `white-lineargradient.png` | Light fades (alpha PNGs) |
| `blu-gradient.svg` | Vector glow blob, slate `#5C6670` |
| `mountain.svg` | Line-art terrain for light surfaces; gradient stops `#131416 → #26282B` |

## Scripts

- `tone.py` maps neutral-grey art onto the charcoal ramp (anchors
  `#000000 · #131416 · #26282B · #5C6670 · #99A1A7 · #F5F4F1 · #FFFFFF`,
  each at its own grey level, so lightness is preserved). Alpha is untouched.
- `web_optimize.py` rebuilds the `web/` derivatives (flattened onto the
  charcoal ground or white, resized, JPEG) that the style guide paints: about
  1.6 MB instead of the full-resolution set.

Both resolve their paths from the script location. Pillow is the only
dependency.

## `web/`

Optimised copies for `../index.html`. The full-resolution and transparent-PNG
originals in this folder are the real assets to hand to designers.
`web/mountain-line.jpg` is a render of `mountain.svg` with no raster source,
so `tone.py` tones it in place.
