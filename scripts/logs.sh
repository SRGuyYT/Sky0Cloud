#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "$0")" && pwd)/lib.sh"

service="${1:-}"
if [[ -n "$service" ]]; then
  compose logs -f --tail=200 "$service"
else
  compose logs -f --tail=200
fi
