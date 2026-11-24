#!/usr/bin/env bash
# Claude Code Stop hook: run the Playwright suite when app code has uncommitted
# changes. A failure blocks the stop and hands the output back to Claude.
set -uo pipefail

cd "$(git rev-parse --show-toplevel)" || exit 0

input=$(cat)
paths=(src tests playwright.config.ts astro.config.mjs package.json)

changes=$(git status --porcelain -- "${paths[@]}")
[ -z "$changes" ] && exit 0

# Skip if these exact changes already passed.
stamp_file=.claude/.last-green-tests
stamp=$( { git diff HEAD -- "${paths[@]}"; git ls-files --others --exclude-standard -z -- "${paths[@]}" | xargs -0 cat 2>/dev/null; } | shasum | cut -d' ' -f1)
[ -f "$stamp_file" ] && [ "$(cat "$stamp_file")" = "$stamp" ] && exit 0

if output=$(npm test --silent -- --reporter=line 2>&1); then
  echo "$stamp" > "$stamp_file"
  echo '{"systemMessage": "Playwright tests passed"}'
  exit 0
fi

summary=$(printf '%s\n' "$output" | tail -60)

# Already blocked once this turn: report instead of looping.
if printf '%s' "$input" | grep -q '"stop_hook_active": *true'; then
  jq -n --arg s "$summary" '{systemMessage: ("Playwright tests still failing:\n" + $s)}'
  exit 0
fi

jq -n --arg s "$summary" \
  '{decision: "block", reason: ("Playwright tests failed. Fix them before finishing (run `npm test` to reproduce):\n\n" + $s)}'
