// Builds src/hf-reel/timeline.json from the narration script, the edit plan, Whisper word timings of the
// Seedance clips, measured silences and ffprobe readback. Also writes loudness-matched, seekable copies of the
// clips and the SRT sidecar.
//
//   node scripts/hf/build-timeline.mjs              # normalise audio (if missing) + timeline + SRT
//   node scripts/hf/build-timeline.mjs --force-norm # re-create the loudness-matched clips
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const rel = (p) => path.join(root, p);
const FPS = 30;
const VOICE_LUFS = -16;
const CUE_IN = 2 / FPS; // a cue appears 2 frames before its first word (design spec "in −2 f")
const HOLD_AFTER = 0.35; // hold after the audible end of a segment's last word
const MAX_PAUSE = 0.75; // pauses longer than this are tightened when an insert hides the cut
const KEEP_BEFORE = 0.25; // seconds of a tightened pause kept after the last word
const KEEP_AFTER = 0.3; // … and before the next word
const f = (seconds) => Math.round(seconds * FPS);

const script = JSON.parse(readFileSync(rel("scripts/hf/script.json"), "utf8"));
const edit = JSON.parse(readFileSync(rel("scripts/hf/edit.json"), "utf8"));
const asr = Object.fromEntries(
  readFileSync(rel("out/hf-reel/asr/clips.jsonl"), "utf8")
    .split("\n")
    .filter((l) => l.trim())
    .map((l) => JSON.parse(l))
    .map((r) => [path.basename(r.file, ".mp4"), r.words]),
);

const videoSeconds = (file) =>
  Number(execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=duration", "-of", "csv=p=0", file]).toString().trim());

// ffmpeg prints the EBU R128 summary and per-window astats metadata on stderr.
const stderrOf = (args) => String(spawnSync("ffmpeg", ["-hide_banner", "-nostats", ...args, "-f", "null", "-"], { encoding: "utf8" }).stderr);
const lufsOf = (file) => {
  const m = [...stderrOf(["-i", file, "-vn", "-af", "ebur128"]).matchAll(/I:\s+(-?[\d.]+) LUFS/g)].pop();
  return m ? Number(m[1]) : null;
};
// Pauses come from the 20 ms RMS envelope, not silencedetect: room tone in some clips has sample peaks above
// any useful peak threshold while its RMS sits at -42 dB. The per-clip floor is the 15th percentile of RMS
// above digital silence (02-prepare ≈ -42 dBFS); a pause is at least 0.1 s below floor + 7 dB.
const WINDOW = 0.02;
const pausesOf = (file) => {
  const text = stderrOf(["-i", file, "-vn", "-af", "aresample=16000,asetnsamples=n=320,astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level"]);
  const rms = [...text.matchAll(/RMS_level=(\S+)/g)].map((m) => (Number.isFinite(Number(m[1])) ? Number(m[1]) : -120));
  const audible = rms.filter((v) => v > -75).sort((a, b) => a - b);
  const floor = audible.length ? audible[Math.floor(audible.length * 0.15)] : -60;
  const threshold = Math.min(-30, Math.max(-50, floor + 7));
  const pauses = [];
  let start = null;
  rms.forEach((v, i) => {
    if (v < threshold && start === null) start = i;
    if ((v >= threshold || i === rms.length - 1) && start !== null) {
      const end = v >= threshold ? i : i + 1;
      if ((end - start) * WINDOW >= 0.1) pauses.push({ s: start * WINDOW, e: end * WINDOW });
      start = null;
    }
  });
  return { threshold, pauses };
};

// ---------- token alignment ----------
const NUMBER_WORDS = { 75: ["seventy", "five"] };
const tokens = (text) =>
  text
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/superbas[es]+/g, "super base")
    .replace(/\bhardstand\b/g, "hard stand")
    .replace(/\bcrossfall\b/g, "cross fall")
    .replace(/millimet(er|re)s?/g, "millimetres")
    .replace(/\bmm\b/g, "millimetres")
    .replace(/-/g, " ")
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .flatMap((t) => NUMBER_WORDS[t] ?? [t]);

