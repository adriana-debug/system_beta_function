import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useThemeStore } from '@/store/themeStore';
import { applyTheme } from '@/themes';

interface ThemeContextValue {
  mode: 'light' | 'dark';
  variant: 'blue' | 'green' | 'purple';
  setMode: (mode: 'light' | 'dark') => void;
  setVariant: (variant: 'blue' | 'green' | 'purple') => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { mode, variant, setMode, setVariant, toggleMode } = useThemeStore();

  useEffect(() => {
    applyTheme(variant, mode);
  }, [mode, variant]);

  return (
    <ThemeContext.Provider
      value={{ mode, variant, setMode, setVariant, toggleMode }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
