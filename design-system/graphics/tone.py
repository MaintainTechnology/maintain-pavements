"""Tone the neutral-grey brand art onto the Maintain Pavements neutral ramp.

The inherited art is desaturated grey (R = G = B). This gradient-maps each
grey level through the brand's own neutrals, so the darks land on charcoal
#26282B (cool), the mids on slate and mid grey, and the lights on paper
#F5F4F1 (warm). Anchors sit at each colour's own grey level, so lightness,
wireframe density and glow falloff are preserved; only the cast moves.
Alpha is untouched.

It only runs on grey input: already-toned files are skipped, so a second run
is a no-op. Originals of the grey art live in
../../../maintain-mining/design-system/graphics/.

Usage: python tone.py      (needs pillow)   then: python web_optimize.py
"""
import os, glob
from PIL import Image
Image.MAX_IMAGE_PIXELS = None

HERE = os.path.dirname(os.path.abspath(__file__))
RAMP = ["#000000", "#131416", "#26282B", "#5C6670", "#99A1A7", "#F5F4F1", "#FFFFFF"]
# web/mountain-line.jpg has no full-res raster source (it is a render of mountain.svg)
TARGETS = sorted(glob.glob(os.path.join(HERE, "*.jpg")) + glob.glob(os.path.join(HERE, "*.png"))
                 + [os.path.join(HERE, "web", "mountain-line.jpg")])


def rgb(h):
    return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))


def luts():
    anchors = sorted((sum(rgb(h)) / 3, rgb(h)) for h in RAMP)
    out = ([], [], [])
    for v in range(256):
        for (x0, c0), (x1, c1) in zip(anchors, anchors[1:]):
            if x0 <= v <= x1:
                t = (v - x0) / (x1 - x0)
                for ch in range(3):
                    out[ch].append(max(0, min(255, round(c0[ch] + t * (c1[ch] - c0[ch])))))
                break
    return out


def is_grey(im):
    px = im.convert("RGB").resize((256, 256)).tobytes()
    return px[0::3] == px[1::3] == px[2::3]


def tone(path, lr, lg, lb):
    im = Image.open(path)
    if not is_grey(im):
        return "skip (already toned)"
    alpha = im.getchannel("A") if im.mode in ("RGBA", "LA") else None
    v = im.convert("L")
    out = Image.merge("RGB", (v.point(lr), v.point(lg), v.point(lb)))
    if alpha is not None:
        out.putalpha(alpha)
    if path.lower().endswith(".jpg"):
        out.save(path, quality=92, progressive=True)
    else:
        out.save(path)
    return "toned"


if __name__ == "__main__":
    lr, lg, lb = luts()
    assert (lr[40], lg[40], lb[40]) == rgb("#26282B"), "grey 40 must land on charcoal"
    assert (lr[0], lr[255], lb[255]) == (0, 255, 255), "black and white stay put"
    for p in TARGETS:
        print(f"{os.path.relpath(p, HERE):28} {tone(p, lr, lg, lb)}")
