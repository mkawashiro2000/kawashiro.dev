import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Trie } from '../../terminal/utils/trie';
import { HtopLive } from './HtopLive';
import { printResumeToThermal } from '../../terminal/utils/webusb';
import { DgiiSignerMock } from './DgiiSignerMock';

export const TerminalApp: React.FC = () => {
  const [input, setInput] = useState('');
  
  // El historial soporta texto estricto y nodos de React para HtopLive y DgiiSignerMock
  const [history, setHistory] = useState<(string | React.ReactNode)[]>([
    'kawashiro.dev [Version 1.0.0-beta]',
    'Sistemas Homelab activos sobre Raspberry Pi OS Lite.',
    'Escribe "help" para desplegar la matriz de comandos.',
    ''
  ]);
  
  const [historyPointer, setHistoryPointer] = useState<number>(-1);
  const commandArchive = useRef<string[]>([]);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const toggleMode = useAppStore((state) => state.toggleMode);

  // Inicialización estricta del árbol Trie con todo el léxico permitido
  const commandTrie = useMemo(() => {
    const trie = new Trie();
    ['help', 'clear', 'casual', 'about', 'neofetch', 'htop', 'print resume', 'cat dgii-xml-signer.md'].forEach(cmd => trie.insert(cmd));
    return trie;
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const currentInput = input.trim().toLowerCase();
      if (!currentInput) return;

      const completions = commandTrie.findCompletions(currentInput);
      
      if (completions.length === 1) {
        setInput(completions[0]);
      } else if (completions.length > 1) {
        setHistory(prev => [...prev, `$ ${input}`, completions.join('    ')]);
      }
    } 
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandArchive.current.length === 0) return;
      const newPointer = historyPointer === -1 
        ? commandArchive.current.length - 1 
        : Math.max(0, historyPointer - 1);
      setHistoryPointer(newPointer);
      setInput(commandArchive.current[newPointer]);
    } 
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyPointer === -1) return;
      const newPointer = historyPointer + 1;
      if (newPointer >= commandArchive.current.length) {
        setHistoryPointer(-1);
        setInput('');
      } else {
        setHistoryPointer(newPointer);
        setInput(commandArchive.current[newPointer]);
      }
    }
  };

  const executeCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const commandLine = input.trim();
    if (!commandLine) return;

    commandArchive.current.push(commandLine);
    setHistoryPointer(-1);

    const tokens = commandLine.split(' ');
    const baseCommand = tokens[0].toLowerCase();
    const args = tokens.slice(1);
    const fullCommand = commandLine.toLowerCase();

    let output: (string | React.ReactNode)[] = [`$ ${commandLine}`];

    if (fullCommand === 'print resume') {
       output.push('Inicializando protocolo ESC/POS vía WebUSB...', 'Esperando intercepción de seguridad del navegador...');
       
       // Sincronizamos el historial actual antes de despachar la promesa de hardware
       setHistory([...history, ...output]);
       setInput('');
       
       // Invocamos la utilidad WebUSB pasando una función callback
       printResumeToThermal((msg) => {
         setHistory(prev => [...prev, msg]);
       });
       return; 
    } else {
      switch (baseCommand) {
        case 'help':
          output.push(
            'Comandos disponibles:',
            '  help          - Desplegar este menú de ayuda estructurado.',
            '  clear         - Limpiar el búfer del DOM de la terminal.',
            '  casual        - Interrumpir Modo PRO y transicionar a Business UI.',
            '  about         - Desplegar metadatos profesionales del desarrollador.',
            '  neofetch      - Inspeccionar telemetría estática de la arquitectura.',
            '  htop          - Iniciar flujo SSE para monitorización remota ARM64.',
            '  print resume  - [Hardware] Enviar CV a impresora térmica ESC/POS local.',
            '  cat [archivo] - Concatenar e imprimir archivos (ej. cat dgii-xml-signer.md)'
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
            'Perfil: Full Stack Developer, Data Scientist & Emprendedor',
            'Core: Python (FastAPI), AWS, Docker, Next.js, TypeScript.',
            'Proyectos Activos: Lex32 (Facturación Fiscal DGII), AgroBalance.'
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
        case 'htop':
          output.push('Abriendo canal asíncrono (Server-Sent Events) con el Edge Node...');
          output.push(<HtopLive key={`htop-${Date.now()}`} />);
          break;
        case 'cat':
          if (args[0] === 'dgii-xml-signer.md') {
            output.push('Leyendo archivo desde el volumen de almacenamiento...');
            output.push(<DgiiSignerMock key={`dgii-${Date.now()}`} />);
          } else if (args.length === 0) {
            output.push('cat: falta el operando de archivo. Ejemplo: cat dgii-xml-signer.md');
          } else {
            output.push(`cat: ${args.join(' ')}: No existe el archivo o el directorio`);
          }
          break;
        default:
          output.push(`sys: comando no encontrado: "${baseCommand}". Escribe "help".`);
      }
    }

    setHistory([...history, ...output, '']);
    setInput('');
  };

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  return (
    <div className="w-full max-w-4xl mx-auto bg-[var(--color-bg-secondary)] border border-[var(--color-text-muted)] rounded-lg shadow-2xl p-4 font-mono text-sm min-h-[450px] flex flex-col justify-between relative overflow-hidden animate-crt-flicker">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%]"></div>
      
      <div className="flex-1 overflow-y-auto pr-2 z-10">
        {history.map((line, index) => (
          <div key={index} className="leading-relaxed min-h-[1.2rem]">
            {typeof line === 'string' ? (
              line.startsWith('$') ? (
                <span>
                  <span className="text-[var(--color-text-accent)]">➜ </span>
                  <span className="text-[var(--color-text-main)] font-bold">{line}</span>
                </span>
              ) : (
                <span className="text-[var(--color-text-main)] opacity-90 whitespace-pre-wrap">{line}</span>
              )
            ) : (
              <div className="my-2">{line}</div>
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
          onKeyDown={handleKeyDown}
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
