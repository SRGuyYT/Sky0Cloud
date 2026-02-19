# Sky0Cloud Bare-Metal Migration Guide

This migration removes Docker and deploys the full stack natively under `/opt/skyserver` using `systemd`.

## 1) Target folder structure

```text
/opt/skyserver/
 ├── continuwuity/
 ├── element/
 ├── caddy/
 ├── portal/
 ├── scripts/
 └── backups/
```

Ownership for all files:

```bash
sudo chown -R skyserver:skyserver /opt/skyserver
```

## 2) Install prerequisites

```bash
sudo apt update
sudo apt install -y caddy python3 curl jq ca-certificates
```

> Google Analytics must be injected via Cloudflare Zaraz using property `G-2V9ZFLQQSD`. No local GA script injection is needed.

## 3) Install stack

```bash
cd /path/to/this/repo/baremetal/scripts
sudo ./skyserver.sh install
```

This will:
- create directories
- fetch latest Continuwuity and Element Web
- install configs
- install/start systemd services

## 4) Upgrade stack

```bash
sudo ./skyserver.sh upgrade
```

## 5) Repair stack

```bash
sudo ./skyserver.sh repair
```

## 6) Remove runtime (keep DB/backups)

```bash
sudo ./skyserver.sh remove
```

## 7) Admin permission grant from Element

1. Open **Element** as your user.
2. Go to a room with server admin bot capabilities (or use Element Devtools).
3. Send this command using your admin bridge/tooling:

```text
/admin make_user_admin @YOUR_USER:sky0cloud.dpdns.org
```

If using backend admin API/CLI, equivalent action is to set `admin = true` for your MXID.

## 8) Auto-join rooms

Configured in `baremetal/continuwuity/config.toml`:
- `#info:sky0cloud.dpdns.org`
- `#idk:sky0cloud.dpdns.org`
- `!0FP8Rnybqr2M8o4kPr:sky0cloud.dpdns.org`
- `!rbqTJXu2gXnXw1Dy86:sky0cloud.dpdns.org`

## 9) Registration policy

Token-only registration with:

```text
only_us
```

Guests remain disabled.

## 10) Reboot persistence checks

```bash
sudo systemctl enable sky-continuwuity sky-element sky-caddy
sudo systemctl status sky-continuwuity sky-element sky-caddy
```

## 11) Cloudflare SSL mode

Set Cloudflare SSL/TLS mode to **Full (strict)**.

Ensure DNS proxy is enabled for `sky0cloud.dpdns.org` and origin certificate chain is valid.
