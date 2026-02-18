#!/usr/bin/env bash
set -euo pipefail

SKY_ROOT="/opt/skyserver"
SKY_USER="skyserver"
SKY_GROUP="skyserver"
CONTINUWUITY_DIR="$SKY_ROOT/continuwuity"
ELEMENT_DIR="$SKY_ROOT/element"
PORTAL_DIR="$SKY_ROOT/portal"
CADDY_DIR="$SKY_ROOT/caddy"
SCRIPTS_DIR="$SKY_ROOT/scripts"
BACKUP_DIR="$SKY_ROOT/backups"
SYSTEMD_DIR="/etc/systemd/system"

# Override these in /opt/skyserver/scripts/.env if needed.
CONTINUWUITY_RELEASE_API="${CONTINUWUITY_RELEASE_API:-https://forgejo.ellis.link/api/v1/repos/continuwuation/continuwuity/releases/latest}"
ELEMENT_RELEASE_API="${ELEMENT_RELEASE_API:-https://api.github.com/repos/element-hq/element-web/releases/latest}"
DOMAIN="${DOMAIN:-sky0cloud.dpdns.org}"

if [[ -f "$SCRIPTS_DIR/.env" ]]; then
  # shellcheck disable=SC1090
  source "$SCRIPTS_DIR/.env"
fi

log() { printf '[skyserver] %s\n' "$*"; }
err() { printf '[skyserver][error] %s\n' "$*" >&2; }

require_root() {
  if [[ "${EUID}" -ne 0 ]]; then
    err "run as root"
    exit 1
  fi
}

ensure_user() {
  if ! id "$SKY_USER" >/dev/null 2>&1; then
    log "creating user/group $SKY_USER"
    groupadd --system "$SKY_GROUP"
    useradd --system --gid "$SKY_GROUP" --home-dir "$SKY_ROOT" --shell /usr/sbin/nologin "$SKY_USER"
  fi
}

create_folders() {
  install -d -m 0750 -o "$SKY_USER" -g "$SKY_GROUP" \
    "$SKY_ROOT" "$CONTINUWUITY_DIR" "$ELEMENT_DIR" "$CADDY_DIR" "$SCRIPTS_DIR" "$BACKUP_DIR" "$PORTAL_DIR"
}

fetch_latest_continuwuity() {
  log "downloading latest Continuwuity release"
  local json asset url tmp
  tmp="$(mktemp -d)"
  json="$tmp/continuwuity-release.json"
  curl -fsSL "$CONTINUWUITY_RELEASE_API" -o "$json"

  asset="$(python3 - <<'PY' "$json"
import json,sys
j=json.load(open(sys.argv[1]))
assets=j.get('assets',[])
for a in assets:
    name=a.get('name','').lower()
    if ('linux' in name and ('x86_64' in name or 'amd64' in name) and (name.endswith('.tar.gz') or name.endswith('.tgz'))):
        print(a.get('browser_download_url',''))
        break
PY
)"

  if [[ -z "$asset" ]]; then
    err "unable to find linux amd64 tarball in Continuwuity release"
    exit 1
  fi

  url="$asset"
  curl -fsSL "$url" -o "$tmp/continuwuity.tar.gz"
  tar -xzf "$tmp/continuwuity.tar.gz" -C "$tmp"

  local bin
  bin="$(find "$tmp" -type f \( -name continuwuity -o -name conduwuit \) | head -n1)"
  if [[ -z "$bin" ]]; then
    err "continuwuity binary not found after extraction"
    exit 1
  fi

  install -m 0750 -o "$SKY_USER" -g "$SKY_GROUP" "$bin" "$CONTINUWUITY_DIR/continuwuity"
  rm -rf "$tmp"
}

fetch_latest_element() {
  log "downloading latest Element Web release"
  local tmp json tarball_url
  tmp="$(mktemp -d)"
  json="$tmp/element-release.json"
  curl -fsSL "$ELEMENT_RELEASE_API" -o "$json"

  tarball_url="$(python3 - <<'PY' "$json"
import json,sys
j=json.load(open(sys.argv[1]))
for a in j.get('assets',[]):
    n=a.get('name','')
    if n.endswith('.tar.gz') and 'web' in n.lower():
        print(a.get('browser_download_url',''))
        break
PY
)"

  if [[ -z "$tarball_url" ]]; then
    tarball_url="$(python3 - <<'PY' "$json"
import json,sys
j=json.load(open(sys.argv[1]))
print(j.get('tarball_url',''))
PY
)"
  fi

  if [[ -z "$tarball_url" ]]; then
    err "unable to resolve element-web release artifact"
    exit 1
  fi

  rm -rf "$ELEMENT_DIR/current"
  mkdir -p "$ELEMENT_DIR/current"

  curl -fsSL "$tarball_url" -o "$tmp/element.tar.gz"
  tar -xzf "$tmp/element.tar.gz" -C "$tmp"

  local src
  src="$(find "$tmp" -maxdepth 2 -type d -name 'element-*' | head -n1)"
  if [[ -z "$src" ]]; then
    src="$(find "$tmp" -maxdepth 2 -type d | tail -n1)"
  fi

  cp -a "$src"/. "$ELEMENT_DIR/current"/
  chown -R "$SKY_USER:$SKY_GROUP" "$ELEMENT_DIR/current"
  rm -rf "$tmp"
}

