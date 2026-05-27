import { MD3DarkTheme, MD3LightTheme, type MD3Theme } from 'react-native-paper';

// Minimal, spójny branding. Docelowo można zsynchronizować szerzej z `constants/theme.ts`.
const BRAND = {
  primary: '#C2185B',
  secondary: '#7B1FA2',
} as const;

export const paperLightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: BRAND.primary,
    secondary: BRAND.secondary,
  },
};

export const paperDarkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: BRAND.primary,
    secondary: BRAND.secondary,
  },
};

