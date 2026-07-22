import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { getTranslation } from '../../i18n/translations';
import { Trie } from '../../terminal/utils/trie';
import { HtopLive } from './HtopLive';
import { NeofetchLive } from './NeofetchLive';
import { WeatherLive } from './WeatherLive';
import { MatrixRain } from './MatrixRain';
import { CodeBlock } from './CodeBlock';
import { printResumeToThermal } from '../../terminal/utils/webusb';
import { openPrintableResume } from '../../terminal/utils/resume';
import { listProjects, catProject, resolveOpenTarget, PROJECT_FILES } from '../../terminal/utils/projects';

// Secuencia de arranque estilo systemd: puro teatro, pero teatro de calidad
const BOOT_SEQUENCE = [
  '[  OK  ] Reached target Basic System.',
  '[  OK  ] Mounted /dev/projects (virtual filesystem).',
  '[  OK  ] Started Telemetry Daemon (SSE, BCM2711).',
  '[  OK  ] Registered Cloudflare Tunnel (4 edge connections).',
  '[  OK  ] Started Guest Shell on tty1.',
  '',
];

export const TerminalApp: React.FC = () => {
  const [input, setInput] = useState('');
  const locale = useAppStore((state) => state.locale);
  const t = getTranslation(locale).terminal;

  // El historial soporta texto estricto y nodos de React para HtopLive
  const [history, setHistory] = useState<(string | React.ReactNode)[]>([]);

  const [historyPointer, setHistoryPointer] = useState<number>(-1);
  const [isMinimized, setIsMinimized] = useState(false);
  const [matrixActive, setMatrixActive] = useState(false);
  const [sessionUser, setSessionUser] = useState<'mk' | 'guest'>('mk');
  const commandArchive = useRef<string[]>([]);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const toggleMode = useAppStore((state) => state.toggleMode);

  // --- Efecto máquina de escribir: cola de líneas que se vuelcan una a una ---
  const lineQueue = useRef<(string | React.ReactNode)[]>([]);
  const draining = useRef(false);
  const drainQueue = () => {
    if (draining.current) return;
    draining.current = true;
    const step = () => {
      const next = lineQueue.current.shift();
      if (next === undefined) {
        draining.current = false;
        return;
      }
      setHistory((prev) => [...prev, next]);
      // Los nodos React (htop, neofetch...) entran al instante; el texto, cadencioso
      setTimeout(step, typeof next === 'string' ? 26 : 0);
    };
    step();
  };
  const queueLines = (lines: (string | React.ReactNode)[]) => {
    lineQueue.current.push(...lines);
    drainQueue();
  };

  // --- Secuencia de boot animada (una sola vez por montaje) ---
  const booted = useRef(false);
  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    const bootLines = [...BOOT_SEQUENCE, ...t.boot];
    bootLines.forEach((line, i) => {
      setTimeout(() => setHistory((prev) => [...prev, line]), 90 + i * 110);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🔴 Cerrar: salir del Modo PRO y volver a Business UI
  const handleClose = () => {
    if (document.fullscreenElement) document.exitFullscreen?.();
    document.documentElement.classList.remove('pro-theme');
    toggleMode();
  };

  // 🟢 Maximizar: fullscreen real del navegador (Fullscreen API)
  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    inputRef.current?.focus();
  };

  // 🟡 Minimizar: el navegador no puede minimizarse; simulamos "guardar al dock"
  const handleMinimize = () => setIsMinimized(true);
  const handleRestore = () => {
    setIsMinimized(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // Paleta realista (Catppuccin Mocha)
  const C = {
    base: '#1e1e2e',
    bar: '#181825',
    crust: '#11111b',
    text: '#cdd6f4',
    muted: '#a6adc8',
    faint: '#6c7086',
    green: '#a6e3a1',
    blue: '#89b4fa',
    mauve: '#cba6f7',
    red: '#f38ba8',
    yellow: '#f9e2af',
    teal: '#94e2d5',
  };

  // Prompt realista: mk@kawashiro:~$ (o guest@ durante la sesión ssh simulada)
  const Prompt = ({ user = sessionUser }: { user?: 'mk' | 'guest' }) => (
    <>
      <span style={{ color: user === 'guest' ? C.yellow : C.green }}>{user}@kawashiro</span>
      <span style={{ color: C.faint }}>:</span>
      <span style={{ color: C.blue }}>~</span>
      <span style={{ color: C.mauve }}> $ </span>
    </>
  );

  // Eco del comando: prefijo interno "$ " (mk) o "$G " (guest) para congelar
  // el prompt del usuario que lo ejecutó al re-renderizar el historial
  const promptEcho = (cmd: string) => `${sessionUser === 'guest' ? '$G ' : '$ '}${cmd}`;

  // Inicialización estricta del árbol Trie con todo el léxico permitido
  const commandTrie = useMemo(() => {
    const trie = new Trie();
    ['help', 'clear', 'casual', 'about', 'neofetch', 'htop', 'print resume', 'ls', 'weather', 'matrix', 'open', 'exit'].forEach(cmd => trie.insert(cmd));
    PROJECT_FILES.forEach(f => trie.insert(`cat ${f.filename}`));
    return trie;
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Atajos de terminal real: Ctrl+L limpia, Ctrl+C cancela la línea
    if (e.ctrlKey && (e.key === 'l' || e.key === 'L')) {
      e.preventDefault();
      lineQueue.current = [];
      setHistory([]);
      return;
    }
    if (e.ctrlKey && (e.key === 'c' || e.key === 'C')) {
      e.preventDefault();
      const echo = promptEcho(`${input}^C`);
      setHistory((prev) => [...prev, echo]);
      setInput('');
      setHistoryPointer(-1);
      return;
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      const currentInput = input.trim().toLowerCase();
      if (!currentInput) return;

      const completions = commandTrie.findCompletions(currentInput);
      
      if (completions.length === 1) {
        setInput(completions[0]);
      } else if (completions.length > 1) {
        setHistory(prev => [...prev, promptEcho(input), completions.join('    ')]);
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

    // Eco inmediato del comando; la salida entra con cadencia de typewriter
    setHistory((prev) => [...prev, promptEcho(commandLine)]);
    setInput('');

    const output: (string | React.ReactNode)[] = [];

    if (fullCommand === 'print resume usb') {
      // Ruta de hardware: impresora térmica ESC/POS vía WebUSB (easter egg)
      queueLines([t.printInit, t.printWaiting]);
      printResumeToThermal((msg) => {
        setHistory((prev) => [...prev, msg]);
      });
      return;
    } else if (fullCommand === 'print resume') {
      // Ruta universal: CV renderizado + diálogo de impresión del navegador
      output.push(t.printOpening);
      const opened = openPrintableResume(locale);
      output.push(opened ? t.printDone : t.printBlocked);
    } else if (baseCommand === 'sudo') {
      // Easter egg obligatorio: todo dev lo intenta tarde o temprano
      if (/^sudo\s+apt(-get)?\s+update\s*$/.test(fullCommand)) {
        // Abrir de inmediato: dentro del gesto del usuario (Enter) el navegador
        // no bloquea la pestaña; con setTimeout sí lo hacía.
        window.open('https://www.youtube.com/shorts/deosbgGLnVA', '_blank', 'noopener');
        output.push(
          'Hit:1 http://deb.debian.org/debian bookworm InRelease',
          'Get:2 http://archive.raspberrypi.com/debian bookworm InRelease [23.6 kB]',
          'Fetched 23.6 kB in 1s (18.4 kB/s)',
          'Reading package lists... Done',
          'W: An essential multimedia dependency was missing. Resolved. ▶',
        );
      } else if (/^sudo\s+rm\s+-[a-z]*r[a-z]*\s+\/\s*$/.test(fullCommand) || fullCommand.startsWith('sudo rm -rf /')) {
        output.push(
          'rm: descending into /home/mk/projects...',
          'rm: descending into /var/lib/dreams...',
          '[ABORTADO] Protective instincts engaged.',
          'Nice try. This incident will be reported to /dev/null. 🍓',
        );
      } else {
        output.push(`${sessionUser} is not in the sudoers file. This incident will be reported.`);
      }
    } else if (baseCommand === 'ssh') {
      // Sesión simulada: handshake teatral y prompt de invitado
      if (sessionUser === 'guest') {
        output.push('ssh: already connected as guest. Type "exit" first.');
      } else {
        output.push(
          'Resolving kawashiro.dev... 104.21.82.199',
          'Negotiating cipher (chacha20-poly1305@openssh.com)...',
          "guest@kawashiro.dev's password: ********",
          '',
          'Welcome to kawashiro.dev — restricted guest shell.',
          'Type "exit" to disconnect.',
        );
        setTimeout(() => setSessionUser('guest'), 400);
      }
    } else {
      switch (baseCommand) {
        case 'help':
          output.push(...t.helpLines);
          break;
        case 'clear':
          lineQueue.current = [];
          setHistory([]);
          return;
        case 'casual':
          queueLines([t.casualTransition]);
          setTimeout(() => {
            document.documentElement.classList.remove('pro-theme');
            toggleMode();
          }, 500);
          return;
        case 'exit':
          if (sessionUser === 'guest') {
            output.push('Connection to kawashiro.dev closed.');
            setSessionUser('mk');
          } else {
            // exit como mk = salir de la terminal (igual que casual)
            queueLines([t.casualTransition]);
            setTimeout(() => {
              document.documentElement.classList.remove('pro-theme');
              toggleMode();
            }, 500);
            return;
          }
          break;
        case 'about':
          output.push(...t.aboutLines);
          break;
        case 'neofetch':
          output.push(<NeofetchLive key={`nf-${Date.now()}`} />);
          break;
        case 'htop':
          output.push(t.htopOpening);
          output.push(<HtopLive key={`htop-${Date.now()}`} />);
          break;
        case 'weather':
          output.push(<WeatherLive key={`w-${Date.now()}`} />);
          break;
        case 'matrix':
          setMatrixActive(true);
          return;
        case 'open': {
          if (args.length === 0) {
            output.push(t.openUsage);
            break;
          }
          const target = resolveOpenTarget(args.join(' '));
          if (target) {
            window.open(target.url, '_blank', 'noopener');
            output.push(t.openDone(target.url));
          } else {
            output.push(t.openNotFound(args.join(' ')));
          }
          break;
        }
        case 'ls':
          output.push(...listProjects());
          break;
        case 'cat': {
          if (args.length === 0) {
            output.push(t.catMissingArg);
            break;
          }
          const file = catProject(args[0], locale);
          if (file) {
            output.push(...file.meta);
            output.push(<CodeBlock key={`code-${Date.now()}`} lines={file.code} />);
          } else {
            output.push(t.catNotFound(args.join(' ')));
          }
          break;
        }
        default:
          output.push(t.commandNotFound(baseCommand));
      }
    }

    queueLines([...output, '']);
  };

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // Color de las líneas de salida según su naturaleza (errores en rojo, etc.)
  const lineColor = (line: string): string => {
    if (/^(cat:|sys:|ssh:|rm:|.*no encontrado|.*No existe)/i.test(line)) return C.red;
    if (/^\[\s*OK\s*\]|completada|activos/i.test(line)) return C.green;
    if (/^\[ERROR\]|\[ABORTADO\]/i.test(line)) return C.red;
    if (/is not in the sudoers file/.test(line)) return C.red;
    if (/^-{3,}|^={3,}/.test(line)) return C.faint;
    return C.text;
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="relative w-full h-[100dvh] overflow-hidden"
      style={{ backgroundColor: C.crust }}
    >
      {/* Lluvia matrix a pantalla completa: cualquier tecla la disuelve */}
      {matrixActive && (
        <MatrixRain
          onExit={() => {
            setMatrixActive(false);
            queueLines(['[  OK  ] Reality restored.', '']);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
        />
      )}

      {/* Píldora del dock cuando la ventana está minimizada */}
      {isMinimized && (
        <button
          onClick={(e) => { e.stopPropagation(); handleRestore(); }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl font-mono text-sm animate-[fadeUp_0.3s_ease-out]"
          style={{ backgroundColor: C.bar, color: C.text, border: `1px solid ${C.crust}` }}
        >
          <span className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#ff5f57' }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#febc2e' }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#28c840' }} />
          </span>
          mk@kawashiro.dev — -zsh
          <span style={{ color: C.faint }}>{t.dockRestoreHint}</span>
        </button>
      )}

      <div
        className="w-full h-full flex flex-col overflow-hidden font-mono text-[13px] sm:text-sm transition-all duration-500 ease-in-out"
        style={{
          backgroundColor: C.base,
          transform: isMinimized ? 'scale(0.1) translateY(60vh)' : 'scale(1) translateY(0)',
          transformOrigin: 'bottom center',
          opacity: isMinimized ? 0 : 1,
          pointerEvents: isMinimized ? 'none' : 'auto',
        }}
      >
        {/* Barra de título estilo macOS */}
        <div
          className="flex items-center px-4 py-2.5 select-none shrink-0"
          style={{ backgroundColor: C.bar, borderBottom: `1px solid ${C.crust}` }}
        >
          <div className="group flex items-center gap-2">
            <button
              type="button"
              aria-label={t.closeLabel}
              title={t.closeTitle}
              onClick={(e) => { e.stopPropagation(); handleClose(); }}
              className="w-3.5 h-3.5 rounded-full flex items-center justify-center leading-none text-[9px] font-bold text-black/60"
              style={{ backgroundColor: '#ff5f57' }}
            >
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">✕</span>
            </button>
            <button
              type="button"
              aria-label={t.minimizeLabel}
              title={t.minimizeTitle}
              onClick={(e) => { e.stopPropagation(); handleMinimize(); }}
              className="w-3.5 h-3.5 rounded-full flex items-center justify-center leading-none text-[10px] font-bold text-black/60"
              style={{ backgroundColor: '#febc2e' }}
            >
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">−</span>
            </button>
            <button
              type="button"
              aria-label={t.fullscreenLabel}
              title={t.fullscreenTitle}
              onClick={(e) => { e.stopPropagation(); handleFullscreen(); }}
              className="w-3.5 h-3.5 rounded-full flex items-center justify-center leading-none text-[8px] font-bold text-black/60"
              style={{ backgroundColor: '#28c840' }}
            >
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">⤢</span>
            </button>
          </div>
          <div className="flex-1 text-center text-xs tracking-wide" style={{ color: C.faint }}>
            mk@kawashiro.dev — -zsh — 132×34
          </div>
          <div className="w-14" />
        </div>

        {/* Cuerpo de la terminal */}
        <div className="flex-1 overflow-y-auto px-5 py-4 leading-relaxed" style={{ color: C.text }}>
          {history.map((line, index) => (
            <div key={index} className="min-h-[1.25rem] whitespace-pre-wrap break-words">
              {typeof line === 'string' ? (
                line.startsWith('$ ') || line.startsWith('$G ') ? (
                  <span>
                    <Prompt user={line.startsWith('$G ') ? 'guest' : 'mk'} />
                    <span style={{ color: C.text }}>{line.slice(line.startsWith('$G ') ? 3 : 2)}</span>
                  </span>
                ) : (
                  <span style={{ color: lineColor(line) }}>{line}</span>
                )
              ) : (
                <div className="my-2">{line}</div>
              )}
            </div>
          ))}
          <div ref={terminalEndRef} />

          {/* Línea de entrada activa (inline, como una terminal real) */}
          <form onSubmit={executeCommand} className="flex items-center min-h-[1.25rem]">
            <Prompt />
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none font-mono focus:ring-0 p-0"
              style={{ color: C.text, caretColor: C.text }}
              autoFocus
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
          </form>
        </div>
      </div>
    </div>
  );
};
