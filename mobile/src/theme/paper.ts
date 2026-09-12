// react-native-paper theme, mapped onto the app's existing dark design
// tokens in `./tokens` so Paper components match the rest of the UI.

import { MD3DarkTheme } from 'react-native-paper';
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
