import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';

export const TerminalApp: React.FC = () => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([
    'kawashiro.dev [Version 1.0.0-beta]',
    'Sistemas Homelab activos sobre Raspberry Pi OS Lite.',
    'Escribe "help" para desplegar la matriz de comandos.',
    ''
  ]);
  
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const toggleMode = useAppStore((state) => state.toggleMode);

  const executeCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const commandLine = input.trim();
    if (!commandLine) return;

    // Tokenización básica: Comando principal y argumentos
    const tokens = commandLine.split(' ');
    const baseCommand = tokens[0].toLowerCase();
    const args = tokens.slice(1);

    let output: string[] = [`$ ${commandLine}`];

    switch (baseCommand) {
      case 'help':
        output.push(
          'Comandos disponibles:',
          '  help        - Desplegar este menú de ayuda estructurado.',
          '  clear       - Limpiar el búfer del DOM de la terminal.',
          '  casual      - Interrumpir Modo PRO y transicionar a Business UI.',
          '  about       - Desplegar metadatos profesionales del desarrollador.',
          '  neofetch    - Inspeccionar telemetría estática de la arquitectura.'
        );
        break;
      case 'clear':
        setHistory([]);
        setInput('');
        return;
      case 'casual':
        output.push('Sincronizando estado global... Transicionando a Business UI.');
        setHistory([...history, ...output]);
        setTimeout(() => {
          document.documentElement.classList.remove('pro-theme');
          toggleMode();
        }, 500);
        setInput('');
        return;
      case 'about':
        output.push(
          'Mitsunori Kawashiro Batista',
          '--------------------------',
          'Perfil: Full Stack Developer, Software Engineer & Emprendedor.',
          'Core: Python (FastAPI), AWS, Docker, Next.js, TypeScript.',
          'Proyectos Activos: Lex32 (Facturación Fiscal), AgroBalance.'
        );
        break;
      case 'neofetch':
        output.push(
          'mk@kawashiro.dev',
          '----------------',
          'OS: Raspberry Pi OS Lite (Debian Bookworm)',
          'Kernel: Linux 6.1.0-v8-16k aarch64',
          'Uptime: 14 days, 2 hours, 43 mins',
          'Shell: zsh (simulado / react-island)',
          'Terminal: WebUSB Terminal v4',
          'CPU: BCM2712 (ARM Cortex-A76 @ 2.4GHz)',
          'Memory: 4096MB / 8192MB (50%)'
        );
        break;
      default:
        output.push(`sys: comando no encontrado: "${baseCommand}". Escribe "help".`);
    }

    setHistory([...history, ...output, '']);
    setInput('');
  };

  // Auto-scroll al final del búfer con cada comando inyectado
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  return (
    <div className="w-full max-w-4xl mx-auto bg-[var(--color-bg-secondary)] border border-[var(--color-text-muted)] rounded-lg shadow-2xl p-4 font-mono text-sm min-h-[450px] flex flex-col justify-between relative overflow-hidden animate-crt-flicker">
      
      {/* Capa de Máscara Física del Monitor CRT (Scanlines de baja intensidad) */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%]"></div>
      
      <div className="flex-1 overflow-y-auto pr-2 z-10">
        {history.map((line, index) => (
          <div key={index} className="leading-relaxed min-h-[1.2rem]">
            {line.startsWith('$') ? (
              <span>
                <span className="text-[var(--color-text-accent)]">➜ </span>
                <span className="text-[var(--color-text-main)] font-bold">{line}</span>
              </span>
            ) : (
              <span className="text-[var(--color-text-main)] opacity-90">{line}</span>
            )}
          </div>
        ))}
        <div ref={terminalEndRef} />
      </div>

      <form onSubmit={executeCommand} className="flex items-center gap-2 mt-4 pt-2 border-t border-[var(--color-text-muted)] border-opacity-30 z-10">
        <span className="text-[var(--color-text-accent)] font-bold">➜ ~</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-[var(--color-text-main)] font-mono caret-[var(--color-text-accent)] focus:ring-0 p-0"
          autoFocus
          placeholder="Escribe un comando..."
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />
      </form>
    </div>
  );
};
