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
