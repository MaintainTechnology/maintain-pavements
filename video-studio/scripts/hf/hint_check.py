"""Re-transcribe with and without a vocabulary hint to see whether 'bass' is acoustic or a language-model guess."""
import sys
from pathlib import Path
from faster_whisper import WhisperModel
repo = Path.home() / ".cache/huggingface/hub/models--Systran--faster-whisper-large-v3"
model = WhisperModel(str(repo / "snapshots" / (repo / "refs/main").read_text().strip()), device="cpu", compute_type="int8")
for f in sys.argv[1:]:
    for label, prompt in (("no-hint", None), ("hint", "SuperBase is a binder mixed into the existing yard base.")):
        segs, _ = model.transcribe(f, language="en", word_timestamps=True, initial_prompt=prompt, vad_filter=False)
        words = [w for s in segs for w in s.words]
        print(Path(f).name, label, "|", " ".join(f"{w.word.strip()}({w.probability:.2f})" if "bas" in w.word.lower() else w.word.strip() for w in words))
