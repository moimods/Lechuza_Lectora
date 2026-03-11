#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

node scripts/normalizar_ortografia_html.js | tee bash_norm.log
node scripts/auditar_mojibake_html.js | tee -a bash_norm.log
