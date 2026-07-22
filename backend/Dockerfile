# Base minimalista para mitigar superficie de ataque y peso
FROM python:3.11-slim

WORKDIR /app

# Sin toolchain de compilación: psutil 5.9.8 publica wheels manylinux aarch64,
# así que la imagen final no necesita gcc (menos peso, menos superficie).
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Principio de mínimo privilegio: el servicio corre como usuario sin shell.
# /data es el punto de montaje del volumen del guestbook (propiedad de edgeapi).
RUN useradd --system --no-create-home --shell /usr/sbin/nologin edgeapi && \
    mkdir -p /data && chown edgeapi:edgeapi /data
USER edgeapi

# Exponer el puerto del microservicio
EXPOSE 8000

# Exec form: PID 1 hereda directamente el proceso, permitiendo apagados limpios
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
