#!/usr/bin/env bash
# Claude Code Stop hook: run the Playwright suite when app code has uncommitted
# changes, and the scoreboard/ app's lint, check and tests when it does. A
# failure blocks the stop and hands the output back to Claude.
set -uo pipefail

cd "$(git rev-parse --show-toplevel)" || exit 0

input=$(cat)
passed=""
failed=""
summary=""

# run_suite <name> <dir> <stamp file> <command> <paths...>
# Skips when <paths> are clean or these exact changes already passed.
run_suite() {
  local name=$1 dir=$2 stamp_file=$3 command=$4
  shift 4

  [ -z "$(git status --porcelain -- "$@")" ] && return 0

  local stamp
  stamp=$( { git diff HEAD -- "$@"; git ls-files --others --exclude-standard -z -- "$@" | xargs -0 cat 2>/dev/null; } | shasum | cut -d' ' -f1)
  [ -f "$stamp_file" ] && [ "$(cat "$stamp_file")" = "$stamp" ] && return 0

  local output
  if output=$(cd "$dir" && eval "$command" 2>&1); then
    echo "$stamp" > "$stamp_file"
    passed+="${passed:+, }$name"
    return 0
  fi

  failed+="${failed:+, }$name"
  summary+="── $name (reproduce: cd $dir && $command) ──"$'\n'
  summary+="$(printf '%s\n' "$output" | tail -60)"$'\n\n'
}

run_suite 'Playwright tests' . .claude/.last-green-tests \
  'npm test --silent -- --reporter=line' \
  src tests playwright.config.ts astro.config.mjs package.json

run_suite 'Scoreboard lint/check/tests' scoreboard .claude/.last-green-scoreboard \
  'npm run --silent lint && npm run --silent check && npm test --silent -- --reporter=line' \
  scoreboard

if [ -z "$failed" ]; then
  [ -n "$passed" ] && jq -n --arg p "$passed" '{systemMessage: ($p + " passed")}'
  exit 0
fi

# Already blocked once this turn: report instead of looping.
if printf '%s' "$input" | grep -q '"stop_hook_active": *true'; then
  jq -n --arg f "$failed" --arg s "$summary" \
    '{systemMessage: ($f + " still failing:\n" + $s)}'
  exit 0
fi

jq -n --arg f "$failed" --arg s "$summary" \
  '{decision: "block", reason: ($f + " failed. Fix them before finishing:\n\n" + $s)}'
