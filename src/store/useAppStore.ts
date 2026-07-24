import { useEffect, useLayoutEffect, useState } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Locale = 'en' | 'es' | 'ja';

/**
 * Detecta el idioma preferido del navegador. Si ninguno de los idiomas del
 * visitante está soportado, cae a inglés. Solo aplica en la primera visita:
 * la preferencia persistida en localStorage tiene prioridad al rehidratar.
 */
const detectLocale = (): Locale => {
  if (typeof navigator === 'undefined') return 'en';
  const candidates = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const lang of candidates) {
    const code = lang?.toLowerCase().slice(0, 2);
    if (code === 'en' || code === 'es' || code === 'ja') return code;
  }
  return 'en';
};

interface AppState {
  isProMode: boolean;
  toggleMode: () => void;
  locale: Locale;
  setLocale: (locale: Locale) => void;
  // Preparando el terreno para la hidratación segura
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isProMode: false,
      toggleMode: () => set((state) => ({ isProMode: !state.isProMode })),
      locale: detectLocale(),
      setLocale: (locale) => set({ locale }),
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'kawashiro-dev-storage',
      partialize: (state) => ({ isProMode: state.isProMode, locale: state.locale }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

/**
 * El HTML se genera en build con los valores por defecto (inglés, modo casual).
 * Para que el primer render del cliente coincida exactamente con ese HTML —y no
 * haya errores de hidratación— estos hooks devuelven el valor por defecto hasta
 * que el componente monta, y solo entonces exponen el estado persistido.
 *
 * Se usa useLayoutEffect (no useEffect) a propósito: corre antes del primer
 * pintado, así el visitante con idioma guardado nunca ve un parpadeo en inglés.
 */
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useIsoLayoutEffect(() => setMounted(true), []);
  return mounted;
}

/** Idioma real tras montar; 'en' durante el render que debe calcar al HTML. */
export function useHydratedLocale(): Locale {
  const locale = useAppStore((s) => s.locale);
  return useMounted() ? locale : 'en';
}

/** Modo PRO real tras montar; false durante el render que calca al HTML. */
export function useHydratedProMode(): boolean {
  const isProMode = useAppStore((s) => s.isProMode);
  return useMounted() ? isProMode : false;
}
