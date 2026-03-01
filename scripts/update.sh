#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "$0")" && pwd)/lib.sh"

log "Updating stack"
require_cmd docker
ensure_env_file
ensure_secrets
normalize_permissions
ensure_runtime_config

log "Pulling latest images"
compose pull

log "Recreating services with minimal disruption"
compose up -d --remove-orphans

"$ROOT_DIR/scripts/healthcheck.sh"
log "Update complete"
