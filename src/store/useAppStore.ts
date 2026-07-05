import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Locale = 'en' | 'es' | 'ja';

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
      locale: 'en',
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
