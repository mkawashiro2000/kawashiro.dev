---
title: "Serving my portfolio from a Raspberry Pi with Cloudflare Tunnel"
description: "How kawashiro.dev runs on a Raspberry Pi 4 in Constanza with zero open ports, using Docker, nginx and Cloudflare Zero Trust."
pubDate: 2026-07-22
tags: ["raspberry-pi", "cloudflare", "self-hosting", "docker"]
---

Most portfolios live on Vercel or Netlify. Mine lives on a **Raspberry Pi 4 sitting in Constanza, Dominican Republic** — and if you run `htop` in the terminal mode of this site, you're reading that Pi's real CPU and RAM at that exact moment.

## Why self-host?

Because the portfolio *is* the project. Anyone can `git push` to a PaaS. Designing a small production system — reverse proxy, containerized services, TLS, DNS, monitoring — and keeping it alive on your own hardware teaches you the operational side that tutorials skip. It also makes for a better story in interviews.

## The architecture

Three containers, one internal Docker network:

```
[Cloudflare Edge] ⇄ cloudflared (tunnel)
                        │
                        ▼
                  nginx (frontend)  ── static Astro build
                        │ /api/*
                        ▼
                  FastAPI (edge-api) ── telemetry, weather, guestbook
```

- **nginx** serves the static Astro build and proxies `/api/*` to the backend.
- **FastAPI** exposes Server-Sent Events with live host metrics (`psutil` + `/sys/class/thermal`).
- **cloudflared** keeps four outbound connections to Cloudflare's edge. Inbound traffic rides those connections back.

## Zero open ports

The Pi's router has **no port forwarding at all**. The tunnel is outbound-only: `cloudflared` dials out to Cloudflare, authenticates with a token, and Cloudflare routes `kawashiro.dev` traffic through that pipe. Port scanning my home IP finds nothing to attack.

TLS is automatic — `.dev` domains are HSTS-preloaded, and Cloudflare terminates HTTPS at the edge.

## Gotchas I hit

1. **Container DNS.** My host runs AdGuard Home as a local-only resolver, which containers can't reach. Both `cloudflared` and the API needed explicit `dns: [1.1.1.1]` in the compose file — otherwise the tunnel died on boot with an unresolvable SRV record.
2. **ARM64 wheels.** `psutil` 5.x shipped no aarch64 wheels, so the image needed gcc just to build it. Bumping to 7.x got prebuilt wheels and let me drop the whole toolchain from the image.
3. **SSE through proxies.** Server-Sent Events need `proxy_buffering off` and a long `proxy_read_timeout` in nginx, or the stream silently dies.

## The result

A portfolio that is also a living demo: real telemetry, real weather from the server's actual location, a guestbook persisted in SQLite on the Pi — all served from hardware I can physically touch, with the security posture of a cloud deployment.
