# Sky0Cloud Element Branding Guide

This project uses Element Web's runtime config and static assets mounted via Docker.

## 1) `config.json` branding

Edit `element/config.json`:

```json
{
  "brand": "Sky0Cloud",
  "branding": {
    "welcome_background_url": "background.jpg",
    "auth_header_logo_url": "icon.png"
  }
}
```

## 2) `manifest.json` (PWA install name + icon)

Edit `element/manifest.json`:

```json
{
  "name": "Sky0Cloud",
  "short_name": "Sky0Cloud",
  "start_url": "/#/login",
  "icons": [
    { "src": "icon.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icon.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

## 3) `index.html` snippet (tab title + favicon)

If you manage your own custom `index.html`, ensure it contains:

```html
<title>Sky0Cloud</title>
<link rel="manifest" href="manifest.json" />
<link rel="icon" type="image/png" href="icon.png" />
<link rel="apple-touch-icon" href="icon.png" />
<meta name="application-name" content="Sky0Cloud" />
<meta name="apple-mobile-web-app-title" content="Sky0Cloud" />
```

> Note: the stock `vectorim/element-web` image already includes an `index.html`. In this repo we override branding via `config.json` + `manifest.json` mounts, which is enough for most deployments.

## Apply changes

```bash
docker compose up -d --force-recreate element-web caddy
```

Then hard refresh browser and clear old site data/service worker if the old PWA name/icon still appears.
