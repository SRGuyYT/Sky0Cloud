#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "$0")" && pwd)/lib.sh"

DRY_RUN="${DRY_RUN:-1}"
log "Media wipe requested (DRY_RUN=$DRY_RUN)"
read -r -p "Delete media while preserving avatars/profile pictures? (yes/no): " ans
[[ "$ans" == "yes" ]] || { log "Cancelled"; exit 0; }

mountpoint="$(docker volume inspect sky0cloud_media_data --format '{{ .Mountpoint }}' 2>/dev/null || true)"
[[ -n "$mountpoint" ]] || fail "Media volume not found"

target="$mountpoint"
if [[ "$DRY_RUN" == "1" ]]; then
  log "Dry run listing files that would be deleted:"
  find "$target" -type f ! -path '*/avatars/*' ! -path '*/profile_pictures/*' -print
  exit 0
fi

compose stop conduwuit
find "$target" -type f ! -path '*/avatars/*' ! -path '*/profile_pictures/*' -delete
compose start conduwuit
log "Media wipe completed with avatar/profile preservation"
