#!/bin/bash
# Installs npm dependencies when a Claude Code on the web session starts,
# so `npm start`, `npm test` and `npm run build` work right away.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# npm install (not ci) so the cached node_modules from a previous session is reused
npm install --no-audit --no-fund --loglevel=error
