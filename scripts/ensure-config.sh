#!/usr/bin/env bash
set -euo pipefail

TARGET_DIR="${TARGET_DIR:-/data}"
TARGET_FILE="${TARGET_DIR}/config.sky0cloud.dpdns.org.json"
TEMPLATE_FILE="$(dirname "$0")/../config/default.config.json"

echo "[Sky0Cloud] Ensuring config file exists at ${TARGET_FILE}"

mkdir -p "${TARGET_DIR}"
if [ ! -f "${TARGET_FILE}" ]; then
  echo "[Sky0Cloud] Config missing. Copying template to ${TARGET_FILE}"
  cp -a "${TEMPLATE_FILE}" "${TARGET_FILE}"
  chmod 0640 "${TARGET_FILE}"
  echo "[Sky0Cloud] Created ${TARGET_FILE}"
else
  echo "[Sky0Cloud] Config already present at ${TARGET_FILE}"
fi

exit 0
