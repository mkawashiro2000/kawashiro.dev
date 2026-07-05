// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// Configuración del ecosistema Dual-Mode.
// - React: islas interactivas (client:load) para la Terminal UI.
// - Tailwind v4: motor CSS-first cargado como plugin de Vite (@import "tailwindcss").
export default defineConfig({
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    server: {
      // En desarrollo, reenvía la telemetría SSE al microservicio FastAPI.
      // El cliente usa la ruta relativa /api/v1/telemetry (ver HtopLive.tsx).
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
        },
      },
    },
  },
});
