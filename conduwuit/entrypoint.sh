#!/usr/bin/env sh
set -euo pipefail

echo "[conduwuit] Ensuring runtime config alias in /data"
/opt/sky0cloud/scripts/ensure-config.sh

TOKEN_FILE="/run/secrets/registration_token"
TOKEN="newpass123"
if [ -f "$TOKEN_FILE" ]; then
  TOKEN="$(cat "$TOKEN_FILE")"
fi

RUNTIME_CONFIG="/tmp/conduwuit-runtime.toml"
sed "s|__REGISTRATION_TOKEN__|${TOKEN}|g" /etc/conduwuit/conduwuit.toml > "$RUNTIME_CONFIG"

echo "[conduwuit] Starting matrix-conduit"
exec /usr/local/bin/matrix-conduit "$RUNTIME_CONFIG"