sync_repo_assets() {
  local repo_root
  repo_root="$(cd "$(dirname "$0")/../.." && pwd)"

  log "syncing managed configs from repo"
  install -m 0640 -o "$SKY_USER" -g "$SKY_GROUP" "$repo_root/baremetal/continuwuity/config.toml" "$CONTINUWUITY_DIR/config.toml"
  install -m 0644 -o "$SKY_USER" -g "$SKY_GROUP" "$repo_root/baremetal/element/config.json" "$ELEMENT_DIR/current/config.json"

  install -m 0644 -o "$SKY_USER" -g "$SKY_GROUP" "$repo_root/baremetal/caddy/Caddyfile" "$CADDY_DIR/Caddyfile"

  install -m 0644 -o "$SKY_USER" -g "$SKY_GROUP" "$repo_root/baremetal/portal/index.html" "$PORTAL_DIR/index.html"
  install -m 0644 -o "$SKY_USER" -g "$SKY_GROUP" "$repo_root/baremetal/portal/manifest.json" "$PORTAL_DIR/manifest.json"
  install -m 0644 -o "$SKY_USER" -g "$SKY_GROUP" "$repo_root/baremetal/portal/sw.js" "$PORTAL_DIR/sw.js"
  install -m 0644 -o "$SKY_USER" -g "$SKY_GROUP" "$repo_root/branding/logo.png" "$PORTAL_DIR/logo.png"
  install -m 0644 -o "$SKY_USER" -g "$SKY_GROUP" "$repo_root/branding/logo.png" "$PORTAL_DIR/apple-touch-icon.png"
  install -m 0644 -o "$SKY_USER" -g "$SKY_GROUP" "$repo_root/branding/background.jpg" "$PORTAL_DIR/background.jpg"
}

install_systemd_units() {
  local repo_root
  repo_root="$(cd "$(dirname "$0")/../.." && pwd)"

  install -m 0644 "$repo_root/baremetal/systemd/sky-continuwuity.service" "$SYSTEMD_DIR/sky-continuwuity.service"
  install -m 0644 "$repo_root/baremetal/systemd/sky-element.service" "$SYSTEMD_DIR/sky-element.service"
  install -m 0644 "$repo_root/baremetal/systemd/sky-caddy.service" "$SYSTEMD_DIR/sky-caddy.service"

  systemctl daemon-reload
  systemctl enable sky-continuwuity.service sky-element.service sky-caddy.service
}

start_services() {
  systemctl restart sky-continuwuity.service
  systemctl restart sky-element.service
  systemctl restart sky-caddy.service
}

stop_services() {
  systemctl stop sky-caddy.service || true
  systemctl stop sky-element.service || true
  systemctl stop sky-continuwuity.service || true
}

install_all() {
  require_root
  ensure_user
  create_folders
  fetch_latest_continuwuity
  fetch_latest_element
  sync_repo_assets
  install_systemd_units
  start_services
  log "install complete"
}

upgrade_all() {
  require_root
  stop_services
  fetch_latest_continuwuity
  fetch_latest_element
  sync_repo_assets
  systemctl daemon-reload
  start_services
  log "upgrade complete"
}

remove_all() {
  require_root
  stop_services
  systemctl disable sky-caddy.service sky-element.service sky-continuwuity.service || true
  rm -f "$SYSTEMD_DIR/sky-caddy.service" "$SYSTEMD_DIR/sky-element.service" "$SYSTEMD_DIR/sky-continuwuity.service"
  systemctl daemon-reload
  rm -rf "$CONTINUWUITY_DIR/continuwuity" "$ELEMENT_DIR/current" "$CADDY_DIR/Caddyfile" "$PORTAL_DIR"/*
  log "remove complete (database and backups preserved)"
}

repair_all() {
  require_root
  ensure_user
  create_folders
  chown -R "$SKY_USER:$SKY_GROUP" "$SKY_ROOT"
  chmod -R u=rwX,g=rX,o= "$SKY_ROOT"

  [[ -x "$CONTINUWUITY_DIR/continuwuity" ]] || fetch_latest_continuwuity
  [[ -f "$ELEMENT_DIR/current/index.html" ]] || fetch_latest_element

  sync_repo_assets
  systemctl daemon-reload
  start_services

  ss -ltnp | rg -n ':80|:443|:6167' || true
  curl -fsS "https://$DOMAIN/" >/dev/null
  curl -fsS "https://$DOMAIN/_matrix/client/versions" >/dev/null
  log "repair complete"
}

usage() {
  cat <<EOF
Usage: $0 {install|upgrade|remove|repair}

Commands:
  install  Create folders, fetch binaries, install configs/services, and start stack
  upgrade  Stop services, upgrade binaries/web, preserve DB/config, restart stack
  remove   Remove services and binaries but keep DB/backups
  repair   Fix perms, re-fetch missing binaries, restart and validate stack
EOF
}

main() {
  local cmd="${1:-}"
  case "$cmd" in
    install) install_all ;;
    upgrade) upgrade_all ;;
    remove) remove_all ;;
    repair) repair_all ;;
    *) usage; exit 1 ;;
  esac
}

main "$@"
