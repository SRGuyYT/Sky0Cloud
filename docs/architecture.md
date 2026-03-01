# Sky0Cloud Architecture

```text
                         Internet
                             |
                     Cloudflare (Full Strict)
                             |
                     sky0cloud.dpdns.org
                             |
                     +----------------+
                     |     Caddy      |
                     | TLS + Routing  |
                     +----------------+
                     |      |         \
          /.well-known|      |/_matrix  \ /
                     |      |            \
                 static   Conduwuit     Element Web
                  files    Matrix API    Client UI
                     \      |             /
                      \     |            /
                    config_data   conduwuit_data + media_data
```

## Component responsibilities

- **Caddy**: HTTPS, security headers, request size limits, routing for `.well-known`, Matrix API, and runtime config alias.
- **Conduwuit**: Matrix homeserver, data persistence, federation/registration logic.
- **Element Web**: User-facing web app, custom dark theme and welcome page.
- **scripts/**: Operational lifecycle, safeguards, backup/restore, health checks.
- **config_data volume**: Durable runtime copy of `config.sky0cloud.dpdns.org.json`.
