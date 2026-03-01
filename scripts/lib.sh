#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="$ROOT_DIR/docker-compose.yml"
LOG_PREFIX="[Sky0Cloud]"

log() { printf '%s %s\n' "$LOG_PREFIX" "$*"; }
fail() { log "ERROR: $*"; exit 1; }

require_cmd() { command -v "$1" >/dev/null 2>&1 || fail "Missing required command: $1"; }

compose() {
  if docker compose version >/dev/null 2>&1; then
    docker compose -f "$COMPOSE_FILE" "$@"
  elif command -v docker-compose >/dev/null 2>&1; then
    docker-compose -f "$COMPOSE_FILE" "$@"
  else
    fail "Neither docker compose plugin nor docker-compose is available"
  fi
}

ensure_env_file() {
  if [[ ! -f "$ROOT_DIR/.env" ]]; then
    cp "$ROOT_DIR/.env.example" "$ROOT_DIR/.env"
    log "Created .env from .env.example"
  fi
}

ensure_secrets() {
  mkdir -p "$ROOT_DIR/secrets"
  local token_file="$ROOT_DIR/secrets/registration_token.txt"
  if [[ ! -f "$token_file" ]]; then
    "${ROOT_DIR}/scripts/generate-secrets.sh"
  fi
}

ensure_runtime_config() {
  docker volume create sky0cloud_config_data >/dev/null
  docker run --rm \
    -v "$ROOT_DIR:/repo" \
    -v sky0cloud_config_data:/data \
    --entrypoint sh \
    alpine:3.20 \
    /repo/scripts/ensure-config.sh
  log "Runtime config file ensured in config_data volume"
}

normalize_permissions() {
  chmod +x "$ROOT_DIR"/scripts/*.sh
  chmod 0644 "$ROOT_DIR"/element/*.json "$ROOT_DIR"/element/*.html "$ROOT_DIR"/element/*.css
  chmod 0644 "$ROOT_DIR"/config/*.json "$ROOT_DIR"/caddy/Caddyfile "$ROOT_DIR"/conduwuit/conduwuit.toml
  chmod 0644 "$ROOT_DIR"/well-known/matrix/* "$ROOT_DIR"/.env.example
}
