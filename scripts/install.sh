#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "$0")" && pwd)/lib.sh"

log "Starting install"
require_cmd docker
require_cmd bash
ensure_env_file
ensure_secrets
normalize_permissions

log "Validating compose syntax"
compose config >/dev/null

log "Ensuring runtime config alias"
ensure_runtime_config

log "Building and pulling images"
compose build --pull
compose pull

log "Starting services"
compose up -d

log "Running health checks"
"$ROOT_DIR/scripts/healthcheck.sh"

log "Install completed"
compose ps
