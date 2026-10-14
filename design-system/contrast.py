"""Recompute every WCAG 2.2 ratio recorded in tokens.json and fail on drift.

    python contrast.py        (stdlib only)

Keys read "<fg> on <bg>", optionally followed by " (note)". Names resolve
against `brand`, then `semantic`, and `sev-<level>-<fg|bg>` against
`severity` (rgba values are composited over the ground).
"""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
T = json.load(open(os.path.join(HERE, "tokens.json"), encoding="utf8"))


def rgba(name):
    sev = re.fullmatch(r"sev-(\w+)-(fg|bg)", name)
    v = T["severity"][sev[1]][sev[2]] if sev else T["brand"].get(name) or T["semantic"][name]
    v = T["brand"].get(v, v)                      # semantic may alias a brand key
    if v.startswith("#"):
        return tuple(int(v[i:i + 2], 16) for i in (1, 3, 5)) + (1.0,)
    r, g, b, a = (float(x) for x in re.findall(r"[\d.]+", v))
    return (r, g, b, a)


def lum(rgb):
    def ch(c):
        c /= 255
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = rgb
    return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b)


def ratio(fg, bg):
    *b, _ = rgba(bg)
    *f, a = rgba(fg)
    f = [round(a * x + (1 - a) * y) for x, y in zip(f, b)]
    hi, lo = sorted((lum(f), lum(b)), reverse=True)
    return round((hi + 0.05) / (lo + 0.05), 2)


bad = 0
for key, want in T["contrast"].items():
    if key.startswith("$"):
        continue
    fg, bg = re.match(r"(\S+) on (\S+)", key).groups()
    got = ratio(fg, bg)
    ok = abs(got - want) <= 0.01
    bad += not ok
    print(f"{'ok ' if ok else 'BAD'} {key:62} recorded {want:>5}  computed {got:>5}")
sys.exit(1 if bad else 0)
