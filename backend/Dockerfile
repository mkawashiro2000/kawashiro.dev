# Base minimalista para mitigar superficie de ataque y peso
FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias del sistema requeridas para compilar psutil en arquitectura ARM64
RUN apt-get update && \
    apt-get install -y gcc python3-dev && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Exponer el puerto del microservicio
EXPOSE 8000

# Exec form: PID 1 hereda directamente el proceso, permitiendo apagados limpios
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
