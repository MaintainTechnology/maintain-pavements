"""Estimate F1/F2 of the vowel inside a given word occurrence (LPC), to tell /eI/ ("base") from /ae/ ("bass").
Usage: python vowel_f1.py file.wav start end  [file start end ...]
"""
import subprocess, sys
import numpy as np

def lpc(x, order):
    r = np.correlate(x, x, "full")[len(x) - 1: len(x) + order]
    a = np.zeros(order + 1); a[0] = 1.0; e = r[0]
    for i in range(1, order + 1):
        k = -(r[i] + np.dot(a[1:i], r[i - 1:0:-1])) / e
        a[1:i + 1] = a[1:i + 1] + k * np.r_[a[i - 1:0:-1], 1.0]
        e *= 1 - k * k
    return a

def formants(x, sr):
    x = np.append(x[0], x[1:] - 0.63 * x[:-1]) * np.hamming(len(x))
    roots = [z for z in np.roots(lpc(x, 12)) if np.imag(z) >= 0.01]
    f = sorted(np.angle(roots) * sr / (2 * np.pi))
    bw = []
    return [v for v in f if v > 250][:3]

args = sys.argv[1:]
for i in range(0, len(args), 3):
    f, s, e = args[i], float(args[i + 1]), float(args[i + 2])
    sr = 11025
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", f, "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, dtype=np.float32)[int(s * sr): int(e * sr)]
    # vowel nucleus: middle 40% of the word, frames of 25 ms
    n = len(x); seg = x[int(n * 0.25): int(n * 0.65)]
    hop, win = int(0.01 * sr), int(0.025 * sr)
    F = [formants(seg[j:j + win], sr) for j in range(0, len(seg) - win, hop)]
    F = [v for v in F if len(v) >= 2]
    f1 = np.median([v[0] for v in F]); f2s = [v[1] for v in F]
    print(f"{f.split('/')[-1]:28s} {s:5.2f}-{e:5.2f}  F1~{f1:4.0f} Hz  F2 start->end {np.median(f2s[:max(1,len(f2s)//3)]):4.0f}->{np.median(f2s[-max(1,len(f2s)//3):]):4.0f} Hz")
