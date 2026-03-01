#!/usr/bin/env sh
set -euo pipefail

# Ensure the Element runtime config exists in the shared data volume.
# Caddy mounts the same volume at /srv and serves this file from
# /srv/runtime/config.sky0cloud.dpdns.org.json.
TARGET_DIR="/data/runtime"
TARGET_FILE="${TARGET_DIR}/config.sky0cloud.dpdns.org.json"
TEMPLATE_FILE="/opt/sky0cloud/config.default.json"

echo "[element-web] Ensuring config file exists at ${TARGET_FILE}"

mkdir -p "${TARGET_DIR}"
if [ ! -f "${TARGET_FILE}" ]; then
  echo "[element-web] Config missing. Copying template to ${TARGET_FILE}"
  cp -a "${TEMPLATE_FILE}" "${TARGET_FILE}"
  chmod 640 "${TARGET_FILE}"
  echo "[element-web] Created ${TARGET_FILE}"
else
  echo "[element-web] Config already present at ${TARGET_FILE}"
fi

# Exec the main process (the original Element entrypoint / command)
exec "$@"
