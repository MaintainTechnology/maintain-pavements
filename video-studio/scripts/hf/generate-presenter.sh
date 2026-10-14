#!/usr/bin/env bash
# Generate one Seedance 2.5 presenter clip per segment (1080p, 9:16), lip-synced to out/hf-reel/seedance-ref/<key>.wav.
# Skips segments whose clip already exists; records every job in out/hf-reel/ledger/seedance/<key>.json.
set -u
# Background shells may not inherit the Windows profile variables the CLI uses to locate its credentials.
export USERPROFILE="${USERPROFILE:-C:/Users/dalig}"
export APPDATA="${APPDATA:-C:/Users/dalig/AppData/Roaming}"
export LOCALAPPDATA="${LOCALAPPDATA:-C:/Users/dalig/AppData/Local}"
export HOME="${HOME:-/c/Users/dalig}"
cd "$(dirname "$0")/../.."
mkdir -p out/hf-reel/ledger/seedance public/ai/hf-reel/clips
PROMPT="$(cat out/hf-reel/ledger/seedance-presenter-prompt.txt)"
KEYS="${*:-$(node -e 'require("./out/hf-reel/seedance-ref/plan.json").forEach(p=>console.log(p.key))')}"
for key in $KEYS; do
  secs=$(node -e 'console.log(require("./out/hf-reel/seedance-ref/plan.json").find(p=>p.key===process.argv[1]).clipSeconds)' "$key")
  [ -f "public/ai/hf-reel/clips/$key.mp4" ] && { echo "$key: exists, skipped"; continue; }
  (
    higgsfield generate create seedance_2_5 --prompt "$PROMPT" --mode omni_reference \
      --start-image public/ai/hf-reel/presenter/presenter-seed.png --audio "out/hf-reel/seedance-ref/$key.wav" \
      --duration "$secs" --resolution 1080p --aspect_ratio 9:16 --wait --wait-timeout 40m --json \
      > "out/hf-reel/ledger/seedance/$key.json" 2>&1
    url=$(node -e 'try{const j=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));const x=Array.isArray(j)?j[0]:j;console.log(x.status==="completed"?x.result_url:"")}catch(e){console.log("")}' "out/hf-reel/ledger/seedance/$key.json")
    if [ -n "$url" ]; then curl -sSL "$url" -o "public/ai/hf-reel/clips/$key.mp4" && echo "$key: done ($secs s)"; else echo "$key: FAILED"; head -c 400 "out/hf-reel/ledger/seedance/$key.json"; echo; fi
  ) &
done
wait
