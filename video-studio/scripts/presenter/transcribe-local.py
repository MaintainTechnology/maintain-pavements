"""Transcribe actual presenter media with cached local Whisper weights.

No planned script or prompt is supplied to recognition. No model downloads.
Run with the isolated .venv-asr interpreter, not the Remotion runtime.
"""

import argparse
import json
import os
from pathlib import Path
import time


def cached_model(model_name: str) -> Path:
    cache = Path.home() / ".cache" / "huggingface" / "hub"
    repository = cache / f"models--Systran--faster-whisper-{model_name}"
    ref = repository / "refs" / "main"
    if not ref.exists():
        raise FileNotFoundError(f"No cached model reference: {ref}")
    snapshot = repository / "snapshots" / ref.read_text().strip()
    for filename in ("model.bin", "config.json", "tokenizer.json"):
        path = snapshot / filename
        if not path.is_file() or path.stat().st_size == 0:
            raise FileNotFoundError(f"Cached model file unavailable: {path}")
    return snapshot


def caption_phrases(words):
    phrases = []
    group = []
    for word in words:
        if group and (
            len(group) >= 6
            or word["endSeconds"] - group[0]["startSeconds"] > 2.8
            or word["startSeconds"] - group[-1]["endSeconds"] > 0.55
        ):
            phrases.append(phrase(group))
            group = []
        group.append(word)
        if word["text"].rstrip().endswith((".", "?", "!")):
            phrases.append(phrase(group))
            group = []
    if group:
        phrases.append(phrase(group))
    return phrases


def phrase(words):
    return {
        "startSeconds": words[0]["startSeconds"],
        "endSeconds": words[-1]["endSeconds"],
        "text": " ".join(word["text"].strip() for word in words).strip().replace(" -", "-"),
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--model", default="base.en", choices=("base.en", "large-v3"))
    parser.add_argument("--threads", default=2, type=int)
    parser.add_argument("--start-seconds", default=0.0, type=float)
    parser.add_argument("--end-seconds", type=float)
    args = parser.parse_args()
    if args.start_seconds < 0 or (
        args.end_seconds is not None and args.end_seconds <= args.start_seconds
    ):
        parser.error("Transcription window must have nonnegative start and positive duration.")
    source = args.source.resolve(strict=True)
    model_path = cached_model(args.model)
    os.environ["HF_HUB_OFFLINE"] = "1"
    os.environ["TRANSFORMERS_OFFLINE"] = "1"
    os.environ["HF_HUB_DISABLE_TELEMETRY"] = "1"
    from faster_whisper import WhisperModel

    started = time.perf_counter()
    model = WhisperModel(
        str(model_path),
        device="cpu",
        compute_type="int8",
        cpu_threads=args.threads,
        num_workers=1,
        local_files_only=True,
    )
    segments, info = model.transcribe(
        str(source),
        language="en",
        beam_size=5,
        word_timestamps=True,
        vad_filter=False,
        condition_on_previous_text=False,
        initial_prompt=None,
        temperature=0,
        clip_timestamps=(
            f"{args.start_seconds},{args.end_seconds}"
            if args.end_seconds is not None
            else str(args.start_seconds)
        ),
    )
    segment_data = []
    words = []
    for segment in segments:
        segment_data.append({
            "startSeconds": round(segment.start, 3),
            "endSeconds": round(segment.end, 3),
            "text": segment.text.strip(),
            "averageLogProbability": round(segment.avg_logprob, 4),
            "noSpeechProbability": round(segment.no_speech_prob, 4),
            "compressionRatio": round(segment.compression_ratio, 4),
        })
        for word in segment.words or []:
            words.append({
                "startSeconds": round(word.start, 3),
                "endSeconds": round(word.end, 3),
                "text": word.word.strip(),
                "probability": round(word.probability, 4),
            })
    transcript = " ".join(s["text"] for s in segment_data).strip()
    result = {
        "source": str(source),
        "fullTranscript": transcript,
        "phrases": caption_phrases(words),
        "words": words,
        "segments": segment_data,
        "quality": {
            "recognizer": "faster-whisper",
            "model": args.model,
            "device": "cpu",
            "computeType": "int8",
            "cachedWeightsOnly": True,
            "initialPromptProvided": False,
            "plannedScriptProvided": False,
            "wordTimestamps": True,
            "language": info.language,
            "durationSeconds": round(info.duration, 3),
            "transcriptionWindowStartSeconds": args.start_seconds,
            "transcriptionWindowEndSeconds": args.end_seconds,
            "timestampsRelativeTo": "source media; not window start",
            "elapsedSeconds": round(time.perf_counter() - started, 3),
            "wordCount": len(words),
            "lowConfidenceWords": [w for w in words if w["probability"] < 0.65],
            "status": "Independent automatic transcript; review proper nouns and timing before final subtitles.",
        },
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(args.output.resolve()), "fullTranscript": transcript,
                      "durationSeconds": result["quality"]["durationSeconds"],
                      "elapsedSeconds": result["quality"]["elapsedSeconds"]}))


if __name__ == "__main__":
    main()
