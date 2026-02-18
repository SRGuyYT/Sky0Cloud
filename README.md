# Sky0Cloud Matrix Server

Sky0Cloud now includes a production-ready **bare-metal deployment bundle** (no Docker required) for:
- Continuwuity (homeserver)
- Element Web (frontend)
- Caddy (reverse proxy)
- Custom Sky0Cloud portal + PWA

## Bare-metal deployment assets

All migration assets are in [`baremetal/`](baremetal):

- `baremetal/scripts/skyserver.sh` – master install/upgrade/remove/repair control script
- `baremetal/systemd/*.service` – native systemd unit files
- `baremetal/caddy/Caddyfile` – Cloudflare-aware reverse proxy config
- `baremetal/continuwuity/config.toml` – homeserver config with token registration + auto-join
- `baremetal/element/config.json` – Element config
- `baremetal/portal/*` – custom portal (`index.html`, `manifest.json`, `sw.js`)
- `baremetal/docs/BAREMETAL_MIGRATION.md` – setup + operations instructions

## Security and policy defaults

- Guest access: disabled
- Registration: enabled with token `only_us`
- Auto-join rooms:
  - `#info:sky0cloud.dpdns.org`
  - `#idk:sky0cloud.dpdns.org`
  - `!0FP8Rnybqr2M8o4kPr:sky0cloud.dpdns.org`
  - `!rbqTJXu2gXnXw1Dy86:sky0cloud.dpdns.org`

## Legacy Docker

Docker files are retained only for historical reference. Stable deployment target is bare-metal + systemd.
