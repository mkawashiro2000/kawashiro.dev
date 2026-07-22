import React, { useEffect, useRef } from 'react';

/**
 * MatrixRain — lluvia de caracteres a pantalla completa (comando `matrix`).
 * Cualquier tecla o clic devuelve el control a la terminal.
 */

const GLYPHS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEFXYZ$#@*+-';

export const MatrixRain: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const fontSize = 16;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array.from({ length: columns }, () => Math.floor(Math.random() * -40));

    const interval = setInterval(() => {
      // Estela: fundido gradual del frame anterior
      ctx.fillStyle = 'rgba(17, 17, 27, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const glyph = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        // Cabeza brillante, cuerpo verde Catppuccin
        ctx.fillStyle = Math.random() > 0.975 ? '#cdd6f4' : '#a6e3a1';
        ctx.fillText(glyph, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    }, 50);

    const exit = () => onExit();
    window.addEventListener('keydown', exit);
    window.addEventListener('mousedown', exit);
    window.addEventListener('touchstart', exit);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', exit);
      window.removeEventListener('mousedown', exit);
      window.removeEventListener('touchstart', exit);
    };
  }, [onExit]);

  return (
    <div className="fixed inset-0 z-[100]" style={{ backgroundColor: '#11111b' }}>
      <canvas ref={canvasRef} className="w-full h-full" />
      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-xs animate-pulse"
        style={{ color: '#6c7086' }}
      >
        press any key to wake up
      </div>
    </div>
  );
};
