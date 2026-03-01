# Sky0Cloud

Dockerized Matrix stack for `sky0cloud.dpdns.org` using:

- **Conduwuit-compatible homeserver container** (default image: `matrixconduit/matrix-conduit:latest`)
- **Element Web** client (custom skin entrypoint)
- **Caddy** reverse proxy (single-domain routing)

## Quick start

1. Update `caddy/Caddyfile` and `conduwuit/conduwuit.toml` if needed.
2. (Optional) override homeserver image if you have access to a private Conduwuit registry image:

```bash
export CONDUWUIT_IMAGE=ghcr.io/girlbossceo/conduwuit:latest
```

3. Start the stack:

```bash
sudo docker compose pull
sudo docker compose up -d
```

4. Verify endpoints:

- `https://sky0cloud.dpdns.org` → Element Web
- `https://sky0cloud.dpdns.org/_matrix/*` → Conduwuit API
- `https://sky0cloud.dpdns.org/.well-known/matrix/server`
- `https://sky0cloud.dpdns.org/.well-known/matrix/client`

## Fixes included from deployment feedback

- Removed deprecated Compose `version` key (eliminates warning on modern Docker Compose).
- Switched default homeserver image away from GHCR-private path to a publicly pullable default.
- Kept image override support via `CONDUWUIT_IMAGE` for environments that have GHCR access.

## Files

- `docker-compose.yml` - service wiring and persistence
- `caddy/Caddyfile` - reverse proxy, TLS, Matrix routing
- `conduwuit/conduwuit.toml` - homeserver config with registration token
- `element/config.json` - Element Web client configuration
- `element/sky0cloud-theme.css` - initial dark/glassmorphism overrides
