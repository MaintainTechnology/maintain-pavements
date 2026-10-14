"""Check every edit join in the rendered Reel for clicks and report the speech gap around it.

Usage: python check_joins.py out/hf-reel/maintain-pavements-hf-reel.mp4 src/hf-reel/timeline.json
A join is flagged when the first-difference (click-emphasised) energy in the 10 ms windows at the join
exceeds 6x the median of the surrounding +/-300 ms (a tick). The quiet-gap column is informational only.
"""
import json, subprocess, sys
import numpy as np

video, timeline_path = sys.argv[1], sys.argv[2]
t = json.load(open(timeline_path, encoding="utf8"))
SR, FPS = 48000, 30
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", video, "-vn", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
x = np.frombuffer(raw, dtype=np.float32)
# crude high-pass: first difference emphasises clicks
hp = np.abs(np.diff(x, prepend=x[0]))
win = int(0.01 * SR)
energy = np.array([hp[i:i + win].mean() for i in range(0, len(hp) - win, win)])
rms = np.array([np.sqrt(np.mean(x[i:i + win] ** 2)) for i in range(0, len(x) - win, win)])
db = 20 * np.log10(rms + 1e-9)

joins = []
for s in t["segments"]:
    start = (t["titleFrames"] + s["from"]) / FPS
    joins.append((f"{s['id']} start", start, True))
    for p in s["pieces"][1:]:
        joins.append((f"{s['id']} pause cut", (t["titleFrames"] + s["from"] + p["from"]) / FPS, False))

problems = 0
for name, sec, section in joins:
    k = int(sec / 0.01)
    local = energy[max(0, k - 30): k + 30]
    peak = energy[max(0, k - 1): k + 2].max()
    ratio = peak / (np.median(local) + 1e-9)
    # audible gap: longest run below -45 dBFS within +/-0.6 s of the join
    seg = db[max(0, k - 60): k + 60] < -45
    best = run = 0
    for v in seg:
        run = run + 1 if v else 0
        best = max(best, run)
    gap = best * 0.01
    # The music bed never falls below -45 dBFS, so quiet-gap is informational on the final mix; flag clicks only.
    flag = ratio > 6
    problems += flag
    print(f"{'FLAG' if flag else 'ok  '} {name:22s} {sec:7.3f} s  click-ratio {ratio:4.1f}  quiet-gap {gap:.2f} s")
print("problems:", problems)
