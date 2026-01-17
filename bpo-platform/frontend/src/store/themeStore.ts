import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemeMode, BrandVariant } from '@/themes';
import { getSystemTheme } from '@/themes';

interface ThemeState {
  mode: ThemeMode;
  variant: BrandVariant;
  setMode: (mode: ThemeMode) => void;
  setVariant: (variant: BrandVariant) => void;
  toggleMode: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: getSystemTheme(),
      variant: 'blue',
      setMode: (mode) => set({ mode }),
      setVariant: (variant) => set({ variant }),
      toggleMode: () =>
        set((state) => ({ mode: state.mode === 'light' ? 'dark' : 'light' })),
    }),
    {
      name: 'bpo-theme-storage',
    }
  )
);
