"""Build Seedance audio references from the chosen TTS takes.

For each segment: add a short lead-in silence, compress internal pauses longer than MAX_GAP, and pad
the tail with silence to a whole-second clip length. Writes out/hf-reel/seedance-ref/<key>.wav and
out/hf-reel/seedance-ref/plan.json (clip seconds per segment).
"""
import json, subprocess, wave
from pathlib import Path
import numpy as np

SR, LEAD, TAIL, MAX_GAP, KEEP_GAP = 44100, 0.25, 0.4, 0.6, 0.55
root = Path(__file__).resolve().parents[2]
asr = [json.loads(l) for l in (root / "out/hf-reel/asr/tts-final.jsonl").read_text().splitlines() if l.strip()]
out = root / "out/hf-reel/seedance-ref"; out.mkdir(parents=True, exist_ok=True)
plan = []
for r in asr:
    key = Path(r["file"]).stem
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(root / "public/audio/hf-reel/voice/final" / r["file"]), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, dtype=np.float32)
    words = r["words"]
    end = min(len(x), int((words[-1]["e"] + 0.12) * SR))
    pieces, cursor, removed = [], 0, 0.0
    for a, b in zip(words, words[1:]):
        gap = b["s"] - a["e"]
        if gap > MAX_GAP:
            cut_from = int((a["e"] + KEEP_GAP / 2) * SR)
            cut_to = int((b["s"] - KEEP_GAP / 2) * SR)
            pieces.append(x[cursor:cut_from]); cursor = cut_to; removed += (cut_to - cut_from) / SR
    pieces.append(x[cursor:end])
    speech = np.concatenate(pieces)
    fade = int(0.03 * SR); speech[-fade:] *= np.linspace(1, 0, fade)
    clip = max(4, int(np.ceil(LEAD + len(speech) / SR + TAIL)))
    y = np.zeros(clip * SR, dtype=np.float32)
    y[int(LEAD * SR): int(LEAD * SR) + len(speech)] = speech
    pcm = (np.clip(y, -1, 1) * 32767).astype("<i2")
    with wave.open(str(out / f"{key}.wav"), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    plan.append(dict(key=key, clipSeconds=clip, speechSeconds=round(len(speech) / SR, 3), pauseRemovedSeconds=round(removed, 3), lead=LEAD))
    print(f"{key:12s} speech {len(speech)/SR:5.2f}s  removed {removed:4.2f}s  clip {clip}s")
(out / "plan.json").write_text(json.dumps(plan, indent=2))
print("total", sum(p["clipSeconds"] for p in plan), "s")
