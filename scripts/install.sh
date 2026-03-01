#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "$0")" && pwd)/lib.sh"

log "Starting install"
require_cmd docker
require_cmd bash
ensure_env_file
ensure_secrets
normalize_permissions

# normalize line endings and set executable bits
find . -type f -name '*.sh' -exec dos2unix {} + || true
find . -type f -name 'entrypoint.sh' -exec chmod 750 {} + || true

log "Validating compose syntax"
compose config >/dev/null || fail "docker compose config failed"

log "Ensuring runtime config alias"
ensure_runtime_config

# ensure config
sh ./scripts/ensure-config.sh || true

log "Building and pulling images"
compose build --pull
compose pull

log "Starting services"
compose up -d

log "Running health checks"
"$ROOT_DIR/scripts/healthcheck.sh"

log "Install completed"
compose ps
