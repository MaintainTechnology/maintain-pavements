"""Objective metrics for TTS voice candidates: WER vs expected text, pace, median F0, pauses.

Usage: python voice_metrics.py "<expected text>" file1.mp3 [file2 ...]
Uses cached faster-whisper large-v3 weights (no downloads).
"""
import json, re, subprocess, sys
from pathlib import Path
import numpy as np
from faster_whisper import WhisperModel

def cached(name):
    repo = Path.home() / ".cache/huggingface/hub" / f"models--Systran--faster-whisper-{name}"
    ref = (repo / "refs/main").read_text().strip()
    return str(repo / "snapshots" / ref)

def pcm(path, sr=16000):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32), sr

def f0_median(x, sr):
    frame, hop = 1024, 256
    f0s = []
    for i in range(0, len(x) - frame, hop):
        w = x[i:i + frame] * np.hanning(frame)
        if np.sqrt(np.mean(w ** 2)) < 0.02:
            continue
        ac = np.correlate(w, w, "full")[frame - 1:]
        lo, hi = int(sr / 300), int(sr / 70)
        lag = lo + int(np.argmax(ac[lo:hi]))
        if ac[lag] / (ac[0] + 1e-9) > 0.45:
            f0s.append(sr / lag)
    return float(np.median(f0s)) if f0s else None

def norm(t):
    return re.sub(r"[^a-z0-9 ]", " ", t.lower().replace("-", " ")).split()

def wer(ref, hyp):
    r, h = norm(ref), norm(hyp)
    d = np.zeros((len(r) + 1, len(h) + 1), dtype=int)
    d[:, 0] = range(len(r) + 1); d[0, :] = range(len(h) + 1)
    for i in range(1, len(r) + 1):
        for j in range(1, len(h) + 1):
            d[i, j] = min(d[i - 1, j] + 1, d[i, j - 1] + 1, d[i - 1, j - 1] + (r[i - 1] != h[j - 1]))
    return d[len(r), len(h)] / max(1, len(r))

expected = sys.argv[1]
model = WhisperModel(cached("large-v3"), device="cpu", compute_type="int8")
out = []
for f in sys.argv[2:]:
    x, sr = pcm(f)
    segs, info = model.transcribe(f, language="en", word_timestamps=True, vad_filter=False)
    words = [w for s in segs for w in s.words]
    text = " ".join(w.word.strip() for w in words)
    speech = (words[-1].end - words[0].start) if words else 0
    gaps = [round(b.start - a.end, 2) for a, b in zip(words, words[1:]) if b.start - a.end > 0.25]
    out.append(dict(file=Path(f).stem, dur=round(len(x) / sr, 2), speech=round(speech, 2),
                    wps=round(len(norm(expected)) / speech, 2) if speech else None,
                    f0=round(f0_median(x, sr) or 0, 1), wer=round(wer(expected, text), 3),
                    lead=round(words[0].start, 2) if words else None,
                    tail=round(len(x) / sr - words[-1].end, 2) if words else None,
                    pauses=gaps, heard=text))
for o in out:
    print(json.dumps(o))
