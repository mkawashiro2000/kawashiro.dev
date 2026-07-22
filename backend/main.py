import asyncio
import json
import os
import platform
import re
import sqlite3
import threading
import urllib.request
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


def soc_temperature() -> float | None:
    """Temperatura del SoC en °C leída del árbol térmico del kernel (host compartido)."""
    try:
        with open("/sys/class/thermal/thermal_zone0/temp") as f:
            return round(int(f.read().strip()) / 1000, 1)
    except (OSError, ValueError):
        return None


def _format_duration(seconds: float) -> str:
    days, remainder = divmod(int(seconds), 86400)
    hours, remainder = divmod(remainder, 3600)
    minutes, _ = divmod(remainder, 60)
    if days:
        return f"{days}d {hours}h {minutes}m"
    return f"{hours}h {minutes}m"


def _pi_model() -> str:
    """Modelo del hardware desde /proc/cpuinfo (visible en el contenedor: kernel compartido)."""
    try:
        with open("/proc/cpuinfo") as f:
            for line in f:
                if line.startswith("Model"):
                    return line.split(":", 1)[1].strip()
    except OSError:
        pass
    return "ARM64 host"

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
                "soc_temp": soc_temperature(),
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


@app.get("/api/v1/sysinfo")
async def system_info():
    """Snapshot estático del host real para el comando `neofetch` de la terminal."""
    mem = psutil.virtual_memory()
    return {
        "model": _pi_model(),
        "kernel": f"Linux {platform.release()} {platform.machine()}",
        "host_uptime": _format_duration(time.time() - psutil.boot_time()),
        "service_uptime": _format_duration(time.time() - BOOT_TIME),
        "mem_used_mb": round(mem.used / (1024 * 1024)),
        "mem_total_mb": round(mem.total / (1024 * 1024)),
        "cpu_count": psutil.cpu_count(),
        "soc_temp": soc_temperature(),
        "load_avg": round(psutil.getloadavg()[0], 2),
    }


# --- Clima real de Constanza (Open-Meteo, sin API key) --------------------
CONSTANZA_LAT, CONSTANZA_LON = 18.909, -70.617
_weather_cache: dict = {"ts": 0.0, "data": None}
WEATHER_TTL = 600  # 10 minutos: Open-Meteo agradece no ser martillado


def _fetch_weather() -> dict:
    url = (
        "https://api.open-meteo.com/v1/forecast"
        f"?latitude={CONSTANZA_LAT}&longitude={CONSTANZA_LON}"
        "&current=temperature_2m,relative_humidity_2m,apparent_temperature,"
        "weather_code,wind_speed_10m&timezone=America%2FSanto_Domingo"
    )
    with urllib.request.urlopen(url, timeout=8) as resp:
        return json.loads(resp.read())


@app.get("/api/v1/weather")
async def weather():
    """Clima actual en Constanza para el comando `weather`, con caché de 10 min."""
    now = time.time()
    if _weather_cache["data"] is None or now - _weather_cache["ts"] > WEATHER_TTL:
        try:
            raw = await asyncio.to_thread(_fetch_weather)
            cur = raw["current"]
            _weather_cache["data"] = {
                "temp_c": cur["temperature_2m"],
                "feels_like_c": cur["apparent_temperature"],
                "humidity": cur["relative_humidity_2m"],
                "wind_kmh": cur["wind_speed_10m"],
                "weather_code": cur["weather_code"],
                "location": "Constanza, Dominican Republic",
            }
            _weather_cache["ts"] = now
        except Exception:
            if _weather_cache["data"] is None:
                return {"error": "weather-unavailable"}
    return _weather_cache["data"]


# --- Guestbook: libro de visitas persistente (SQLite en volumen /data) ------
GUESTBOOK_DB = os.environ.get("GUESTBOOK_DB", "/data/guestbook.db")
_db_lock = threading.Lock()
_gb_last_post: dict[str, float] = {}  # rate limit en memoria por IP

# Caracteres imprimibles únicamente; colapsa espacios repetidos
_SANITIZE_RE = re.compile(r"[\x00-\x1f\x7f]")


def _gb_conn() -> sqlite3.Connection:
    os.makedirs(os.path.dirname(GUESTBOOK_DB), exist_ok=True)
    conn = sqlite3.connect(GUESTBOOK_DB)
    conn.execute(
        "CREATE TABLE IF NOT EXISTS entries ("
        " id INTEGER PRIMARY KEY AUTOINCREMENT,"
        " name TEXT NOT NULL,"
        " message TEXT NOT NULL,"
        " ts INTEGER NOT NULL)"
    )
    return conn


class GuestbookEntry(BaseModel):
    name: str = "visitor"
    message: str


@app.get("/api/v1/guestbook")
async def guestbook_list():
    def read():
        with _db_lock, _gb_conn() as conn:
            rows = conn.execute(
                "SELECT name, message, ts FROM entries ORDER BY id DESC LIMIT 20"
            ).fetchall()
        return [{"name": n, "message": m, "ts": ts} for n, m, ts in rows]

    return {"entries": await asyncio.to_thread(read)}


@app.post("/api/v1/guestbook")
async def guestbook_sign(payload: GuestbookEntry, request: Request):
    ip = (request.headers.get("x-forwarded-for") or (request.client.host if request.client else "?")).split(",")[0].strip()

    # Rate limit: una firma por IP por minuto
    now = time.time()
    if now - _gb_last_post.get(ip, 0) < 60:
        return {"error": "rate-limited", "detail": "One signature per minute. Patience, traveler."}

    name = _SANITIZE_RE.sub("", payload.name).strip()[:24] or "visitor"
    message = " ".join(_SANITIZE_RE.sub("", payload.message).split())[:140]
    if len(message) < 2:
        return {"error": "too-short", "detail": "Message must have at least 2 characters."}

    def write():
        with _db_lock, _gb_conn() as conn:
            conn.execute(
                "INSERT INTO entries (name, message, ts) VALUES (?, ?, ?)",
                (name, message, int(now)),
            )
            # Retener solo las últimas 500 firmas
            conn.execute(
                "DELETE FROM entries WHERE id NOT IN (SELECT id FROM entries ORDER BY id DESC LIMIT 500)"
            )

    await asyncio.to_thread(write)
    _gb_last_post[ip] = now
    return {"ok": True, "name": name, "message": message}


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
