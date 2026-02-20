# Sky0Cloud Matrix Server

Docker-based Matrix stack for `sky0cloud.dpdns.org` using:
- Continuwuity (homeserver)
- Element Web (client)
- Caddy (reverse proxy)

## Deployment

```bash
docker compose up -d
```

## Current defaults

- Guest access disabled
- Registration token required: `only_us`
- Caddy configured for Cloudflare real-IP forwarding (`CF-Connecting-IP`)
- iOS/PWA welcome page with language selector + client download bar
