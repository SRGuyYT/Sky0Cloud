# Sky0Cloud

Sky0Cloud is a production-focused, self-hosted Matrix stack using Conduwuit-compatible backend + Element Web behind Caddy on **`sky0cloud.dpdns.org`**.

## Architecture (ASCII)

```text
Internet -> Cloudflare (Full Strict) -> Caddy
                                      |-- /.well-known/matrix/* (static)
                                      |-- /config.sky0cloud.dpdns.org.json (runtime config volume)
                                      |-- /_matrix/* -> Conduwuit
                                      `-- / -> Element Web

Persistent volumes:
- conduwuit_data: database
- media_data: media files
- config_data: runtime config alias
```

## Quick start

```bash
cp .env.example .env
bash scripts/install.sh
```

Then open:

- `https://sky0cloud.dpdns.org`
- `https://sky0cloud.dpdns.org/welcome.html`
- `https://sky0cloud.dpdns.org/config.sky0cloud.dpdns.org.json`

## Critical config alias guarantee

`config.sky0cloud.dpdns.org.json` is guaranteed by **two independent mechanisms**:

1. `scripts/ensure-config.sh` creates `/data/config.sky0cloud.dpdns.org.json` from `config/default.config.json` if missing.
2. `config_data` named volume persists `/data` and is mounted to:
   - `conduwuit` as `/data`
   - `caddy` as `/srv/runtime`

Additionally, Conduwuit entrypoint runs the same check at container startup as a last-resort safeguard.

## Scripts

- `scripts/install.sh` install and first start
- `scripts/update.sh` pull + rolling restart
- `scripts/repair.sh` regenerate config + force recreate
- `scripts/reinstall.sh` prompt-driven reinstall
- `scripts/wipe-database.sh` destructive DB-only wipe
- `scripts/wipe-media.sh` media wipe with avatar/profile preservation (supports `DRY_RUN=1`)
- `scripts/backup.sh` volume snapshot backup
- `scripts/restore.sh` restore from backup archive
- `scripts/logs.sh` compose log tailing
- `scripts/healthcheck.sh` endpoint checks
- `scripts/generate-secrets.sh` local Docker secret generation

## Security model

- Non-sensitive defaults in `.env`.
- Registration token stored in Docker secret file (`secrets/registration_token.txt`) generated locally.
- No committed plaintext secrets.
- Containers run with `no-new-privileges` and restart policies.

## Production hardening checklist

- Keep Cloudflare SSL mode at **Full (Strict)**.
- Restrict inbound ports to `80/443` only.
- Rotate `secrets/registration_token.txt` periodically.
- Enable host firewall (ufw/nftables) and fail2ban.
- Push backups off-host and set retention (e.g. 7 daily + 4 weekly + 6 monthly).
- Consider object storage + external DB for larger deployments.

## Troubleshooting

- `permission denied /var/run/docker.sock`: run scripts with `sudo`.
- image pull denied: verify registry access and set `CONDUWUIT_IMAGE` in `.env` if needed.
- missing config alias: run `bash scripts/ensure-config.sh` in a container context or `bash scripts/repair.sh`.

## Observability suggestions

- Use `docker compose logs -f` or `bash scripts/logs.sh`.
- Export container metrics with cAdvisor + Prometheus.
- Build Grafana dashboards for CPU, memory, and container restart counts.

## Exec format + permission hardening

This repository enforces LF line endings for shell scripts and Dockerfiles via `.gitattributes`, and both container images run `dos2unix` + `chmod` on entrypoints during image build to prevent `exec format error` / `no such file or directory` failures caused by CRLF or missing executable bits.

`no-new-privileges` was removed from runtime services that execute init wrappers so startup scripts can complete reliably. Keep host hardening with least-open ports, read-only bind mounts where possible, and Docker secrets for sensitive values.
