#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "$0")" && pwd)/lib.sh"

log "Checking frontend and Matrix health endpoints"

for i in $(seq 1 30); do
  if compose exec -T element-web sh -c 'wget -qO- http://127.0.0.1:80/config.json >/dev/null' && \
     compose exec -T conduwuit sh -c 'wget -qO- http://127.0.0.1:6167/_matrix/client/versions >/dev/null'; then
    log "Health checks passed"
    exit 0
  fi
  sleep 2
done

fail "Health checks failed after timeout"
