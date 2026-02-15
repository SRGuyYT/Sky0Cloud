# Sky0Cloud Matrix Server

A high-performance, custom-branded Matrix homeserver setup powered by Conduwuit and Element Web, reverse-proxied with Caddy.

## Overview
This repository contains the configuration and branding assets for the Sky0Cloud Matrix instance. It features a custom "Welcome" landing page integrated directly into the Element Web interface, bypassing standard iframe restrictions for a seamless user experience.

## Tech Stack
* Homeserver: Conduwuit (High-performance Rust implementation)
* Web Client: Element Web
* Reverse Proxy: Caddy
* Custom Branding: HTML5, CSS3, and Vanilla JavaScript

## Custom Branding and Iframe Fixes
The project uses a custom welcome screen located in branding/welcome/. 

### Key Features:
* CSP-Compliant: All JavaScript is externalized to welcome.js to satisfy strict Content Security Policies and prevent inline script blocking.
* Sandbox Breakout: Uses native HTML anchor tags with target="_parent" to allow Login and Sign-up buttons to navigate the top-level window from within the Element iframe.
* Automated Guest Access: Includes a robust guest token flow with verbose console logging for real-time debugging of the Matrix API handshake.

## Deployment

### Prerequisites
* Docker and Docker Compose
* A domain pointed at your server (e.g., sky0cloud.dpdns.org)

### Installation
1. Clone the repository:
   git clone https://github.com/SRGuyYT/Sky0Cloud.git
   cd Sky0Cloud

2. Configuration:
   Ensure your config.json and docker-compose.yml paths match your local environment.

3. Launch:
   docker compose up -d

## Security Note
Private data, including the Matrix database (db/), server configurations (conduwuit/), and .env files, are explicitly excluded from this repository via .gitignore to protect server integrity and user privacy.

---
Maintained by SRGuyYT
