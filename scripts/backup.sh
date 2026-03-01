#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "$0")" && pwd)/lib.sh"

BACKUP_DIR="$ROOT_DIR/backups"
mkdir -p "$BACKUP_DIR"
stamp="$(date +%Y%m%d-%H%M%S)"
out="$BACKUP_DIR/sky0cloud-$stamp.tgz"

log "Creating backup archive at $out"
compose stop conduwuit

docker run --rm \
  -v sky0cloud_conduwuit_data:/vol/db:ro \
  -v sky0cloud_media_data:/vol/media:ro \
  -v sky0cloud_config_data:/vol/config:ro \
  -v "$BACKUP_DIR:/backup" \
  alpine:3.20 \
  sh -c "tar czf /backup/sky0cloud-$stamp.tgz -C /vol db media config"

compose start conduwuit
log "Backup completed"