const align = (ref, hyp) => {
  const n = ref.length, m = hyp.length;
  const d = Array.from({ length: n + 1 }, (_, i) => Array.from({ length: m + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= n; i++)
    for (let j = 1; j <= m; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (ref[i - 1] === hyp[j - 1].t ? 0 : 1));
  const map = new Array(n).fill(null);
  let i = n, j = m, errors = 0;
  while (i > 0 && j > 0) {
    const same = ref[i - 1] === hyp[j - 1].t;
    if (d[i][j] === d[i - 1][j - 1] + (same ? 0 : 1)) { map[i - 1] = j - 1; if (!same) errors++; i--; j--; }
    else if (d[i][j] === d[i - 1][j] + 1) { errors++; i--; }
    else { errors++; j--; }
  }
  errors += i + j;
  return { map, wer: errors / n };
};

// ---------- pass 1: per-segment analysis in clip time ----------
const plans = script.segments.map((seg) => {
  const plan = edit.segments[seg.id];
  const clipFile = rel(`public/ai/hf-reel/clips/${plan.clip}.mp4`);
  const clipSeconds = videoSeconds(clipFile);
  const words = asr[plan.clip];
  if (!words?.length) throw new Error(`No ASR words for ${plan.clip}`);
  const { threshold, pauses: silences } = pausesOf(clipFile);

  const hyp = words.flatMap((w) => tokens(w.w).map((t) => ({ t, s: w.s, e: w.e })));
  const cueTokens = seg.cues.map((c) => tokens(c.lines.join(" ")));
  const { map, wer } = align(cueTokens.flat(), hyp);
  const times = cueTokens.flat().map((_, k) => (map[k] !== null ? hyp[map[k]] : null));
  times.forEach((t, k) => {
    if (t) return;
    const prev = times.slice(0, k).reverse().find(Boolean);
    const next = times.slice(k + 1).find(Boolean);
    times[k] = { s: prev ? prev.e : next.s, e: next ? next.s : prev.e, interpolated: true };
  });
  let k = 0;
  const whisperStarts = cueTokens.map((ct) => { const s = times[k].s; k += ct.length; return s; });

  // Audible speech: first onset after the lead-in silence; end where the final silence begins.
  const lead = silences.find((s) => s.s <= 0.05);
  const onset = lead ? lead.e : 0;
  const tail = silences.find((s) => s.e >= clipSeconds - 0.05 && s.s > words[words.length - 1].s);
  const speechEnd = Math.max(words[words.length - 1].e, tail ? tail.s : clipSeconds);

  // Cue boundaries: Whisper word starts on these clips often fall inside the preceding pause (up to ~0.5 s
  // early), so snap each estimate to the pause that contains it (or nearly does) and switch at its end.
  // Dips shorter than 0.2 s are inside words (e.g. "clear-ed") and are ignored.
  const gapTo = (t, s) => (t < s.s ? s.s - t : t > s.e ? t - s.e : 0);
  const pauseNear = (t) =>
    silences
      .filter((s) => s.e - s.s >= 0.2 && s.s > onset + 0.05 && s.e < speechEnd && t >= s.s - 0.5 && t <= s.e + 0.3)
      .sort((a, b) => gapTo(t, a) - gapTo(t, b) || b.e - b.s - (a.e - a.s))[0];
  const cueStarts = whisperStarts.map((t, idx) => {
    if (idx === 0) return onset;
    const p = pauseNear(t);
    return p ? p.e : t;
  });
  const pauseBefore = cueStarts.map((t, idx) => (idx === 0 ? null : pauseNear(whisperStarts[idx]) ?? null));

  // Pause tightening: only where the next cue opens an insert, which hides the presenter cut.
  const cuts = [];
  if (plan.tightenPauses) {
    plan.inserts.forEach((ins) => {
      if (typeof ins.fromCue !== "number" || ins.fromCue === 0) return;
      const p = pauseBefore[ins.fromCue];
      if (p && p.e - p.s > MAX_PAUSE) cuts.push({ from: p.s + KEEP_BEFORE, to: p.e - KEEP_AFTER, forCue: ins.fromCue });
    });
  }
  return { seg, plan, clipFile, clipSeconds, words, silences, threshold, wer, onset, speechEnd, cueStarts, pauseBefore, cuts, interpolated: times.filter((t) => t.interpolated).length };
});

// Which boundaries dissolve: presenter on both sides and not forced to a hard cut.
const endsOnPresenter = (p) => !p.plan.inserts.some((i) => i.toCue === "end");
const startsOnPresenter = (p) => !p.plan.inserts.some((i) => i.fromStart);
const dissolveIn = plans.map((p, i) => i > 0 && endsOnPresenter(plans[i - 1]) && startsOnPresenter(p) && p.plan.cut !== "hard");

// ---------- pass 2: segment time, cues, inserts ----------
const normDir = rel("public/ai/hf-reel/clips/norm");
mkdirSync(normDir, { recursive: true });
let cursor = 0;
const segments = [];
const srt = [];
const report = [];

plans.forEach((p, i) => {
  const { seg, plan } = p;
  // Map clip time → segment time given removed pause ranges.
  const removedBefore = (t) => p.cuts.filter((c) => c.to <= t).reduce((sum, c) => sum + (c.to - c.from), 0);
  const toSeg = (t) => t - removedBefore(t);
  // Dissolves hold the outgoing clip's last frame, so no clip frames need reserving here.
  const segEndClip = Math.min(p.clipSeconds - 0.04, p.speechEnd + HOLD_AFTER);
  const durationInFrames = f(toSeg(segEndClip));

  const pieces = [];
  let clipFrom = 0;
  p.cuts.forEach((c) => {
    pieces.push({ clipFromFrame: f(clipFrom), from: f(toSeg(clipFrom)), durationInFrames: f(toSeg(c.from)) - f(toSeg(clipFrom)) });
    clipFrom = c.to;
  });
  pieces.push({ clipFromFrame: f(clipFrom), from: f(toSeg(clipFrom)), durationInFrames: durationInFrames - f(toSeg(clipFrom)) });

  const cueFrom = p.cueStarts.map((t) => Math.max(0, f(toSeg(t) - CUE_IN)));
  const cues = seg.cues.map((c, idx) => ({
    lines: c.lines,
    burnIn: c.burnIn !== false,
    from: cueFrom[idx],
    to: idx < seg.cues.length - 1 ? cueFrom[idx + 1] : durationInFrames,
  }));
  cues.forEach((c, idx) => {
    const nextPause = p.pauseBefore[idx + 1];
    const audibleEnd = nextPause ? toSeg(nextPause.s) : toSeg(p.speechEnd);
    srt.push({ t0: (cursor + c.from) / FPS, t1: (cursor + Math.min(c.to, f(audibleEnd) + 4)) / FPS, text: c.lines.join("\n") });
  });

  const inserts = plan.inserts.map((ins) => {
    const cut = p.cuts.find((c) => c.forCue === ins.fromCue);
    // An insert that hides a tightened pause starts on the cut itself.
    let from = ins.fromStart ? 0 : cut ? f(toSeg(cut.from)) : cues[ins.fromCue].from;
    let to = ins.toCue === "end" ? durationInFrames : cues[ins.toCue].to;
    const { fromCue: _a, toCue: _b, fromStart: _c, maxSeconds, fitSourceSeconds, $cropNote: _n, ...rest } = ins;
    let playbackRate = 1;
    if (fitSourceSeconds) {
      playbackRate = Math.max(0.7, Math.min(1, fitSourceSeconds / ((to - from) / FPS)));
      to = Math.min(to, from + Math.floor((fitSourceSeconds / playbackRate) * FPS));
    } else if (maxSeconds) {
      to = Math.min(to, from + f(maxSeconds));
    }
    return rest.kind === "portrait" || rest.kind === "square" ? { ...rest, playbackRate: +playbackRate.toFixed(3), from, to } : { ...rest, from, to };
  });

  const caption =
    plan.captionCue !== null && seg.onScreenCaption
      ? { text: seg.onScreenCaption, from: cues[plan.captionCue].from, to: cues[plan.captionCue].to }
      : null;

  // Loudness-matched copy of the clip (voice to -16 LUFS, 48 kHz). The video is re-encoded with a keyframe every
  // second and no B-frames: Seedance delivers one GOP per clip, which Remotion cannot seek into reliably.
  const normRel = `ai/hf-reel/clips/norm/${plan.clip}.mp4`;
  const normFile = rel(`public/${normRel}`);
  const measured = lufsOf(p.clipFile);
  const gainDb = measured === null ? 0 : VOICE_LUFS - measured;
  if (!existsSync(normFile) || process.argv.includes("--force-norm")) {
    execFileSync("ffmpeg", ["-v", "error", "-y", "-i", p.clipFile, "-c:v", "libx264", "-crf", "14", "-preset", "slow", "-g", "24", "-bf", "0", "-pix_fmt", "yuv420p", "-af", `highpass=f=70,afftdn=nr=10:nf=${Math.max(-80, Math.min(-20, p.threshold - 4)).toFixed(0)}:tn=1,volume=${gainDb.toFixed(2)}dB,alimiter=limit=0.84:level=false,aresample=48000`, "-c:a", "aac", "-b:a", "256k", normFile]);
  }

  segments.push({
    id: seg.id,
    step: seg.step,
    stepName: seg.stepLabel ? seg.stepLabel.replace(/^\d+\s*/, "") : null,
    clip: normRel,
    voiceGain: 1,
    presenterScale: plan.framing?.scale ?? 1,
    presenterDy: plan.framing?.dy ?? 0,
    from: cursor,
    durationInFrames,
    dissolveIn: dissolveIn[i],
    pieces,
    cues,
    inserts,
    caption,
  });
  report.push({
    id: seg.id,
    clipSeconds: +p.clipSeconds.toFixed(3),
    speechEnd: +p.speechEnd.toFixed(3),
    segSeconds: +(durationInFrames / FPS).toFixed(3),
    cutSeconds: +p.cuts.reduce((s, c) => s + c.to - c.from, 0).toFixed(3),
    wer: +p.wer.toFixed(3),
    gainDb: +gainDb.toFixed(2),
    dissolveIn: dissolveIn[i],
    pauseThresholdDb: +p.threshold.toFixed(1),
    interpolatedTokens: p.interpolated,
  });
  cursor += durationInFrames;
});

const contact = script.endCard;
const timeline = {
  titleFrames: edit.titleFrames,
  endFrames: edit.endFrames,
  presenterLabel: "AI presenter · illustrative",
  segments,
  music: edit.music,
  title: edit.title,
  endCard: {
    setup: edit.endCard.setup,
    payoff: edit.endCard.payoff,
    name: contact.name,
    phone: contact.phone,
    email: contact.email,
    web: contact.web,
    disclaimer: contact.disclaimerExact,
    aiDisclosure: edit.endCard.aiDisclosure,
  },
};
writeFileSync(rel("src/hf-reel/timeline.json"), JSON.stringify(timeline, null, 2) + "\n");

// SRT sidecar on the final Reel's clock (title open precedes the body). It carries every spoken line.
const stamp = (s) => {
  const ms = Math.round(Math.max(0, s) * 1000);
  const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000), sec = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")},${String(ms % 1000).padStart(3, "0")}`;
};
const offset = edit.titleFrames / FPS;
mkdirSync(rel("out/hf-reel"), { recursive: true });
writeFileSync(
  rel("out/hf-reel/maintain-pavements-hf-reel.srt"),
  srt.map((c, i) => `${i + 1}\n${stamp(c.t0 + offset)} --> ${stamp(c.t1 + offset)}\n${c.text}\n`).join("\n"),
);
writeFileSync(rel("out/hf-reel/timeline-report.json"), JSON.stringify(report, null, 2));
const total = edit.titleFrames + cursor + edit.endFrames;
console.table(report);
console.log(`body ${(cursor / FPS).toFixed(2)} s, total ${(total / FPS).toFixed(2)} s (${total} frames)`);
