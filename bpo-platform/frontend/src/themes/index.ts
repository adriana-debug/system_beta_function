/**
 * Theme configuration with brand variants
 */

export type ThemeMode = 'light' | 'dark';
export type BrandVariant = 'blue' | 'green' | 'purple';

export interface ThemeColors {
  primary: Record<string, string>;
  accent: Record<string, string>;
}

// Blue (Corporate - Default)
const blueTheme: ThemeColors = {
  primary: {
    50: '239 246 255',   // #eff6ff
    100: '219 234 254',  // #dbeafe
    200: '191 219 254',  // #bfdbfe
    300: '147 197 253',  // #93c5fd
    400: '96 165 250',   // #60a5fa
    500: '59 130 246',   // #3b82f6
    600: '37 99 235',    // #2563eb - Primary
    700: '29 78 216',    // #1d4ed8
    800: '30 64 175',    // #1e40af - Accent
    900: '30 58 138',    // #1e3a8a
    950: '23 37 84',     // #172554
  },
  accent: {
    50: '238 242 255',
    100: '224 231 255',
    200: '199 210 254',
    300: '165 180 252',
    400: '129 140 248',
    500: '99 102 241',
    600: '79 70 229',
    700: '67 56 202',
    800: '55 48 163',
    900: '49 46 129',
    950: '30 27 75',
  },
};

// Green (Operations)
const greenTheme: ThemeColors = {
  primary: {
    50: '240 253 244',   // #f0fdf4
    100: '220 252 231',  // #dcfce7
    200: '187 247 208',  // #bbf7d0
    300: '134 239 172',  // #86efac
    400: '74 222 128',   // #4ade80
    500: '34 197 94',    // #22c55e
    600: '22 163 74',    // #16a34a - Primary
    700: '21 128 61',    // #15803d
    800: '22 101 52',    // #166534 - Accent
    900: '20 83 45',     // #14532d
    950: '5 46 22',      // #052e16
  },
  accent: {
    50: '236 253 245',
    100: '209 250 229',
    200: '167 243 208',
    300: '110 231 183',
    400: '52 211 153',
    500: '16 185 129',
    600: '5 150 105',
    700: '4 120 87',
    800: '6 95 70',
    900: '6 78 59',
    950: '2 44 34',
  },
};

// Purple (Analytics/Admin)
const purpleTheme: ThemeColors = {
  primary: {
    50: '250 245 255',   // #faf5ff
    100: '243 232 255',  // #f3e8ff
    200: '233 213 255',  // #e9d5ff
    300: '216 180 254',  // #d8b4fe
    400: '192 132 252',  // #c084fc
    500: '168 85 247',   // #a855f7
    600: '124 58 237',   // #7c3aed - Primary
    700: '109 40 217',   // #6d28d9
    800: '91 33 182',    // #5b21b6 - Accent
    900: '76 29 149',    // #4c1d95
    950: '46 16 101',    // #2e1065
  },
  accent: {
    50: '245 243 255',
    100: '237 233 254',
    200: '221 214 254',
    300: '196 181 253',
    400: '167 139 250',
    500: '139 92 246',
    600: '124 58 237',
    700: '109 40 217',
    800: '91 33 182',
    900: '76 29 149',
    950: '46 16 101',
  },
};

// Light/Dark mode surface colors
const lightSurface = {
  50: '255 255 255',   // #ffffff
  100: '249 250 251',  // #f9fafb
  200: '243 244 246',  // #f3f4f6
  300: '229 231 235',  // #e5e7eb
  400: '209 213 219',  // #d1d5db
  500: '156 163 175',  // #9ca3af
  600: '107 114 128',  // #6b7280
  700: '75 85 99',     // #4b5563
  800: '31 41 55',     // #1f2937
  900: '17 24 39',     // #111827
};

const darkSurface = {
  50: '17 24 39',      // #111827
  100: '31 41 55',     // #1f2937
  200: '55 65 81',     // #374151
  300: '75 85 99',     // #4b5563
  400: '107 114 128',  // #6b7280
  500: '156 163 175',  // #9ca3af
  600: '209 213 219',  // #d1d5db
  700: '229 231 235',  // #e5e7eb
  800: '243 244 246',  // #f3f4f6
  900: '255 255 255',  // #ffffff
};

export const themes: Record<BrandVariant, ThemeColors> = {
  blue: blueTheme,
  green: greenTheme,
  purple: purpleTheme,
};

export const surfaces = {
  light: lightSurface,
  dark: darkSurface,
};

export function applyTheme(variant: BrandVariant, mode: ThemeMode): void {
  const theme = themes[variant];
  const surface = surfaces[mode];
  const root = document.documentElement;

  // Apply primary colors
  Object.entries(theme.primary).forEach(([shade, value]) => {
    root.style.setProperty(`--color-primary-${shade}`, value);
  });

  // Apply accent colors
  Object.entries(theme.accent).forEach(([shade, value]) => {
    root.style.setProperty(`--color-accent-${shade}`, value);
  });

  // Apply surface colors
  Object.entries(surface).forEach(([shade, value]) => {
    root.style.setProperty(`--color-surface-${shade}`, value);
  });

  // Apply dark mode class
  if (mode === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export function getSystemTheme(): ThemeMode {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
  return 'light';
}
