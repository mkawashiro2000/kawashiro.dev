---
title: "Telemetría de servidor en tiempo real con SSE y FastAPI"
description: "Por qué elegí Server-Sent Events sobre WebSockets para transmitir CPU, RAM y temperatura en vivo desde una Raspberry Pi al navegador."
pubDate: 2026-07-22
tags: ["fastapi", "sse", "python", "telemetria"]
---

El modo terminal de este sitio tiene un comando `htop` que muestra la CPU, RAM y temperatura del SoC **reales** de la Raspberry Pi que sirve la página, actualizándose cada 1.5 segundos. Así funciona, y por qué es SSE en lugar de WebSockets.

## SSE vs WebSockets

La telemetría es estrictamente unidireccional: servidor → navegador. Eso descarta la mayor parte de lo que ofrecen los WebSockets y convierte a **Server-Sent Events** en la herramienta más simple:

- HTTP plano — atraviesa nginx, Cloudflare y proxies corporativos sin tratamiento especial.
- Reconexión automática integrada en la API `EventSource`.
- Sin handshake de upgrade, sin contabilidad de ping/pong, sin librerías en ningún extremo.

## El backend

FastAPI + `sse-starlette`, en ~30 líneas:

```python
async def hardware_telemetry_generator(request: Request):
    while True:
        if await request.is_disconnected():
            break
        yield {
            "event": "telemetry",
            "data": json.dumps({
                "cpu_usage": psutil.cpu_percent(interval=None),
                "ram_usage": psutil.virtual_memory().percent,
                "soc_temp": soc_temperature(),
            }),
        }
        await asyncio.sleep(1.5)
```

Dos detalles importan más de lo que parece:

1. **`request.is_disconnected()`** — sin él, cada visitante que cierra la pestaña deja un generador zombi en bucle infinito.
2. **`json.dumps`** — `sse-starlette` hace `str()` de un dict de Python sin quejarse, produciendo pseudo-JSON con comillas simples que `JSON.parse` rechaza. Lo aprendí publicando el bug.

La temperatura del SoC viene directo del kernel: `/sys/class/thermal/thermal_zone0/temp`, legible incluso dentro de un contenedor porque el kernel es compartido.

## El frontend

Un `EventSource` con recreación manual ante fallo definitivo:

```ts
const es = new EventSource('/api/v1/telemetry');
es.addEventListener('telemetry', (e) => {
  setMetrics(JSON.parse(e.data));
});
es.onerror = () => {
  if (es.readyState === EventSource.CLOSED) {
    setTimeout(connect, 3000); // reconstruir la conexión
  }
};
```

`EventSource` reintenta los errores transitorios por sí solo; el timer solo hace falta para cuando el navegador se rinde del todo.

## nginx en el medio

El SSE muere en silencio detrás de una configuración de proxy por defecto. Las tres líneas que importan:

```nginx
proxy_buffering off;
proxy_read_timeout 24h;
proxy_set_header Connection '';
```

Con eso, el stream fluye desde una computadora de placa única de 60 € a través del edge de Cloudflare hasta cualquier navegador del mundo — sin polling, sin infraestructura de WebSockets, sin servicios de terceros.
