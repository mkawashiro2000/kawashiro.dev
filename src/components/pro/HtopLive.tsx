import React, { useState, useEffect } from 'react';

export const HtopLive: React.FC = () => {
  const [metrics, setMetrics] = useState({
    cpu: 0,
    ram_percent: 0,
    ram_mb: 0,
    uptime: '0h 0m',
    soc_temp: null as number | null,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Conexión unidireccional al backend mediante ruta relativa.
    // - En dev: el proxy de Vite reenvía /api -> http://localhost:8000 (ver astro.config.mjs).
    // - En prod: nginx reenvía /api -> edge-api:8000, protegido por el túnel Cloudflare.
    let eventSource: EventSource | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let disposed = false;

    const connect = () => {
      if (disposed) return;
      eventSource = new EventSource('/api/v1/telemetry');

      eventSource.addEventListener('telemetry', (event) => {
        try {
          const data = JSON.parse((event as MessageEvent).data);
          setMetrics({
            cpu: data.cpu_usage,
            ram_percent: data.ram_usage,
            ram_mb: data.ram_used_mb,
            uptime: data.uptime,
            soc_temp: data.soc_temp ?? null,
          });
          // Con datos frescos, cualquier aviso de reconexión queda obsoleto
          setError(null);
        } catch (err) {
          console.error("Error parseando telemetría:", err);
        }
      });

      // EventSource reintenta solo mientras la conexión no esté CLOSED; si el
      // navegador la cerró definitivamente, la recreamos nosotros en 3s.
      eventSource.onerror = () => {
        setError("Conexión con Edge API interrumpida. Reintentando...");
        if (eventSource?.readyState === EventSource.CLOSED) {
          retryTimer = setTimeout(connect, 3000);
        }
      };
    };

    connect();

    // Cleanup crítico: Cierra la conexión si el componente se desmonta o la terminal se limpia
    return () => {
      disposed = true;
      if (retryTimer) clearTimeout(retryTimer);
      eventSource?.close();
    };
  }, []);

  // Utilidad para generar la barra ASCII: [||||||||  ]
  const renderAsciiBar = (percent: number, width: number = 20) => {
    const filledChars = Math.round((percent / 100) * width);
    const emptyChars = width - filledChars;
    const colorClass = percent > 85 ? 'text-red-500' : percent > 60 ? 'text-yellow-400' : 'text-[var(--color-text-main)]';
    
    return (
      <span>
        [<span className={colorClass}>{'|'.repeat(Math.max(0, filledChars))}</span>
        <span className="opacity-30">{'.'.repeat(Math.max(0, emptyChars))}</span>]
      </span>
    );
  };

  return (
    <div className="py-2 border border-dashed border-[var(--color-text-muted)] p-4 my-2 bg-black bg-opacity-20 rounded">
      <div className="text-[var(--color-text-accent)] font-bold mb-2">EDGE NODE HEALTH (BCM2711 - ARM64)</div>
      {error && <div className="text-red-500 font-bold mb-2">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="flex justify-between w-64">
            <span>CPU </span>
            <span>{metrics.cpu.toFixed(1).padStart(4, '0')}%</span>
          </div>
          <div>{renderAsciiBar(metrics.cpu)}</div>
        </div>
        
        <div>
          <div className="flex justify-between w-64">
            <span>MEM </span>
            <span>{metrics.ram_mb}MB / 8192MB</span>
          </div>
          <div>{renderAsciiBar(metrics.ram_percent)}</div>
        </div>
      </div>
      <div className="mt-3 text-xs opacity-70">
        {metrics.soc_temp !== null && (
          <span className={metrics.soc_temp > 70 ? 'text-red-500' : metrics.soc_temp > 60 ? 'text-yellow-400' : ''}>
            SoC: {metrics.soc_temp}°C
          </span>
        )}
        {metrics.soc_temp !== null && ' · '}
        Uptime del microservicio: {metrics.uptime}
      </div>
    </div>
  );
};
