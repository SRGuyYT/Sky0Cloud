#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "$0")" && pwd)/lib.sh"

log "Reinstall requested"
read -r -p "This can be destructive. Continue reinstall? (yes/no): " ans
[[ "$ans" == "yes" ]] || { log "Reinstall cancelled"; exit 0; }

read -r -p "Remove all volumes (database, media, config)? (yes/no): " wipe
compose down --remove-orphans
if [[ "$wipe" == "yes" ]]; then
  docker volume rm -f sky0cloud_conduwuit_data sky0cloud_media_data sky0cloud_config_data >/dev/null 2>&1 || true
  log "Volumes removed"
fi

"$ROOT_DIR/scripts/install.sh"
