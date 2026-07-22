#!/usr/bin/env bash
# backup.sh — respaldo diario de lo que NO vive en git:
#   .env (token del túnel), guestbook.db (volumen), configuración nginx/compose.
# Retiene 14 días en /home/server/backups/kawashiro.
# Para respaldo fuera de la Pi (recomendado): sincroniza ese directorio con
# rclone hacia B2/R2/Drive — ver scripts/README.md.
set -euo pipefail

REPO=/home/server/kawashiro.dev
DEST=/home/server/backups/kawashiro
STAMP=$(date +%Y%m%d)
WORK=$(mktemp -d)

mkdir -p "$DEST"

# Copia del guestbook desde el volumen del contenedor (sin detenerlo)
docker cp kawashiro_edge_api:/data/guestbook.db "$WORK/guestbook.db" 2>/dev/null || true

cp "$REPO/.env" "$WORK/.env" 2>/dev/null || true
cp "$REPO/docker-compose.yml" "$REPO/nginx.conf" "$WORK/" 2>/dev/null || true

tar -czf "$DEST/kawashiro-$STAMP.tar.gz" -C "$WORK" .
rm -rf "$WORK"

# Rotación: conservar los últimos 14 archivos
ls -1t "$DEST"/kawashiro-*.tar.gz 2>/dev/null | tail -n +15 | xargs -r rm --

echo "[$(date -Is)] Backup OK: $DEST/kawashiro-$STAMP.tar.gz"
