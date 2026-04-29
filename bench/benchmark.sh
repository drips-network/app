#!/usr/bin/env bash
set -euo pipefail

# ─── Provision ephemeral, gitignored artifacts in the worktree ────────
# The worktree shares .git with MAIN_REPO but starts empty of node_modules,
# generated GraphQL types, and twemoji SVGs. Symlinks and rsync from the
# main repo give us a build-ready tree in ~1s without re-running npm install
# or gql codegen for every iteration.

MAIN_REPO="${CC_MAIN_REPO:-/Users/efstajas/Code/drips/app}"
REPO_ROOT="$(git rev-parse --show-toplevel)"

[ -e "$REPO_ROOT/node_modules" ] || ln -s "$MAIN_REPO/node_modules" "$REPO_ROOT/node_modules"

while IFS= read -r d; do
  rel="${d#$MAIN_REPO/}"
  target="$REPO_ROOT/$rel"
  [ -e "$target" ] && continue
  mkdir -p "$(dirname "$target")"
  ln -s "$d" "$target"
done < <(find "$MAIN_REPO/src" -type d -name __generated__)

if ! ls "$REPO_ROOT/static/twemoji"/*.svg >/dev/null 2>&1; then
  rsync -a "$MAIN_REPO/static/twemoji/" "$REPO_ROOT/static/twemoji/"
fi

# ─── Cold measurement: wipe build + vite caches every run ─────────────
rm -rf "$REPO_ROOT/.svelte-kit" "$REPO_ROOT/node_modules/.vite" "$REPO_ROOT/build" 2>/dev/null || true

START_NS=$(date +%s)
# macOS `date +%s%N` doesn't support nanoseconds; use python for sub-second precision.
START_FP=$(python3 -c 'import time; print(time.monotonic())')

npm run build:app > /tmp/cc-build.log 2>&1

END_FP=$(python3 -c 'import time; print(time.monotonic())')
ELAPSED_MS=$(python3 -c "print(int(($END_FP - $START_FP) * 1000))")

echo "build_time_ms : $ELAPSED_MS ms"
