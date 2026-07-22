#!/usr/bin/env bash
# watchdog.sh — vigila la salud del sitio y avisa por ntfy.sh al cambiar de estado.
# Suscríbete al topic en el móvil: app ntfy -> subscribe -> kawashiro-pi-alerts
# Nota: si la Pi entera se apaga, este script no puede avisar (para eso,
# añade un monitor externo tipo UptimeRobot apuntando a https://kawashiro.dev).
set -u

NTFY_TOPIC="kawashiro-pi-alerts"
STATE_FILE=/tmp/kawashiro-watchdog.state

check() {
  # 1) nginx local sirviendo el sitio
  curl -sf --max-time 10 "http://localhost:8181/" -o /dev/null && \
  # 2) edge-api sano según el healthcheck de Docker
  [ "$(docker inspect -f '{{.State.Health.Status}}' kawashiro_edge_api 2>/dev/null)" = "healthy" ] && \
  # 3) sitio público a través del túnel de Cloudflare (IP fija del proxy CF)
  curl -sf --max-time 15 --resolve kawashiro.dev:443:104.21.82.199 "https://kawashiro.dev/" -o /dev/null
}

notify() {
  curl -sf --max-time 10 \
    -H "Title: kawashiro.dev" \
    -H "Priority: $2" \
    -H "Tags: $3" \
    -d "$1" \
    "https://ntfy.sh/$NTFY_TOPIC" >/dev/null 2>&1 || true
}

PREV=$(cat "$STATE_FILE" 2>/dev/null || echo "up")

if check; then
  STATE="up"
  if [ "$PREV" = "down" ]; then
    notify "El sitio volvió a estar en línea ✅" default white_check_mark
  fi
else
  STATE="down"
  if [ "$PREV" = "up" ]; then
    notify "kawashiro.dev no responde (túnel o contenedores caídos)" high rotating_light
  fi
fi

echo "$STATE" >"$STATE_FILE"
