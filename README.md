# Sky0Cloud

Dockerized Matrix stack for `sky0cloud.dpdns.org` using:

<<<<<<< ours
- **Conduwuit-compatible homeserver container** (default image: `matrixconduit/matrix-conduit:latest`)
- **Element Web** client (custom skin entrypoint)
=======
- **Tuwunel** homeserver backend (Conduwuit-compatible)
- **Element Web** client (custom skin + custom welcome page)
>>>>>>> theirs
- **Caddy** reverse proxy (single-domain routing)

## Quick start

1. Update `caddy/Caddyfile` and `conduwuit/conduwuit.toml` if needed.
<<<<<<< ours
2. (Optional) override homeserver image if you have access to a private Conduwuit registry image:

```bash
export CONDUWUIT_IMAGE=ghcr.io/girlbossceo/conduwuit:latest
=======
2. (Optional) override homeserver image if needed:

```bash
export TUWUNEL_IMAGE=ghcr.io/tuwunel/tuwunel:latest
>>>>>>> theirs
```

3. Start the stack:

```bash
sudo docker compose pull
sudo docker compose up -d
```

<<<<<<< ours
4. Verify endpoints:

- `https://sky0cloud.dpdns.org` → Element Web
- `https://sky0cloud.dpdns.org/_matrix/*` → Conduwuit API
- `https://sky0cloud.dpdns.org/.well-known/matrix/server`
- `https://sky0cloud.dpdns.org/.well-known/matrix/client`

## Fixes included from deployment feedback

- Removed deprecated Compose `version` key (eliminates warning on modern Docker Compose).
- Switched default homeserver image away from GHCR-private path to a publicly pullable default.
- Kept image override support via `CONDUWUIT_IMAGE` for environments that have GHCR access.

=======
## Cloudflare + Caddy notes (redirect-loop safe)

- Use **Cloudflare SSL mode: Full (Strict)**.
- Caddy is pinned to explicit `:80` and `:443` site blocks.
- Port 80 only redirects once to HTTPS, and HTTPS serves Matrix + Element routes.

## Welcome page + branding

- `element/welcome.html` is mounted to `/app/welcome.html` and used by Element via `welcome_url`.
- Rotating hero background logic uses `new Date().getHours() % backgrounds.length`.
- `element/icon.png` is mounted to `/app/icon.png` and used for:
  - welcome card logo,
  - browser favicon,
  - Apple touch icon metadata.

## Verify endpoints

- `https://sky0cloud.dpdns.org` → Element Web
- `https://sky0cloud.dpdns.org/welcome.html` → Sky0Cloud welcome portal
- `https://sky0cloud.dpdns.org/_matrix/*` → Tuwunel API
- `https://sky0cloud.dpdns.org/.well-known/matrix/server`
- `https://sky0cloud.dpdns.org/.well-known/matrix/client`

>>>>>>> theirs
## Files

- `docker-compose.yml` - service wiring and persistence
- `caddy/Caddyfile` - reverse proxy, TLS, Matrix routing
- `conduwuit/conduwuit.toml` - homeserver config with registration token
- `element/config.json` - Element Web client configuration
<<<<<<< ours
- `element/sky0cloud-theme.css` - initial dark/glassmorphism overrides
=======
- `element/sky0cloud-theme.css` - dark/glassmorphism overrides
- `element/welcome.html` - rotating glassmorphism welcome page
- `element/icon.png` - app icon, favicon, welcome logo
>>>>>>> theirs
