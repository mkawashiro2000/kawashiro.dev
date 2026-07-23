import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { getTranslation } from '../../i18n/translations';
import { LanguageSwitcher } from '../shared/LanguageSwitcher';
import { openPrintableResume } from '../../terminal/utils/resume';

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
const InstagramMark = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069Zm0-2.163C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0Zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881Z" />
  </svg>
);
const WhatsappMark = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347Z" />
    <path d="M20.52 3.449C12.831-3.984.106 1.407.101 11.893a11.94 11.94 0 0 0 1.599 5.945L0 24l6.335-1.652a11.9 11.9 0 0 0 5.723 1.457h.005c9.784 0 15.902-10.632 11.043-19.088A11.86 11.86 0 0 0 20.52 3.449ZM12.063 21.785h-.004a9.92 9.92 0 0 1-5.061-1.386l-.362-.215-3.759.981 1.004-3.667-.236-.375a9.9 9.9 0 0 1-1.523-5.276c.004-5.469 4.457-9.92 9.945-9.92a9.87 9.87 0 0 1 7.02 2.909 9.9 9.9 0 0 1 2.897 7.021c-.003 5.469-4.456 9.928-9.921 9.928Z" />
  </svg>
);
const MailMark = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 6-10 7L2 6" />
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
  logo?: string;
  badge?: string; // etiqueta llamativa (ej. "live" en la tarjeta de la terminal)
};

