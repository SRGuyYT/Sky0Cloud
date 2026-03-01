#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "$0")" && pwd)/lib.sh"

archive="${1:-}"
[[ -n "$archive" && -f "$archive" ]] || fail "Usage: scripts/restore.sh <backup-archive.tgz>"

read -r -p "Restore from $archive and overwrite existing volumes? (yes/no): " ans
[[ "$ans" == "yes" ]] || { log "Restore cancelled"; exit 0; }

compose down

docker volume rm -f sky0cloud_conduwuit_data sky0cloud_media_data sky0cloud_config_data >/dev/null 2>&1 || true
docker volume create sky0cloud_conduwuit_data >/dev/null
docker volume create sky0cloud_media_data >/dev/null
docker volume create sky0cloud_config_data >/dev/null

docker run --rm \
  -v sky0cloud_conduwuit_data:/restore/db \
  -v sky0cloud_media_data:/restore/media \
  -v sky0cloud_config_data:/restore/config \
  -v "$(cd "$(dirname "$archive")" && pwd):/backup" \
  alpine:3.20 \
  sh -c "tar xzf /backup/$(basename "$archive") -C /restore"

compose up -d
"$ROOT_DIR/scripts/healthcheck.sh"
log "Restore complete"
