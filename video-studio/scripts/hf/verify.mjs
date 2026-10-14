// Verify the rendered HfReel: stream spec, full decode, loudness, subtitle/timeline consistency, exact disclaimer.
//   node scripts/hf/verify.mjs [--asr]   (--asr also transcribes the final mix and scores it against the script)
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const rel = (p) => path.join(root, p);
const video = rel("out/hf-reel/maintain-pavements-hf-reel.mp4");
const timeline = JSON.parse(readFileSync(rel("src/hf-reel/timeline.json"), "utf8"));
const script = JSON.parse(readFileSync(rel("scripts/hf/script.json"), "utf8"));
const disclaimerSource = readFileSync(rel("src/superbase/schema.ts"), "utf8");
const checks = [];
const check = (name, ok, detail) => checks.push({ name, ok: Boolean(ok), detail });

check("output exists", existsSync(video), video);
const probe = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-count_frames", "-show_streams", "-show_format", "-of", "json", video]).toString());
const v = probe.streams.find((s) => s.codec_type === "video");
const a = probe.streams.find((s) => s.codec_type === "audio");
const expectedFrames = timeline.titleFrames + timeline.segments.at(-1).from + timeline.segments.at(-1).durationInFrames + timeline.endFrames;
check("h264 yuv420p 1080x1920", v.codec_name === "h264" && v.pix_fmt === "yuv420p" && v.width === 1080 && v.height === 1920, `${v.codec_name} ${v.pix_fmt} ${v.width}x${v.height}`);
check("30 fps", v.r_frame_rate === "30/1", v.r_frame_rate);
check("frame count matches timeline", Number(v.nb_read_frames) === expectedFrames, `${v.nb_read_frames} vs ${expectedFrames}`);
check("aac stereo audio", a && a.codec_name === "aac" && a.channels === 2, a ? `${a.codec_name} ${a.channels}ch ${a.sample_rate} Hz` : "missing");

const decode = spawnSync("ffmpeg", ["-v", "error", "-i", video, "-f", "null", "-"], { encoding: "utf8" });
check("full decode without errors", decode.status === 0 && !decode.stderr.trim(), decode.stderr.trim().slice(0, 300) || "clean");

const loud = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", video, "-vn", "-af", "ebur128=peak=true", "-f", "null", "-"], { encoding: "utf8" }).stderr;
const I = Number([...loud.matchAll(/I:\s+(-?[\d.]+) LUFS/g)].pop()?.[1]);
const TP = Number([...loud.matchAll(/Peak:\s+(-?[\d.]+) dBFS/g)].pop()?.[1]);
check("integrated loudness -18..-12 LUFS", I >= -18 && I <= -12, `${I} LUFS`);
check("true peak below -1 dBTP", TP < -1, `${TP} dBTP`);

// Subtitles: every segment has cues, cues are ordered, inside the segment, and never overlap.
let cueProblems = [];
timeline.segments.forEach((s) => {
  s.cues.forEach((c, i) => {
    if (c.to > s.durationInFrames) cueProblems.push(`${s.id}#${i} ends after segment`);
    if (i && c.from < s.cues[i - 1].to) cueProblems.push(`${s.id}#${i} overlaps previous`);
    c.lines.forEach((l) => l.length > 32 && cueProblems.push(`${s.id}#${i} line > 32 chars: ${l}`));
  });
  s.inserts.forEach((ins) => ins.to > s.durationInFrames && cueProblems.push(`${s.id} insert ${ins.kind} runs past segment`));
});
check("cue and insert timing", cueProblems.length === 0, cueProblems.join("; ") || "ordered, in range, <= 32 chars/line");
const scripted = script.segments.map((s) => s.subtitle).join(" ");
const allCues = timeline.segments.flatMap((s) => s.cues.map((c) => c.lines.join(" "))).join(" ");
check("cues carry every scripted word", allCues.replace(/\s+/g, " ") === scripted.replace(/\s+/g, " "), allCues === scripted ? "exact" : `cues: ${allCues.slice(0, 120)}…`);
// Only spoken step labels may be left unburned, and only where the step super carries the same words.
const unburned = timeline.segments.flatMap((s) => s.cues.filter((c) => !c.burnIn).map((c) => ({ s, c })));
const badUnburned = unburned.filter(({ s, c }) => !s.stepName || c.from > 12);
check("unburned cues are step labels only", badUnburned.length === 0, `${unburned.length} step-label cues left to the step super; ${badUnburned.length} unexpected`);
const srtPath = rel("out/hf-reel/maintain-pavements-hf-reel.srt");
const srtText = existsSync(srtPath) ? readFileSync(srtPath, "utf8") : "";
const srtWords = srtText.split(/\n\n/).map((b) => b.split("\n").slice(2).join(" ")).join(" ").replace(/\s+/g, " ").trim();
check("SRT sidecar carries every spoken line", srtWords === scripted.replace(/\s+/g, " ").trim(), srtWords === scripted ? "exact" : `srt: ${srtWords.slice(0, 120)}…`);
check("disclaimer verbatim from Claims Register constant", disclaimerSource.includes(JSON.stringify(timeline.endCard.disclaimer)), timeline.endCard.disclaimer);
const cta = timeline.segments.at(-1);
const disclaimerSeconds = (cta.durationInFrames - 6 + timeline.endFrames) / 30;
check("disclaimer on screen from the ask through the end card (>= 6 s)", timeline.endFrames >= 180 && disclaimerSeconds >= 12, `${disclaimerSeconds.toFixed(1)} s (CTA strip + ${timeline.endFrames / 30} s end card)`);
check("colour tagged BT.709 broadcast range", v.color_range === "tv" && v.color_space === "bt709" && v.color_primaries === "bt709" && v.color_transfer === "bt709", `${v.color_range} ${v.color_space} ${v.color_primaries} ${v.color_transfer}`);

if (process.argv.includes("--asr")) {
  const wav = rel("out/hf-reel/asr/final-mix.wav");
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", video, "-vn", "-ac", "1", "-ar", "16000", wav]);
  const py = rel(".venv-asr/Scripts/python.exe");
  const out = execFileSync(py, [rel("scripts/hf/word_times.py"), "large-v3", wav], { stdio: ["ignore", "pipe", "ignore"] }).toString().trim().split("\n").pop();
  const heard = JSON.parse(out).words.map((w) => w.w).join(" ");
  const norm = (t) => t.toLowerCase().replace(/superbas[es]+|super bas[es]+/g, "superbase").replace(/hard stand/g, "hardstand").replace(/cross ?-?fall/g, "crossfall").replace(/75 millimet(er|re)s|seventy-five millimetres/g, "75mm").replace(/75 mm/g, "75mm").replace(/[’']/g, "").replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter(Boolean);
  const r = norm(scripted), h = norm(heard);
  const d = Array.from({ length: r.length + 1 }, (_, i) => Array.from({ length: h.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= r.length; i++) for (let j = 1; j <= h.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (r[i - 1] === h[j - 1] ? 0 : 1));
  const wer = d[r.length][h.length] / r.length;
  check("final mix speech matches script (WER <= 8%)", wer <= 0.08, `WER ${(wer * 100).toFixed(1)}% · heard: ${heard}`);
}

const report = { video, checkedAt: new Date().toISOString(), durationSeconds: Number(probe.format.duration), checks };
writeFileSync(rel("out/hf-reel/verify-report.json"), JSON.stringify(report, null, 2));
checks.forEach((c) => console.log(`${c.ok ? "PASS" : "FAIL"}  ${c.name} — ${c.detail}`));
process.exitCode = checks.every((c) => c.ok) ? 0 : 1;
