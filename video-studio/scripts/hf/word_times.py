"""Print Whisper word timestamps for one or more audio/video files (cached large-v3, no downloads)."""
import json, sys
from pathlib import Path
from faster_whisper import WhisperModel

def cached(name):
    repo = Path.home() / ".cache/huggingface/hub" / f"models--Systran--faster-whisper-{name}"
    return str(repo / "snapshots" / (repo / "refs/main").read_text().strip())

model = WhisperModel(cached(sys.argv[1] if sys.argv[1] in ("base.en", "large-v3") else "large-v3"), device="cpu", compute_type="int8")
files = sys.argv[2:] if sys.argv[1] in ("base.en", "large-v3") else sys.argv[1:]
for f in files:
    segs, _ = model.transcribe(f, language="en", word_timestamps=True, vad_filter=False)
    words = [dict(w=w.word.strip(), s=round(w.start, 3), e=round(w.end, 3), p=round(w.probability, 2)) for s in segs for w in s.words]
    print(json.dumps(dict(file=Path(f).name, words=words)))
