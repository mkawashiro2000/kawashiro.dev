#!/usr/bin/env bash
# autodeploy.sh — despliegue continuo por polling (cron cada 5 min).
# Si origin/main tiene commits nuevos: pull --ff-only + rebuild de contenedores.
set -euo pipefail

REPO=/home/server/kawashiro.dev
LOG=/home/server/kawashiro.dev/logs/autodeploy.log
LOCK=/tmp/kawashiro-autodeploy.lock

mkdir -p "$(dirname "$LOG")"
exec 9>"$LOCK"
flock -n 9 || exit 0  # otro deploy en curso: salir en silencio

cd "$REPO"
git fetch origin main --quiet

LOCAL=$(git rev-parse main)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" = "$REMOTE" ]; then
  exit 0
fi

{
  echo "[$(date -Is)] Deploying $LOCAL -> $REMOTE"
  git merge --ff-only origin/main
  docker compose up -d --build frontend edge-api
  echo "[$(date -Is)] Deploy OK ($(git rev-parse --short main))"
} >>"$LOG" 2>&1
