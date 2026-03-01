#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
COMPOSE_CMD="${COMPOSE_CMD:-docker compose}"

log() { printf '%s %s\n' "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" "$*"; }

log "[Sky0Cloud] Starting install"

# Check prerequisites
if ! command -v docker >/dev/null 2>&1; then
  log "ERROR: docker not found. Install Docker and re-run."
  exit 1
fi

if ! ${COMPOSE_CMD} version >/dev/null 2>&1; then
  log "ERROR: docker compose not available as '${COMPOSE_CMD}'."
  exit 1
fi

# Ensure dos2unix exists (best-effort)
if ! command -v dos2unix >/dev/null 2>&1; then
  log "[Sky0Cloud] dos2unix not found; attempting to install (apt-get)"
  if command -v apt-get >/dev/null 2>&1 && [ "$(id -u)" -eq 0 ]; then
    apt-get update && apt-get install -y dos2unix || true
  else
    log "[Sky0Cloud] dos2unix not installed; continuing but CRLF issues may persist."
  fi
fi

cd "${REPO_DIR}"

# Normalize line endings for critical scripts and entrypoints
log "[Sky0Cloud] Normalizing line endings"
find ./conduwuit ./element ./scripts -type f -name '*.sh' -print0 2>/dev/null | xargs -0 -r dos2unix || true
find ./conduwuit ./element ./scripts -type f -name 'entrypoint.sh' -print0 2>/dev/null | xargs -0 -r dos2unix || true

# Ensure scripts are executable; use sudo if necessary
log "[Sky0Cloud] Setting executable bits on scripts"
chmod_cmd="chmod 750 ./scripts/*.sh ./conduwuit/entrypoint.sh ./element/entrypoint.sh || true"
if chmod 2>/dev/null; then
  # try without sudo first
  eval "${chmod_cmd}" || true
fi
# If any chmod failed due to permissions, try with sudo
if ! find ./scripts -maxdepth 1 -type f -perm -u=x | grep -q .; then
  if command -v sudo >/dev/null 2>&1; then
    log "[Sky0Cloud] Retrying chmod with sudo"
    sudo bash -c "${chmod_cmd}"
  else
    log "[Sky0Cloud] Warning: could not set executable bits and sudo not available"
  fi
fi

# Ensure runtime config exists (this will create /data/config... inside the host volume)
log "[Sky0Cloud] Ensuring runtime config alias"
if [ -x "./scripts/ensure-config.sh" ]; then
  # run with TARGET_DIR pointing to the compose volume mount path; when running locally, map to ./data
  TARGET_DIR="${TARGET_DIR:-${REPO_DIR}/data}"
  mkdir -p "${TARGET_DIR}"
  export TARGET_DIR
  bash ./scripts/ensure-config.sh
  log "[Sky0Cloud] Runtime config file ensured in ${TARGET_DIR}"
else
  log "[Sky0Cloud] ensure-config.sh not found or not executable"
fi

# Validate compose file
log "[Sky0Cloud] Validating compose syntax"
${COMPOSE_CMD} -f docker-compose.yml config >/dev/null

# Build images that must be built locally
log "[Sky0Cloud] Building local images"
${COMPOSE_CMD} build conduwuit element-web || true

# Start stack
log "[Sky0Cloud] Starting stack"
${COMPOSE_CMD} up -d

# Basic health wait (best-effort)
log "[Sky0Cloud] Waiting for services to report healthy (30s)"
sleep 5
for i in $(seq 1 12); do
  unhealthy=$(${COMPOSE_CMD} ps --services --filter "status=running" | wc -l || true)
  # This is a simple loop; more advanced checks can be added
  sleep 2
done

log "[Sky0Cloud] Install finished. Check 'docker compose ps' and 'docker compose logs' for details."
