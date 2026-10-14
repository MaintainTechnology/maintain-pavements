"""Check music takes: any recognisable words (vocals), loudness envelope, ending."""
import subprocess, sys
from pathlib import Path
import numpy as np
from faster_whisper import WhisperModel

def cached(name):
    repo = Path.home() / ".cache/huggingface/hub" / f"models--Systran--faster-whisper-{name}"
    return str(repo / "snapshots" / (repo / "refs/main").read_text().strip())

model = WhisperModel(cached("base.en"), device="cpu", compute_type="int8")
for f in sys.argv[1:]:
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", f, "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, dtype=np.float32)
    sec = [20 * np.log10(np.sqrt(np.mean(x[i:i + 16000] ** 2)) + 1e-9) for i in range(0, len(x) - 16000, 16000)]
    segs, _ = model.transcribe(f, language="en", vad_filter=True)
    words = [(round(s.start, 1), s.text.strip(), round(s.no_speech_prob, 2)) for s in segs]
    print(Path(f).name, "| rms dB per 2s:", " ".join(f"{v:.0f}" for v in sec[::2]))
    print("   whisper:", words if words else "no speech detected")
