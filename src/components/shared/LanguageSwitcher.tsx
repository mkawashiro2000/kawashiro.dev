import React from 'react';
import { useAppStore, useHydratedLocale, type Locale } from '../../store/useAppStore';
import { LOCALES } from '../../i18n/translations';

export const LanguageSwitcher: React.FC<{ dark?: boolean }> = ({ dark }) => {
  const locale = useHydratedLocale();
  const setLocale = useAppStore((state) => state.setLocale);

  return (
    <div
      className="inline-flex items-center rounded-full p-1 text-xs font-semibold"
      style={{ backgroundColor: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }}
    >
      {LOCALES.map((l: { code: Locale; label: string }) => (
        <button
          key={l.code}
          type="button"
          onClick={() => setLocale(l.code)}
          aria-pressed={locale === l.code}
          className="rounded-full px-2.5 py-1 transition-colors"
          style={
            locale === l.code
              ? { backgroundColor: dark ? 'var(--color-beige)' : 'var(--color-green500)', color: dark ? 'var(--color-green500)' : 'var(--color-beige)' }
              : { color: 'inherit', opacity: 0.6 }
          }
        >
          {l.label}
        </button>
      ))}
    </div>
  );
};
