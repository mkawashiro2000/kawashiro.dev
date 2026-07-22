# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Etapa 1: Compilación de las islas de Astro/React (payload estático).
# Node 22 es requerido por Astro 7 (>=22.12.0).
# ---------------------------------------------------------------------------
FROM node:26-slim AS builder
WORKDIR /app

# Instalación determinista a partir del lockfile para builds reproducibles.
COPY package.json package-lock.json ./
RUN npm ci

# Compilamos el sitio estático hacia /app/dist.
COPY . .
RUN npm run build

# ---------------------------------------------------------------------------
# Etapa 2: Servido estático de alto rendimiento con nginx (imagen efímera).
# ---------------------------------------------------------------------------
FROM nginx:1.27-alpine AS runner

# Configuración: sirve el sitio y reenvía /api (SSE) al microservicio edge-api.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Solo transferimos el artefacto compilado; el toolchain de Node queda descartado.
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# Exec form: nginx hereda el PID 1 para apagados limpios (graceful shutdown).
CMD ["nginx", "-g", "daemon off;"]
