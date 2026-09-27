#!/bin/bash
# Stop hook: if the app's structure changed (files added/removed/renamed under
# mobile/app or mobile/src, or config/routing/deps edited) and CLAUDE.md wasn't
# touched, ask Claude to update CLAUDE.md before finishing. Nags once per
# distinct set of changes, so it never loops.

input=$(cat)
[ "$(echo "$input" | jq -r '.stop_hook_active // false')" = "true" ] && exit 0

cd "$(git rev-parse --show-toplevel 2>/dev/null)" || exit 0
status=$(git status --porcelain --untracked-files=all)

# CLAUDE.md already edited in this change set: nothing to do.
echo "$status" | grep -qE '^.. "?CLAUDE\.md"?$' && exit 0

changes=$(echo "$status" | grep -E \
  -e '^(A|D|R|\?\?|.D|.A).*mobile/(app|src)/' \
  -e 'mobile/src/config\.ts$' \
  -e 'mobile/app/_layout\.tsx$' \
  -e 'mobile/app/\(tabs\)/_layout\.tsx$' \
  -e 'mobile/package\.json$' \
  | grep -vE '\.test\.tsx?$')
[ -z "$changes" ] && exit 0

# Only ask once for the same set of changes.
stamp="$(git rev-parse --git-dir)/claudemd-check.stamp"
hash=$(echo "$changes" | shasum | cut -d' ' -f1)
[ -f "$stamp" ] && [ "$(cat "$stamp")" = "$hash" ] && exit 0
echo "$hash" > "$stamp"

reason="Structural changes since the last commit may make CLAUDE.md out of date:
$changes
Update CLAUDE.md (routes table, src/data module table, config switches, lib/components lists, storage keys, gotchas) so it matches the code. Keep it concise. If nothing in CLAUDE.md is affected, say so and stop."

jq -n --arg r "$reason" '{decision: "block", reason: $r}'
