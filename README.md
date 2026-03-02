---

# Sky0Cloud

Sky0Cloud is a self-hosted, privacy-focused Matrix server using **Tuwunel** (Construct-based), with **Element-Web** as the frontend, fully proxied via **Caddy**. It is designed to run on modest hardware and supports federation with other Matrix servers.

---

## 🔹 Features

* Fully open registration (optional token-based protection)
* Guest accounts allowed
* Auto-join rooms for all new users
* Optimized for HDD/SSD and 8GB RAM
* Federation-ready with trusted servers
* Custom Element-Web branding (Sky0Cloud theme)
* HTTPS with automatic Caddy reverse proxy
* Logs, read receipts, typing notifications, and presence enabled
* Media handling optimized for safety and performance

---

## 🔹 Architecture

```
Element-Web <--> Caddy <--> Tuwunel
       ^                     ^
       |                     |
   Web Browser          Matrix Federation
```

---

## 🔹 Prerequisites

* Docker & Docker Compose
* At least 8GB RAM
* HDD or SSD (config optimized for spinning disks)
* Public domain with DNS configured

---

## 🔹 Docker Compose Overview

* **Tuwunel**: Matrix server backend
* **Element-Web**: Web frontend
* **Caddy**: HTTPS, reverse proxy, and `.well-known` handling
* Internal Docker network for secure container communication

---

## 🔹 Setup Instructions

1. Clone the repository:

```bash
git clone https://github.com/SRGuyYT/Sky0Cloud.git
cd Sky0Cloud
```

2. Edit configuration files if needed.

3. Start containers:

```bash
docker-compose up -d
```

4. Access your server via browser:

```
https://your-domain.example/ (**NOTE: This is made for sky0cloud.dpdns.org. Your might be trying to go to ours!)**
```

5. The first registered user automatically becomes admin and creates the admin room.

---

## 🔹 Configuration Details

* **Tuwunel Config (`tuwunel.toml`)**: Handles server identity, networking, registration, federation, database, RocksDB, presence, typing/read receipts, and logging.
* **Element-Web Config (`config.json`, `manifest.json`)**: Custom branding, theme, server defaults, and PWA install identity (name/icon).
* **Caddyfile**: Reverse proxy setup for HTTPS, Matrix API/media routing (`/_matrix`, `/_synapse/client`), web UI routing (`/` and `/element/`), `.well-known` discovery, and security headers.

---

## 🔹 Notes

* **Data migration**: If moving from an old Conduwuit instance, copy the data directory into the Tuwunel volume before starting the container.
* **Security**: Only enable open registration if needed; otherwise, use a strong registration token or disable registration entirely.
* **Backups**: Regularly back up the Tuwunel data volume.
* **Performance tuning**: Adjust `cache_capacity_modifier`, RocksDB settings, and `db_pool_workers` according to your hardware.

---

## 🔹 Branding / Web UI

* Login background: `background.jpg`

* Auth header logo: `icon.png`
* Branding deep-dive: `docs/BRANDING.md`

* Footer links:

  * Privacy: `https://sky0cloud.dpdns.org/#/404`
  * Help: `https://sky0cloud.dpdns.org/#/404`
  * Access Code?: `https://github.com/SRGuyYT/Sky0Cloud/blob/main/README.md`

* Default theme: dark

* Guests and 3rd-party ID login disabled

* Base URL redirects to `https://sky0cloud.dpdns.org/#/login`

* Breadcrumbs, timestamps, and read receipts enabled

---

## 🔹 Federation / Well-Known

* `.well-known/matrix/client` points to your homeserver and identity server URLs.
* `.well-known/matrix/server` defines the federation server for other homeservers.
* Trusted servers include `matrix.org` and your own domain (`sky0cloud.dpdns.org`).
* `itoldyou` Sky0Cloud Access Code

---

## 🔹 Contact / Help

* GitHub: [SRGuyYT/Sky0Cloud](https://github.com/SRGuyYT/Sky0Cloud)
* Matrix: srguyyt@sky0cloud.dpdns.org
* Support Email: [official@no-reply.skyservers.qzz.io](mailto:official@no-reply.skyservers.qzz.io)

---

## 🔹 License

Sky0Cloud is open-source and provided under the MIT License.

---
