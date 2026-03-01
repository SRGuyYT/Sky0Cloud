# Sky0Cloud

Dockerized Matrix stack for `sky0cloud.dpdns.org` using:

- **Tuwunel** homeserver backend (Conduwuit-compatible)
- **Element Web** client (custom skin + custom welcome page)
- **Caddy** reverse proxy (single-domain routing)

## Quick start

1. Update `caddy/Caddyfile` and `conduwuit/conduwuit.toml` if needed.
2. Start the stack:

```bash
sudo docker compose pull
sudo docker compose up -d
Cloudflare + Caddy notes (redirect-loop safe)
Use Cloudflare SSL mode: Full (Strict).

Caddy is pinned to explicit :80 and :443 site blocks to prevent infinite redirect loops.

Welcome page + branding
element/welcome.html: Mounted to /app/welcome.html.

Dynamic Backgrounds: Rotating hero background logic uses new Date().getHours() % backgrounds.length.

element/icon.png: Mounted to /app/icon.png and used for welcome card logo, browser favicon, and Apple touch icon metadata.

Verify endpoints
https://sky0cloud.dpdns.org → Element Web UI

https://sky0cloud.dpdns.org/welcome.html → Sky0Cloud Custom Portal

https://sky0cloud.dpdns.org/_matrix/static/ → Tuwunel Status Page

Files
docker-compose.yml - service wiring and persistence

caddy/Caddyfile - reverse proxy and Matrix routing

conduwuit/conduwuit.toml - homeserver config

element/config.json - Element Web branding

element/welcome.html - The rotating glassmorphism page

element/icon.png - The master logo asset


---

### 🚀 Finalizing the Repo
Now that you have fixed the **Docker Compose** and the **README**, tell Git that you have resolved the mess:

```bash
cd ~/Sky0Cloud
git add .
git commit -m "Final cleanup: Removed merge conflicts and updated documentation"
git push
