#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "$0")" && pwd)/lib.sh"

log "Database wipe requested"
read -r -p "Permanently remove database volume only? (yes/no): " ans
[[ "$ans" == "yes" ]] || { log "Cancelled"; exit 0; }

compose down
docker volume rm -f sky0cloud_conduwuit_data >/dev/null 2>&1 || true
compose up -d
"$ROOT_DIR/scripts/healthcheck.sh"
log "Database wipe complete"
