# Sky0Cloud Matrix Server

Docker-based Matrix stack for `sky0cloud.dpdns.org` using:
- Continuwuity (homeserver)
- Element Web (client)
- Caddy (reverse proxy)

- Guest access: disabled
- Registration: enabled with token `only_us`
- Auto-join rooms:
  - `!0FP8Rnybqr2M8o4kPr:sky0cloud.dpdns.org`
  - `!rbqTJXu2gXnXw1Dy86:sky0cloud.dpdns.org`

```bash
docker compose up -d
```

## Current defaults

- Guest access disabled
- Registration token required: `only_us`
- Caddy configured for Cloudflare real-IP forwarding (`CF-Connecting-IP`)
- iOS/PWA welcome page with language selector + client download bar
