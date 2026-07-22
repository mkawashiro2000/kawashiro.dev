import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { getTranslation } from '../../i18n/translations';
import { Trie } from '../../terminal/utils/trie';
import { HtopLive } from './HtopLive';
import { printResumeToThermal } from '../../terminal/utils/webusb';

export const TerminalApp: React.FC = () => {
  const [input, setInput] = useState('');
  const locale = useAppStore((state) => state.locale);
  const t = getTranslation(locale).terminal;

  // El historial soporta texto estricto y nodos de React para HtopLive y DgiiSignerMock
  const [history, setHistory] = useState<(string | React.ReactNode)[]>(t.boot);

  const [historyPointer, setHistoryPointer] = useState<number>(-1);
  const [isMinimized, setIsMinimized] = useState(false);
  const commandArchive = useRef<string[]>([]);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const toggleMode = useAppStore((state) => state.toggleMode);

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

  // Prompt realista: mk@kawashiro:~$
  const Prompt = () => (
    <>
      <span style={{ color: C.green }}>mk@kawashiro</span>
      <span style={{ color: C.faint }}>:</span>
      <span style={{ color: C.blue }}>~</span>
      <span style={{ color: C.mauve }}> $ </span>
    </>
  );

  // Inicialización estricta del árbol Trie con todo el léxico permitido
  const commandTrie = useMemo(() => {
    const trie = new Trie();
    ['help', 'clear', 'casual', 'about', 'neofetch', 'htop', 'print resume'].forEach(cmd => trie.insert(cmd));
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
       output.push(t.printInit, t.printWaiting);

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
          output.push(...t.helpLines);
          break;
        case 'clear':
          setHistory([]);
          setInput('');
          return;
        case 'casual':
          output.push(t.casualTransition);
          setHistory([...history, ...output]);
          setTimeout(() => {
            document.documentElement.classList.remove('pro-theme');
            toggleMode();
          }, 500);
          setInput('');
          return;
        case 'about':
          output.push(...t.aboutLines);
          break;
        case 'neofetch':
          output.push(...t.neofetchLines);
          break;
        case 'htop':
          output.push(t.htopOpening);
          output.push(<HtopLive key={`htop-${Date.now()}`} />);
          break;
        default:
          output.push(t.commandNotFound(baseCommand));
      }
    }

    setHistory([...history, ...output, '']);
    setInput('');
  };

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // Color de las líneas de salida según su naturaleza (errores en rojo, etc.)
  const lineColor = (line: string): string => {
    if (/^(cat:|sys:|.*no encontrado|.*No existe)/i.test(line)) return C.red;
    if (/^\[OK\]|completada|activos/i.test(line)) return C.green;
    if (/^\[ERROR\]|\[ABORTADO\]/i.test(line)) return C.red;
    if (/^-{3,}|^={3,}/.test(line)) return C.faint;
    return C.text;
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="relative w-full h-[100dvh] overflow-hidden"
      style={{ backgroundColor: C.crust }}
    >
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
                line.startsWith('$ ') ? (
                  <span>
                    <Prompt />
                    <span style={{ color: C.text }}>{line.slice(2)}</span>
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
