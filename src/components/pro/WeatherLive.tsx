import React, { useState, useEffect } from 'react';

/**
 * WeatherLive — clima real de Constanza vía el edge-api (Open-Meteo).
 * Refuerza la narrativa: el servidor vive en un lugar real con clima real.
 */

interface Weather {
  temp_c: number;
  feels_like_c: number;
  humidity: number;
  wind_kmh: number;
  weather_code: number;
  location: string;
  error?: string;
}

const TEAL = '#94e2d5';
const TEXT = '#cdd6f4';
const FAINT = '#6c7086';
const RED = '#f38ba8';

/** Mapa WMO weather_code → descripción + arte. */
function describe(code: number): { icon: string; label: string } {
  if (code === 0) return { icon: '☀️', label: 'Clear sky' };
  if (code <= 2) return { icon: '⛅', label: 'Partly cloudy' };
  if (code === 3) return { icon: '☁️', label: 'Overcast' };
  if (code === 45 || code === 48) return { icon: '🌫️', label: 'Fog' };
  if (code <= 57) return { icon: '🌦️', label: 'Drizzle' };
  if (code <= 67) return { icon: '🌧️', label: 'Rain' };
  if (code <= 77) return { icon: '🌨️', label: 'Snow (¡en Constanza pasa!)' };
  if (code <= 82) return { icon: '🌦️', label: 'Showers' };
  return { icon: '⛈️', label: 'Thunderstorm' };
}

export const WeatherLive: React.FC = () => {
  const [w, setW] = useState<Weather | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch('/api/v1/weather')
      .then((r) => r.json())
      .then((data) => (data.error ? setFailed(true) : setW(data)))
      .catch(() => setFailed(true));
  }, []);

  if (failed) return <div style={{ color: RED }}>weather: upstream service unavailable.</div>;
  if (!w) return <div style={{ color: FAINT }}>Fetching data from Open-Meteo...</div>;

  const { icon, label } = describe(w.weather_code);

  return (
    <div className="my-1 border border-dashed rounded p-3 inline-block" style={{ borderColor: FAINT }}>
      <div style={{ color: TEAL }} className="font-bold">
        {icon} {w.location} — {label}
      </div>
      <div style={{ color: TEXT }}>
        temp: {w.temp_c}°C (feels {w.feels_like_c}°C) · humidity: {w.humidity}% · wind: {w.wind_kmh} km/h
      </div>
      <div style={{ color: FAINT }} className="text-xs mt-1">
        source: open-meteo.com · cached 10m on the edge node
      </div>
    </div>
  );
};
