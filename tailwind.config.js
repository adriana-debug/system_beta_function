const defaultTheme = require('tailwindcss/defaultTheme')
const tokens = require('./BPO_DESIGN_TOKENS.json');

module.exports = {
  content: [
    './src/**/*.{html,js}',
  ],
  theme: {
    extend: {
      colors: {
        ...tokens.colors.semantic,
        ...tokens.colors.neutral,
        ...tokens.colors.status,
        ...tokens.colors.priority
      },
      fontFamily: {
        primary: tokens.typography.fontFamilies.primary,
        mono: tokens.typography.fontFamilies.mono,
      },
      fontSize: Object.keys(tokens.typography.typeScale).reduce((acc, key) => {
        acc[key] = [
          tokens.typography.typeScale[key].fontSize,
          {
            lineHeight: tokens.typography.typeScale[key].lineHeight,
            letterSpacing: tokens.typography.typeScale[key].letterSpacing,
            fontWeight: tokens.typography.typeScale[key].fontWeight,
          },
        ];
        return acc;
      }, {}),
      spacing: {
        ...defaultTheme.spacing,
        ...tokens.spacing,
      },
      borderRadius: {
        ...defaultTheme.borderRadius,
        ...tokens.borderRadius,
      },
      boxShadow: {
        ...defaultTheme.boxShadow,
        ...tokens.shadows,
      },
      transitionTimingFunction: {
        ...defaultTheme.transitionTimingFunction,
        ...Object.keys(tokens.motion.transitions).reduce((acc, key) => {
          acc[key] = tokens.motion.transitions[key].easing;
          return acc;
        }, {}),
      },
      transitionDuration: {
        ...defaultTheme.transitionDuration,
        ...Object.keys(tokens.motion.transitions).reduce((acc, key) => {
          acc[key] = tokens.motion.transitions[key].duration;
          return acc;
        }, {}),
      },
      zIndex: {
        ...defaultTheme.zIndex,
        ...tokens.zIndex,
      }
    },
  },
  variants: {
    extend: {
      gap: ['responsive'],
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
