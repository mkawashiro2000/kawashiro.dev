import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  isProMode: boolean;
  toggleMode: () => void;
  // Preparando el terreno para la hidratación segura
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isProMode: false,
      toggleMode: () => set((state) => ({ isProMode: !state.isProMode })),
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'kawashiro-dev-storage',
      partialize: (state) => ({ isProMode: state.isProMode }), // Solo persistimos el modo
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
