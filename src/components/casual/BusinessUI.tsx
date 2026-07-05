import React from 'react';
import { useAppStore } from '../../store/useAppStore';

/* Estrella decorativa de 4 puntas (estilo Sean Halpin) */
const Star: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 100" fill="currentColor" className={className} aria-hidden="true">
    <path d="M50 0c4 27 19 42 50 50-31 8-46 23-50 50-4-27-19-42-50-50C31 42 46 27 50 0Z" />
  </svg>
);

/* Marcas sociales (SVG inline, heredan currentColor) */
const GithubMark = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6" aria-hidden="true">
    <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.39 1.24-3.23-.13-.3-.54-1.52.11-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.92 1.23 3.23 0 4.62-2.81 5.64-5.49 5.94.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 24 12.5C24 5.87 18.63.5 12 .5Z" />
  </svg>
);
const LinkedinMark = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6" aria-hidden="true">
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0Z" />
  </svg>
);

type Card = {
  category: string;
  title: string;
  desc: string;
  bg: string;
  fg: string;
  col: string; // grid-column en el grid de 26 (solo lg)
  onClick?: () => void;
  href?: string;
};

export const BusinessUI: React.FC = () => {
  const toggleMode = useAppStore((state) => state.toggleMode);

  const handleTransition = () => {
    document.documentElement.classList.add('pro-theme');
    toggleMode();
  };

  const green = 'var(--color-green500)';
  const beige = 'var(--color-beige)';
  const darkGreen = 'var(--color-green800)';

  const workCards: Card[] = [
    {
      category: 'Fiscal Tech · DGII',
      title: 'Lex32 e-CF',
      desc: 'Facturación electrónica bajo la Ley 32-23. Criptografía X.509 y canonicalización XML para comprobantes de alta concurrencia.',
      bg: 'var(--color-rust)',
      fg: darkGreen,
      col: '1 / 15',
    },
    {
      category: 'Sistema · Interactivo',
      title: 'Terminal PRO',
      desc: 'Entra al emulador de línea de comandos: UNIX, telemetría real del servidor y scripts en vivo.',
      bg: 'var(--color-green500)',
      fg: beige,
      col: '15 / 27',
      onClick: handleTransition,
    },
    {
      category: 'Fintech · Agrícola',
      title: 'AgroBalance',
      desc: 'Contabilidad B2B para rastrear ciclos de cultivo, proyectar rentabilidad y liquidar entre socios productores.',
      bg: 'var(--color-mint)',
      fg: darkGreen,
      col: '1 / 13',
    },
    {
      category: 'Operaciones · Logística',
      title: 'Batista Hub & Cargo',
      desc: 'Dirección de una red de courier y distribución perimetral: cadena de suministro y puntos B2C/B2B a nivel nacional.',
      bg: 'var(--color-babyblue)',
      fg: darkGreen,
      col: '13 / 27',
    },
  ];

  const wipCards: Card[] = [
    {
      category: 'Homelab · Edge',
      title: 'ARM64 Telemetry',
      desc: 'Microservicio FastAPI que transmite CPU/RAM en vivo por Server-Sent Events desde una Raspberry Pi.',
      bg: 'var(--color-lilac)',
      fg: darkGreen,
      col: '1 / 14',
    },
    {
      category: 'Infra · Zero Trust',
      title: 'Cloudflare Tunnels',
      desc: 'Infraestructura sin port-forwarding: túneles salientes encriptados que absorben ataques sin exponer IPs.',
      bg: 'var(--color-pink)',
      fg: darkGreen,
      col: '14 / 27',
    },
  ];

  const socials = [
    { label: 'GitHub', icon: <GithubMark />, href: 'https://github.com/mkawashiro2000' },
    { label: 'LinkedIn', icon: <LinkedinMark />, href: '#' },
  ];

  const renderCard = (c: Card, i: number) => {
    const inner = (
      <>
        <span
          className="text-[13px] font-semibold uppercase tracking-[0.2em] opacity-80"
          style={{ color: c.fg }}
        >
          {c.category}
        </span>
        <div className="mt-auto pt-10">
          <h3
            className="font-display text-4xl sm:text-5xl font-semibold leading-[0.95] tracking-tight"
            style={{ color: c.fg }}
          >
            {c.title}
          </h3>
          <p className="mt-4 text-base sm:text-lg max-w-md leading-snug" style={{ color: c.fg, opacity: 0.85 }}>
            {c.desc}
          </p>
        </div>
      </>
    );
    const cls =
      'bento-card group flex flex-col text-left rounded-[32px] lg:rounded-[56px] p-8 sm:p-10 lg:p-12 min-h-[360px] lg:min-h-[500px] ' +
      'transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-2xl hover:saturate-[1.15] cursor-pointer';
    const style = { backgroundColor: c.bg, ['--col' as string]: c.col } as React.CSSProperties;
    return c.onClick ? (
      <button key={i} onClick={c.onClick} className={cls} style={style}>
        {inner}
      </button>
    ) : (
      <a
        key={i}
        href={c.href ?? '#'}
        target={c.href?.startsWith('http') ? '_blank' : undefined}
        rel="noreferrer"
        className={cls}
        style={style}
      >
        {inner}
      </a>
    );
  };

  return (
    <div className="w-full min-h-screen" style={{ color: green }}>
      {/* NAV */}
      <nav className="max-w-[1300px] mx-auto px-6 sm:px-8 py-6 flex items-center justify-between">
        <a href="/" className="font-display text-2xl font-semibold tracking-tight" style={{ color: green }}>
          kawashiro<span className="opacity-50">.dev</span>
        </a>
        <div className="flex items-center gap-6 text-sm font-medium">
          <a href="#work" className="hidden sm:inline hover:opacity-60 transition-opacity">Trabajo</a>
          <a href="mailto:hola@kawashiro.dev" className="hidden sm:inline hover:opacity-60 transition-opacity">Contacto</a>
          <button
            onClick={handleTransition}
            className="rounded-full px-5 py-2 font-semibold transition-transform hover:scale-105"
            style={{ backgroundColor: green, color: beige }}
          >
            Terminal ↗
          </button>
        </div>
      </nav>

      {/* HERO */}
      <header className="max-w-[1300px] mx-auto px-6 sm:px-8 pt-16 pb-10 sm:pt-28 sm:pb-16 text-center">
        <h1 className="font-display font-semibold leading-[0.92] tracking-[-0.02em]">
          <span className="relative inline-block text-[clamp(3rem,11vw,10rem)]">
            Hola. Soy Mitsunori.
            <Star className="star-twinkle absolute w-8 h-8 sm:w-12 sm:h-12 -right-6 -top-2 sm:-right-10" />
          </span>
          <span className="relative block text-[clamp(3rem,11vw,10rem)]">
            Ingeniero.
            <Star className="star-twinkle delay absolute w-6 h-6 sm:w-10 sm:h-10 -left-4 bottom-2 sm:-left-8" />
          </span>
        </h1>
        <p
          className="mx-auto mt-8 max-w-2xl text-lg sm:text-2xl leading-snug"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Construyo sistemas fiscales, plataformas B2B e infraestructura de borde
          autogestionada. Desde Santo Domingo, República Dominicana 🇩🇴
        </p>
      </header>

      {/* WORK CARDS */}
      <section id="work" className="max-w-[1300px] mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[repeat(26,minmax(0,1fr))] gap-5 sm:gap-6">
          {workCards.map(renderCard)}
        </div>
      </section>

      {/* IN PROGRESS */}
      <section className="max-w-[1300px] mx-auto px-6 sm:px-8 pt-24 sm:pt-36 pb-10 text-center">
        <h2 className="font-display font-semibold text-[clamp(2.5rem,8vw,7rem)] leading-none tracking-tight">
          En progreso.
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg sm:text-xl" style={{ color: 'var(--color-text-muted)' }}>
          Proyectos de infraestructura en distintos estados de diseño y desarrollo,
          desde el homelab hasta producción.
        </p>
      </section>

      <section className="max-w-[1300px] mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[repeat(26,minmax(0,1fr))] gap-5 sm:gap-6">
          {wipCards.map(renderCard)}
        </div>
      </section>

      {/* MEGA CTA */}
      <section className="max-w-[1300px] mx-auto px-6 sm:px-8 py-28 sm:py-40 text-center">
        <a
          href="mailto:hola@kawashiro.dev"
          className="group inline-flex font-display font-semibold text-[clamp(3rem,12vw,11rem)] leading-none tracking-tight transition-transform hover:scale-[1.02]"
          style={{ color: green }}
        >
          <span className="transition-transform duration-500 group-hover:-translate-y-2">¿Hablamos?</span>
        </a>
      </section>

      {/* FOOTER / COLOPHON */}
      <footer className="border-t" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
        <div className="max-w-[1300px] mx-auto px-6 sm:px-8 py-14 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          <div>
            <p className="font-display text-2xl font-semibold">Mitsunori Kawashiro</p>
            <p className="mt-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Hecho con Astro, React y FastAPI · Servido desde una Raspberry Pi
            </p>
          </div>
          <div className="flex items-center gap-4">
            {socials.map((s, i) => (
              <a
                key={i}
                href={s.href}
                target={s.href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                aria-label={s.label}
                className="w-12 h-12 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                style={{ backgroundColor: green, color: beige }}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};
