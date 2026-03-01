#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "$0")" && pwd)/lib.sh"

log "Repairing deployment"
require_cmd docker
ensure_env_file
ensure_secrets
normalize_permissions
ensure_runtime_config

compose config >/dev/null
compose up -d --force-recreate
"$ROOT_DIR/scripts/healthcheck.sh"
log "Repair completed"
