"""Estimate time offset between two audio tracks (e.g. Seedance clip audio vs TTS master) via envelope cross-correlation.
Usage: python av_offset.py reference.(wav|mp3) clip.mp4  -> prints offset seconds (positive = clip audio later) and correlation.
"""
import subprocess, sys
import numpy as np

def env(path, sr=16000, hop=80):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, dtype=np.float32)
    n = len(x) // hop
    e = np.sqrt(np.mean(x[: n * hop].reshape(n, hop) ** 2, axis=1))
    e = np.log(e + 1e-4)
    return (e - e.mean()) / (e.std() + 1e-9), sr / hop

a, rate = env(sys.argv[1])
b, _ = env(sys.argv[2])
n = min(len(a), len(b))
max_lag = int(rate * 1.0)
best = max(range(-max_lag, max_lag + 1), key=lambda k: np.dot(a[max(0, -k): n - max(0, k)], b[max(0, k): n - max(0, -k)]) / (n - abs(k)))
k = best
corr = np.corrcoef(a[max(0, -k): n - max(0, k)], b[max(0, k): n - max(0, -k)])[0, 1]
print(f"offset_s={k / rate:+.3f} corr={corr:.3f} ref_len={len(a)/rate:.2f}s clip_len={len(b)/rate:.2f}s")
