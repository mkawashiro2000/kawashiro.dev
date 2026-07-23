---
title: "Real-time server telemetry with SSE and FastAPI"
description: "Why I chose Server-Sent Events over WebSockets to stream live CPU, RAM and temperature from a Raspberry Pi to the browser."
pubDate: 2026-07-22
tags: ["fastapi", "sse", "python", "telemetry"]
---

The terminal mode of this site has an `htop` command that shows the **real** CPU, RAM and SoC temperature of the Raspberry Pi serving the page, updating every 1.5 seconds. Here's how it works and why it's SSE instead of WebSockets.

## SSE vs WebSockets

Telemetry is strictly one-directional: server → browser. That rules out most of what WebSockets offer and makes **Server-Sent Events** the simpler tool:

- Plain HTTP — passes through nginx, Cloudflare and corporate proxies without special treatment.
- Automatic reconnection built into the `EventSource` API.
- No handshake upgrade, no ping/pong bookkeeping, no library on either end.

## The backend

FastAPI + `sse-starlette`, in ~30 lines:

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

Two details matter more than they look:

1. **`request.is_disconnected()`** — without it, every visitor who closes the tab leaves a zombie generator looping forever.
2. **`json.dumps`** — `sse-starlette` will happily `str()` a Python dict, producing single-quoted pseudo-JSON that `JSON.parse` rejects. I learned this by shipping the bug.

The SoC temperature comes straight from the kernel: `/sys/class/thermal/thermal_zone0/temp`, readable even inside a container because the kernel is shared.

## The frontend

An `EventSource` with manual re-creation on hard failure:

```ts
const es = new EventSource('/api/v1/telemetry');
es.addEventListener('telemetry', (e) => {
  setMetrics(JSON.parse(e.data));
});
es.onerror = () => {
  if (es.readyState === EventSource.CLOSED) {
    setTimeout(connect, 3000); // rebuild the connection
  }
};
```

`EventSource` retries transient errors by itself; you only need the timer for the case where the browser gives up entirely.

## nginx in the middle

SSE dies silently behind a default proxy config. The three lines that matter:

```nginx
proxy_buffering off;
proxy_read_timeout 24h;
proxy_set_header Connection '';
```

With that, the stream flows from a €60 single-board computer through Cloudflare's edge to any browser in the world — no polling, no WebSocket infrastructure, no third-party service.
