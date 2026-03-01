#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "$0")" && pwd)/lib.sh"

log "Repairing deployment"
require_cmd docker
ensure_env_file
ensure_secrets

log "Normalizing line endings and executable bits"
find . -type f -name '*.sh' -exec dos2unix {} + || true
find . -type f -name 'entrypoint.sh' -exec chmod 750 {} + || true
normalize_permissions

log "Ensuring runtime config"
ensure_runtime_config
sh ./scripts/ensure-config.sh || true

compose config >/dev/null
compose up -d --force-recreate
"$ROOT_DIR/scripts/healthcheck.sh"
log "Repair completed"
