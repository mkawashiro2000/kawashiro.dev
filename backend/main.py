import asyncio
import json
import re
import psutil
import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse

from sentiment_dict import POSITIVE_WORDS, NEGATIVE_WORDS

app = FastAPI(title="Kawashiro Edge API - Telemetry")

# Restricción CORS: Permitir acceso local en desarrollo.
# En producción, esto será filtrado por el túnel de Cloudflare.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
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
            # json.dumps es imprescindible: sse-starlette haría str() del dict,
            # produciendo comillas simples que JSON.parse rechaza en el navegador.
            "data": json.dumps({
                "cpu_usage": psutil.cpu_percent(interval=None),
                "ram_usage": psutil.virtual_memory().percent,
                "ram_used_mb": round(psutil.virtual_memory().used / (1024 * 1024)),
                "uptime": f"{int(hours)}h {int(minutes)}m",
            }),
        }
        
        # Frecuencia de actualización: 1.5 segundos para equilibrar fluidez visual y carga térmica
        await asyncio.sleep(1.5)

@app.get("/api/v1/telemetry")
async def stream_telemetry(request: Request):
    return EventSourceResponse(hardware_telemetry_generator(request))

@app.get("/health")
async def health_check():
    return {"status": "operational", "layer": "edge-api"}


class SentimentRequest(BaseModel):
    text: str


WORD_PATTERN = re.compile(r"[a-záéíóúñü]+", re.IGNORECASE)


@app.post("/api/v1/sentiment")
async def analyze_sentiment(payload: SentimentRequest):
    """
    Análisis de sentimiento basado en diccionario léxico (positivo/negativo).
    Cuenta coincidencias en el texto y determina la polaridad dominante.
    """
    words = [w.lower() for w in WORD_PATTERN.findall(payload.text)]

    positive_matches = [w for w in words if w in POSITIVE_WORDS]
    negative_matches = [w for w in words if w in NEGATIVE_WORDS]

    pos_count = len(positive_matches)
    neg_count = len(negative_matches)
    sentiment_total = pos_count + neg_count

    if pos_count > neg_count:
        verdict = "positivo"
    elif neg_count > pos_count:
        verdict = "negativo"
    else:
        verdict = "neutral"

    # Porcentajes relativos a las palabras con carga emocional detectadas
    # (no al total del texto, ya que la mayoría de palabras son neutras).
    positive_pct = round(pos_count / sentiment_total * 100, 1) if sentiment_total else 0.0
    negative_pct = round(neg_count / sentiment_total * 100, 1) if sentiment_total else 0.0

    return {
        "verdict": verdict,
        "positive_count": pos_count,
        "negative_count": neg_count,
        "positive_percentage": positive_pct,
        "negative_percentage": negative_pct,
        "positive_words": positive_matches,
        "negative_words": negative_matches,
        "word_count": len(words),
        "sentiment_word_count": sentiment_total,
    }
