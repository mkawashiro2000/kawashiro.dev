# Scripts de operación

| Script | Cron sugerido | Qué hace |
|---|---|---|
| `autodeploy.sh` | `*/5 * * * *` | Si `origin/main` tiene commits nuevos, hace pull + rebuild de los contenedores. Log en `logs/autodeploy.log`. |
| `watchdog.sh` | `*/5 * * * *` | Comprueba nginx local y el sitio público vía túnel; notifica cambios de estado por [ntfy.sh](https://ntfy.sh) (topic `kawashiro-pi-alerts`). |
| `backup.sh` | `0 3 * * *` | Respalda `.env`, `guestbook.db` y configs a `/home/server/backups/kawashiro` (retención: 14 días). |

## Alertas en el móvil (ntfy)

1. Instala la app **ntfy** (Android/iOS).
2. Subscribe → topic: `kawashiro-pi-alerts`.
3. Listo: recibirás push cuando el sitio caiga o se recupere.

> El watchdog corre EN la Pi: si la Pi entera pierde corriente, no puede avisar.
> Complemento recomendado (2 min): cuenta gratis en [UptimeRobot](https://uptimerobot.com)
> monitoreando `https://kawashiro.dev` cada 5 min con alerta por email.

## Respaldo fuera de la Pi (recomendado)

El backup local no sobrevive a una SD muerta. Con una cuenta gratuita de
Cloudflare R2 o Backblaze B2 (10 GB gratis):

```bash
sudo apt install rclone
rclone config           # crear remote "b2" (o "r2")
# añadir al cron, después del backup diario:
# 15 3 * * * rclone sync /home/server/backups/kawashiro b2:kawashiro-backups
```
