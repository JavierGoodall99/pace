// react-native-paper theme, mapped onto the app's existing dark design
// tokens in `./tokens` so Paper components match the rest of the UI.

import { MD3DarkTheme, useTheme } from 'react-native-paper';
import { colors, fonts } from './tokens';

export const paperTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.ember,
    onPrimary: colors.bone,
    secondary: colors.flare,
    onSecondary: colors.ink,
    tertiary: colors.mint,
    onTertiary: colors.ink,
    background: colors.ink,
    onBackground: colors.bone,
    surface: colors.coal,
    onSurface: colors.bone,
    surfaceVariant: colors.ash,
    onSurfaceVariant: colors.fog,
    outline: colors.line,
    outlineVariant: colors.lineHover,
    elevation: {
      ...MD3DarkTheme.colors.elevation,
      level0: 'transparent',
      level1: colors.coal,
      level2: colors.ash,
      level3: colors.ash,
      level4: colors.ash,
      level5: colors.ash,
    },
  },
  fonts: {
    ...MD3DarkTheme.fonts,
    default: {
      ...MD3DarkTheme.fonts.default,
      fontFamily: fonts.sans,
    },
  },
};

// Advanced theme override (https://callstack.github.io/react-native-paper/docs/guides/theming#advanced-theme-overrides):
// paperTheme's shape differs from Paper's built-in theme (custom colors
// above), so `useTheme()` alone would type those fields as `any`/missing.
// This hook types every screen/component's `useAppTheme()` call as
// `AppTheme` instead, in one place.
export type AppTheme = typeof paperTheme;

export const useAppTheme = () => useTheme<AppTheme>();
