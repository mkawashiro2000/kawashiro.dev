import React, { useState, useEffect, useRef } from 'react';

/**
 * TypingTest — minijuego de mecanografía dentro de la terminal (comando `typing`).
 * Mide WPM y precisión sobre una frase técnica; Enter reinicia, Esc termina.
 */

const PHRASES = [
  'the quick brown fox jumps over the lazy dog while deploying to production',
  'never push to main on a friday afternoon without running the tests first',
  'data pipelines break silently unless you monitor every single step of them',
  'a raspberry pi with a cloudflare tunnel can serve a website to the whole world',
  'cache invalidation and naming things are the two hardest problems in computing',
  'always read the error message twice before blaming the framework',
];

const C = {
  text: '#cdd6f4',
  faint: '#6c7086',
  green: '#a6e3a1',
  red: '#f38ba8',
  yellow: '#f9e2af',
  teal: '#94e2d5',
  border: '#313244',
};

interface Result {
  wpm: number;
  accuracy: number;
  seconds: number;
}

export const TypingTest: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [phrase, setPhrase] = useState(() => PHRASES[Math.floor(Math.random() * PHRASES.length)]);
  const [typed, setTyped] = useState('');
  const [errors, setErrors] = useState(0);
  const [startTs, setStartTs] = useState<number | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const restart = () => {
    setPhrase(PHRASES[Math.floor(Math.random() * PHRASES.length)]);
    setTyped('');
    setErrors(0);
    setStartTs(null);
    setResult(null);
    setTimeout(() => inputRef.current?.focus(), 30);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onExit();
      return;
    }
    if (result && e.key === 'Enter') {
      e.preventDefault();
      restart();
      return;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (result) return;
    const value = e.target.value;
    if (startTs === null && value.length > 0) setStartTs(Date.now());
    // Contar errores nuevos (solo cuando se añade un carácter incorrecto)
    if (value.length > typed.length) {
      const idx = value.length - 1;
      if (value[idx] !== phrase[idx]) setErrors((n) => n + 1);
    }
    setTyped(value);

    if (value === phrase && startTs !== null) {
      const seconds = (Date.now() - startTs) / 1000;
      const words = phrase.split(' ').length;
      const wpm = Math.round((words / seconds) * 60);
      const accuracy = Math.max(0, Math.round(((phrase.length - errors) / phrase.length) * 100));
      setResult({ wpm, accuracy, seconds: Math.round(seconds * 10) / 10 });
    }
  };

  return (
    <div
      className="my-2 p-4 rounded border border-dashed font-mono text-sm cursor-text"
      style={{ borderColor: C.faint, backgroundColor: '#181825' }}
      onClick={(e) => {
        e.stopPropagation();
        inputRef.current?.focus();
      }}
    >
      <div style={{ color: C.teal }} className="font-bold mb-2">
        ⌨ TYPING TEST — type the phrase below · Esc to quit
      </div>

      <div className="leading-relaxed mb-2 select-none">
        {phrase.split('').map((ch, i) => {
          let color = C.faint;
          let bg: string | undefined;
          if (i < typed.length) {
            color = typed[i] === ch ? C.green : C.red;
            bg = typed[i] === ch ? undefined : 'rgba(243,139,168,0.2)';
          } else if (i === typed.length) {
            bg = 'rgba(205,214,244,0.25)'; // cursor
            color = C.text;
          }
          return (
            <span key={i} style={{ color, backgroundColor: bg }}>
              {ch}
            </span>
          );
        })}
      </div>

      {result ? (
        <div>
          <span style={{ color: C.green }} className="font-bold">
            {result.wpm} WPM
          </span>
          <span style={{ color: C.text }}> · accuracy {result.accuracy}% · {result.seconds}s</span>
          <div style={{ color: C.faint }} className="text-xs mt-1">
            Enter → play again · Esc → back to shell
          </div>
        </div>
      ) : (
        <div style={{ color: C.faint }} className="text-xs">
          {typed.length === 0 ? 'timer starts with your first keystroke...' : `errors: ${errors}`}
        </div>
      )}

      <input
        ref={inputRef}
        type="text"
        value={typed}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="opacity-0 absolute w-px h-px"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        aria-label="Typing test input"
      />
    </div>
  );
};
