---
title: "Sirviendo mi portafolio desde una Raspberry Pi con Cloudflare Tunnel"
description: "Cómo kawashiro.dev corre en una Raspberry Pi 4 en Constanza sin un solo puerto abierto, usando Docker, nginx y Cloudflare Zero Trust."
pubDate: 2026-07-22
tags: ["raspberry-pi", "cloudflare", "self-hosting", "docker"]
---

La mayoría de los portafolios viven en Vercel o Netlify. El mío vive en una **Raspberry Pi 4 en Constanza, República Dominicana** — y si ejecutas `htop` en el modo terminal de este sitio, estás leyendo la CPU y RAM reales de esa Pi en ese preciso instante.

## ¿Por qué self-hosting?

Porque el portafolio *es* el proyecto. Cualquiera puede hacer `git push` a un PaaS. Diseñar un pequeño sistema de producción — reverse proxy, servicios en contenedores, TLS, DNS, monitoreo — y mantenerlo vivo en tu propio hardware te enseña el lado operacional que los tutoriales se saltan. Además, es una mejor historia en las entrevistas.

## La arquitectura

Tres contenedores, una red interna de Docker:

```
[Cloudflare Edge] ⇄ cloudflared (túnel)
                        │
                        ▼
                  nginx (frontend)  ── build estático de Astro
                        │ /api/*
                        ▼
                  FastAPI (edge-api) ── telemetría, clima, guestbook
```

- **nginx** sirve el build estático de Astro y hace proxy de `/api/*` al backend.
- **FastAPI** expone Server-Sent Events con métricas reales del host (`psutil` + `/sys/class/thermal`).
- **cloudflared** mantiene cuatro conexiones salientes hacia el edge de Cloudflare. El tráfico entrante viaja de regreso por esas conexiones.

## Cero puertos abiertos

El router de la Pi **no tiene ni un solo port forwarding**. El túnel es únicamente saliente: `cloudflared` marca hacia Cloudflare, se autentica con un token, y Cloudflare enruta el tráfico de `kawashiro.dev` por esa tubería. Escanear los puertos de mi IP de casa no encuentra nada que atacar.

El TLS es automático — los dominios `.dev` están precargados con HSTS, y Cloudflare termina HTTPS en el edge.

## Problemas con los que me topé

1. **DNS de los contenedores.** Mi host usa AdGuard Home como resolver local-only, inaccesible desde los contenedores. Tanto `cloudflared` como la API necesitaron `dns: [1.1.1.1]` explícito en el compose — sin eso, el túnel moría al arrancar con un registro SRV irresoluble.
2. **Wheels de ARM64.** `psutil` 5.x no publicaba wheels aarch64, así que la imagen necesitaba gcc solo para compilarlo. Subir a 7.x trajo wheels precompilados y me dejó eliminar todo el toolchain de la imagen.
3. **SSE a través de proxies.** Los Server-Sent Events necesitan `proxy_buffering off` y un `proxy_read_timeout` largo en nginx, o el stream muere en silencio.

## El resultado

Un portafolio que también es una demo viva: telemetría real, clima real de la ubicación física del servidor, un guestbook persistido en SQLite dentro de la Pi — todo servido desde hardware que puedo tocar con las manos, con la postura de seguridad de un despliegue en la nube.