export const BusinessUI: React.FC = () => {
  const toggleMode = useAppStore((state) => state.toggleMode);
  const locale = useAppStore((state) => state.locale);
  const t = getTranslation(locale);

  const [menuOpen, setMenuOpen] = React.useState(false);

  // Tema oscuro: estado espejo de la clase en <html> (la fija theme.js/Layout)
  const [isDark, setIsDark] = React.useState(false);
  React.useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark-theme'));
  }, []);
  const toggleTheme = () => {
    (window as unknown as { __kawashiroTheme?: { toggle: () => void } }).__kawashiroTheme?.toggle();
    setIsDark(document.documentElement.classList.contains('dark-theme'));
  };

  const handleTransition = () => {
    document.documentElement.classList.add('pro-theme');
    toggleMode();
  };

  // Código Konami (↑↑↓↓←→←→BA): teletransporte directo a la terminal
  React.useEffect(() => {
    const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let progress = 0;
    const onKey = (e: KeyboardEvent) => {
      progress = e.key === KONAMI[progress] ? progress + 1 : e.key === KONAMI[0] ? 1 : 0;
      if (progress === KONAMI.length) {
        progress = 0;
        handleTransition();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const green = 'var(--color-green500)';
  const beige = 'var(--color-beige)';
  const darkGreen = 'var(--color-green800)';

  const workCards: Card[] = [
    {
      category: t.cards.agrobalance.category,
      title: 'AgroBalance',
      desc: t.cards.agrobalance.desc,
      bg: 'var(--color-rust)',
      fg: darkGreen,
      col: '1 / 15',
      href: 'https://agrobalancerd.com',
      logo: '/img/proyectos/agrobalance.png',
    },
    {
      category: t.cards.cajalocal.category,
      title: 'CajaLocal',
      desc: t.cards.cajalocal.desc,
      bg: 'var(--color-lilac)',
      fg: darkGreen,
      col: '15 / 27',
      href: '/cajalocal',
      logo: '/img/proyectos/cajalocal.webp',
    },
    {
      category: t.cards.lubesync.category,
      title: 'LubeSyncRD',
      desc: t.cards.lubesync.desc,
      bg: 'var(--color-mint)',
      fg: darkGreen,
      col: '1 / 13',
      href: 'https://lubesyncrd.pages.dev',
      logo: '/img/proyectos/lubesync.webp',
    },
    {
      category: t.cards.kampit.category,
      title: 'Kampit',
      desc: t.cards.kampit.desc,
      bg: 'var(--color-babyblue)',
      fg: darkGreen,
      col: '13 / 27',
      href: 'https://kampit.mkawashiro01.workers.dev',
      logo: '/img/proyectos/kampit.webp',
    },
  ];

  const skillGroups: { label: string; items: string[]; bg: string }[] = [
    { label: t.skills.groups.frontend, items: ['JavaScript', 'TypeScript', 'TailwindCSS', 'Astro', 'SCSS'], bg: 'var(--color-lilac)' },
    { label: t.skills.groups.backend, items: ['Node.js', 'Bun', 'Deno', 'Supabase', 'Resend'], bg: 'var(--color-pink)' },
    { label: t.skills.groups.dataScience, items: ['Python', 'NumPy', 'Pandas', 'Scikit-learn', 'TensorFlow', 'Keras'], bg: 'var(--color-yellow)' },
    { label: t.skills.groups.databases, items: ['PostgreSQL', 'MongoDB', 'Redis', 'AWS', 'Docker', 'GitHub'], bg: 'var(--color-mint)' },
  ];

  const socials = [
    { label: 'GitHub', icon: <GithubMark />, href: 'https://github.com/mkawashiro2000' },
    { label: 'Instagram', icon: <InstagramMark />, href: 'https://www.instagram.com/kawashiro.dev' },
    { label: 'WhatsApp', icon: <WhatsappMark />, href: 'https://wa.me/18299589614' },
    { label: 'Email', icon: <MailMark />, href: 'mailto:mkawashiro01@gmail.com' },
  ];

  const renderCard = (c: Card, i: number) => {
    const inner = (
      <>
        <span className="flex items-center gap-3">
          <span
            className="text-[13px] font-semibold uppercase tracking-[0.2em] opacity-80"
            style={{ color: c.fg }}
          >
            {c.category}
          </span>
          {c.badge && (
            <span
              className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.15em] rounded-full px-2.5 py-1"
              style={{ color: c.bg, backgroundColor: c.fg }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#4ade80' }} />
              {c.badge}
            </span>
          )}
        </span>
        <div className="mt-auto pt-10">
          {c.logo ? (
            <img
              src={c.logo}
              alt={`${c.title} logo`}
              className="h-16 sm:h-20 w-auto object-contain object-left mb-4"
            />
          ) : (
            <h3
              className="font-display text-4xl sm:text-5xl font-semibold leading-[0.95] tracking-tight"
              style={{ color: c.fg }}
            >
              {c.title}
            </h3>
          )}
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
        <div className="flex items-center gap-3 sm:gap-6 text-sm font-medium">
          <a href="/proyectos" className="hidden sm:inline hover:opacity-60 transition-opacity">{t.nav.projects}</a>
          <a href="/futuros-proyectos" className="hidden sm:inline hover:opacity-60 transition-opacity">{t.nav.futureProjects}</a>
          <a href="/blog" className="hidden sm:inline hover:opacity-60 transition-opacity">Blog</a>
          <a href="mailto:mkawashiro01@gmail.com" className="hidden sm:inline hover:opacity-60 transition-opacity">{t.nav.contact}</a>
          <LanguageSwitcher />
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-110"
            style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', color: green }}
          >
            {isDark ? (
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
                <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z" />
              </svg>
            )}
          </button>
          <button
            onClick={handleTransition}
            className="rounded-full px-5 py-2 font-semibold transition-transform hover:scale-105"
            style={{ backgroundColor: green, color: beige }}
          >
            {t.nav.terminal} ↗
          </button>
          {/* Hamburguesa: los enlaces del nav viven aquí en móvil */}
          <button
            type="button"
            aria-label="Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="sm:hidden w-10 h-10 rounded-full flex flex-col items-center justify-center gap-[5px]"
            style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}
          >
            <span className="block h-0.5 rounded transition-transform" style={{ backgroundColor: green, width: 18, transform: menuOpen ? 'translateY(3.5px) rotate(45deg)' : undefined }} />
            <span className="block h-0.5 rounded transition-transform" style={{ backgroundColor: green, width: 18, transform: menuOpen ? 'translateY(-3.5px) rotate(-45deg)' : undefined }} />
          </button>
        </div>
      </nav>

      {/* Menú móvil desplegable */}
      {menuOpen && (
        <div className="sm:hidden max-w-[1300px] mx-auto px-6 pb-4">
          <div
            className="rounded-3xl p-6 flex flex-col gap-4 text-base font-medium shadow-lg"
            style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
          >
            <a href="/proyectos" onClick={() => setMenuOpen(false)} className="hover:opacity-60 transition-opacity">{t.nav.projects}</a>
            <a href="/futuros-proyectos" onClick={() => setMenuOpen(false)} className="hover:opacity-60 transition-opacity">{t.nav.futureProjects}</a>
            <a href="/blog" onClick={() => setMenuOpen(false)} className="hover:opacity-60 transition-opacity">Blog</a>
            <a href="mailto:mkawashiro01@gmail.com" onClick={() => setMenuOpen(false)} className="hover:opacity-60 transition-opacity">{t.nav.contact}</a>
          </div>
        </div>
      )}

      {/* HERO */}
      <header className="max-w-[1300px] mx-auto px-6 sm:px-8 pt-16 pb-10 sm:pt-28 sm:pb-16 text-center">
        <h1 className="font-display font-semibold leading-[0.92] tracking-[-0.02em]">
          <span className="relative inline-block text-[clamp(3rem,11vw,10rem)]">
            {(() => {
              const [before, after] = t.hero.line1.split('{name}');
              return (
                <>
                  {before}
                  <span style={{ whiteSpace: 'nowrap' }}>{t.hero.name}</span>
                  {after}
                </>
              );
            })()}
            <Star className="star-twinkle absolute w-8 h-8 sm:w-12 sm:h-12 -right-6 -top-2 sm:-right-10" />
          </span>
          <span className="relative block text-[clamp(3rem,11vw,10rem)]">
            {t.hero.line2}
            <Star className="star-twinkle delay absolute w-6 h-6 sm:w-10 sm:h-10 -left-4 bottom-2 sm:-left-8" />
          </span>
        </h1>
        <p
          className="mx-auto mt-8 max-w-2xl text-lg sm:text-2xl leading-snug"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {t.hero.bio}
        </p>
      </header>

      {/* WORK CARDS */}
      <section id="work" className="max-w-[1300px] mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[repeat(26,minmax(0,1fr))] gap-5 sm:gap-6">
          {workCards.map(renderCard)}
        </div>
      </section>

      {/* STACK & SKILLS */}
      <section className="max-w-[1300px] mx-auto px-6 sm:px-8 pt-24 sm:pt-36 pb-10 text-center">
        <h2 className="font-display font-semibold text-[clamp(2.5rem,8vw,7rem)] leading-none tracking-tight">
          {t.skills.heading}
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg sm:text-xl" style={{ color: 'var(--color-text-muted)' }}>
          {t.skills.subtitle}
        </p>
      </section>

      <section className="max-w-[1300px] mx-auto px-6 sm:px-8 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
          {skillGroups.map((g, i) => (
            <div
              key={i}
              className="rounded-[32px] p-8 sm:p-10 flex flex-col"
              style={{ backgroundColor: g.bg, color: darkGreen }}
            >
              <span className="text-[13px] font-semibold uppercase tracking-[0.2em] opacity-80">
                {g.label}
              </span>
              <div className="flex flex-wrap gap-2 mt-5">
                {g.items.map((item, j) => (
                  <span
                    key={j}
                    className="text-sm font-medium rounded-full px-3.5 py-1.5 bg-white/50"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MEGA CTA */}
      <section className="max-w-[1300px] mx-auto px-6 sm:px-8 py-28 sm:py-40 text-center">
        <a
          href="mailto:mkawashiro01@gmail.com"
          className="group inline-flex font-display font-semibold text-[clamp(3rem,12vw,11rem)] leading-none tracking-tight transition-transform hover:scale-[1.02]"
          style={{ color: green }}
        >
          <span className="transition-transform duration-500 group-hover:-translate-y-2">{t.cta.heading}</span>
        </a>
      </section>

      {/* FOOTER / COLOPHON */}
      <footer className="border-t" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
        <div className="max-w-[1300px] mx-auto px-6 sm:px-8 py-14 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          <div>
            <p className="font-display text-2xl font-semibold">{t.footer.name}</p>
            <p className="mt-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {t.footer.role}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => openPrintableResume(locale)}
              className="px-5 py-2.5 rounded-full text-sm font-semibold transition-transform hover:scale-105"
              style={{ backgroundColor: green, color: beige }}
            >
              {t.footer.downloadCv}
            </button>
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
