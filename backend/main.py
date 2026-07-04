import asyncio
import psutil
import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse

app = FastAPI(title="Kawashiro Edge API - Telemetry")

# Restricción CORS: Permitir acceso local en desarrollo. 
# En producción, esto será filtrado por el túnel de Cloudflare.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["GET"],
)

# Almacenar el tiempo de arranque del proceso
BOOT_TIME = time.time()

async def hardware_telemetry_generator(request: Request):
    """
    Generador asíncrono que extrae métricas del SoC BCM2712 (u otros ARM)
    y las despacha mediante Server-Sent Events (SSE).
    """
    while True:
        # Validación crítica: Suspender emisión si el cliente abandona la conexión TCP
        if await request.is_disconnected():
            break
        
        uptime_seconds = time.time() - BOOT_TIME
        hours, remainder = divmod(uptime_seconds, 3600)
        minutes, _ = divmod(remainder, 60)
        
        yield {
            "event": "telemetry",
            "data": {
                "cpu_usage": psutil.cpu_percent(interval=None),
                "ram_usage": psutil.virtual_memory().percent,
                "ram_used_mb": round(psutil.virtual_memory().used / (1024 * 1024)),
                "uptime": f"{int(hours)}h {int(minutes)}m",
            }
        }
        
        # Frecuencia de actualización: 1.5 segundos para equilibrar fluidez visual y carga térmica
        await asyncio.sleep(1.5)

@app.get("/api/v1/telemetry")
async def stream_telemetry(request: Request):
    return EventSourceResponse(hardware_telemetry_generator(request))

@app.get("/health")
async def health_check():
    return {"status": "operational", "layer": "edge-api"}
