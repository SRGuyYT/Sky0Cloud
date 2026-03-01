#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SECRETS_DIR="$ROOT_DIR/secrets"
mkdir -p "$SECRETS_DIR"

if [[ ! -f "$SECRETS_DIR/registration_token.txt" ]]; then
  tr -dc 'A-Za-z0-9' </dev/urandom | head -c 40 >"$SECRETS_DIR/registration_token.txt"
  chmod 0600 "$SECRETS_DIR/registration_token.txt"
  echo "[Sky0Cloud] Generated secrets/registration_token.txt"
else
  echo "[Sky0Cloud] registration_token.txt already exists"
fi
