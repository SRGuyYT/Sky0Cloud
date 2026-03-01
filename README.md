# Sky0Cloud

Dockerized Matrix stack for `sky0cloud.dpdns.org` using:

- **Conduwuit** homeserver
- **Element Web** client (custom skin entrypoint)
- **Caddy** reverse proxy (single-domain routing)

## Quick start

1. Update `caddy/Caddyfile` and `conduwuit/conduwuit.toml` if needed.
2. Start the stack:

```bash
docker compose up -d
```

3. Verify endpoints:

- `https://sky0cloud.dpdns.org` → Element Web
- `https://sky0cloud.dpdns.org/_matrix/*` → Conduwuit API
- `https://sky0cloud.dpdns.org/.well-known/matrix/server`
- `https://sky0cloud.dpdns.org/.well-known/matrix/client`

## Files

- `docker-compose.yml` - service wiring and persistence
- `caddy/Caddyfile` - reverse proxy, TLS, Matrix routing
- `conduwuit/conduwuit.toml` - homeserver config with registration token
- `element/config.json` - Element Web client configuration
- `element/sky0cloud-theme.css` - initial dark/glassmorphism overrides
