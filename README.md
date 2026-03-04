# Sky0Cloud Matrix Stack

Production-oriented Matrix stack for **sky0cloud.dpdns.org** using:
- **Tuwunel** (homeserver)
- **Caddy** (reverse proxy + `.well-known`)
- **Element Web** (served from local bind mount)

## 1) Directory Layout

All runtime data is consolidated in `~/Sky0Cloud` with bind mounts:

```text
~/Sky0Cloud/
├── docker-compose.yml
├── Caddyfile
├── .env
├── .gitignore
├── tuwunel/
│   └── tuwunel.toml
├── tuwunel_data/        # DB + media content
└── element/
    └── config.json      # Element branding + homeserver target
```

## 2) Host Preparation (Ubuntu/Debian)

Install official Docker Engine from Apt:

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo \"$VERSION_CODENAME\") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker "$USER"
```

Log out/in once after adding yourself to the `docker` group.

## 3) Start / Stop Operations

From `~/Sky0Cloud`:

```bash
docker compose pull
docker compose up -d
```

Check health/logs:

```bash
docker compose ps
docker compose logs -f tuwunel
docker compose logs -f caddy
```

Stop stack:

```bash
docker compose down
```

Restart after config changes:

```bash
docker compose up -d --force-recreate
```

## 4) Notes on HDD Optimization

- `database_path = "/data"` matches bind mount `./tuwunel_data:/data` to avoid media/DB path mismatch issues.
- Tuwunel RocksDB options are tuned for spinning disks.
- Worker and cache values are sized for Ryzen 3 + 8GB RAM while leaving room for OS file cache.

## 5) Element Web Content

Caddy serves Element from `./element`. Ensure `index.html` and static assets exist there (official Element build output), with this repo-managed `element/config.json` for branding/homeserver defaults.

## 6) Security / Maintenance

- Keep `.env` private.
- Back up `./tuwunel_data` regularly.
- Use a strong registration policy/token in production.
