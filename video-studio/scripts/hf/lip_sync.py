"""Measure lip-sync: cross-correlate mouth-region activity in a video with an audio track's speech envelope.

Usage: python lip_sync.py clip.mp4 audio_file [audio_file ...] [--roi x0,y0,x1,y1 as fractions]
Prints best lag (seconds, positive = audio events happen later than the lips) and peak correlation per audio file.
"""
import subprocess, sys
import numpy as np

args = [a for a in sys.argv[1:] if not a.startswith("--roi")]
roi_arg = next((a.split("=", 1)[1] for a in sys.argv[1:] if a.startswith("--roi=")), "0.43,0.435,0.59,0.49")
x0f, y0f, x1f, y1f = map(float, roi_arg.split(","))
clip, audios = args[0], args[1:]

probe = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height,r_frame_rate", "-of", "csv=p=0", clip], capture_output=True, text=True, check=True).stdout.strip().split(",")
w, h = int(probe[0]), int(probe[1]); num, den = map(int, probe[2].split("/")); fps = num / den
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", clip, "-f", "rawvideo", "-pix_fmt", "gray", "-"], capture_output=True, check=True).stdout
frames = np.frombuffer(raw, dtype=np.uint8).reshape(-1, h, w).astype(np.float32)
x0, x1, y0, y1 = int(x0f * w), int(x1f * w), int(y0f * h), int(y1f * h)
roi = frames[:, y0:y1, x0:x1]
dark = (roi < np.percentile(roi, 20)).mean(axis=(1, 2))            # open mouth -> more dark pixels
motion = np.r_[0, np.abs(np.diff(roi, axis=0)).mean(axis=(1, 2))]   # articulation energy
def z(v): return (v - v.mean()) / (v.std() + 1e-9)

def audio_env(path):
    sr = 16000
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, dtype=np.float32)
    hop = sr / fps
    n = int(len(x) / hop)
    e = np.array([np.sqrt(np.mean(x[int(i * hop): int((i + 1) * hop)] ** 2)) for i in range(n)])
    return np.log(e + 1e-4)

for a in audios:
    env = audio_env(a)
    for name, sig in (("dark", dark), ("motion", motion)):
        n = min(len(env), len(sig))
        s, e = z(sig[:n]), z(env[:n])
        lags = range(-int(fps * 0.6), int(fps * 0.6) + 1)
        def c(k):
            if k >= 0: return np.corrcoef(s[: n - k], e[k:n])[0, 1]
            return np.corrcoef(s[-k:n], e[: n + k])[0, 1]
        vals = [(k, c(k)) for k in lags]
        k, best = max(vals, key=lambda t: t[1])
        zero = dict(vals)[0]
        print(f"{a.split('/')[-1]:38s} {name:6s} best_lag={k / fps:+.3f}s corr={best:.3f} corr@0={zero:.3f}")
