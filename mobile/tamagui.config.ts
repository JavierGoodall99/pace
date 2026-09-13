import { defaultConfig } from '@tamagui/config/v4';
import { createFont, createTamagui } from 'tamagui';
import { colors, fonts as fontFamilies, radius as appRadius, spacing } from './src/theme/tokens';

// Tamagui design tokens, themed onto the app's existing dark design
// (see `src/theme/tokens.ts`). The v4 config carries colors inside
// themes rather than tokens, so the brand palette is exposed as theme
// keys (`$ember`, `$coal`, ...) that any Tamagui component can use.

const displayFont = createFont({
  family: fontFamilies.display,
  size: {
    1: 24,
    2: 28,
    3: 32,
    4: 40,
    5: 48,
    6: 60,
    7: 72,
    8: 92,
    9: 114,
    true: 32,
  },
  lineHeight: {
    1: 24,
    2: 28,
    3: 32,
    4: 40,
    5: 48,
    6: 60,
    7: 72,
    8: 92,
    9: 114,
    true: 32,
  },
  weight: {
    400: '400',
  },
  letterSpacing: {
    0: 0,
  },
  face: {
    400: { normal: fontFamilies.display },
  },
});

const bodyFont = createFont({
  family: fontFamilies.sans,
  size: {
    1: 11,
    2: 12,
    3: 13,
    4: 14,
    5: 16,
    6: 18,
    7: 20,
    8: 23,
    9: 30,
    10: 46,
    true: 14,
  },
  lineHeight: {
    1: 16,
    2: 17,
    3: 18,
    4: 20,
    5: 23,
    6: 26,
    7: 29,
    8: 33,
    9: 42,
    10: 62,
    true: 20,
  },
  weight: {
    1: '400',
    2: '400',
    3: '400',
    4: '400',
    5: '400',
    6: '400',
    7: '400',
    8: '400',
    9: '400',
    10: '400',
    true: '400',
  },
  letterSpacing: {
    0: 0,
  },
  face: {
    400: { normal: fontFamilies.sans },
    600: { normal: fontFamilies.sansMedium },
    700: { normal: fontFamilies.sansMedium },
  },
});

const monoFont = createFont({
  family: fontFamilies.mono,
  size: {
    1: 8,
    2: 9,
    3: 10,
    4: 11,
    5: 12,
    6: 14,
    7: 16,
    8: 18,
    9: 21,
    10: 24,
    true: 11,
  },
  lineHeight: {
    1: 12,
    2: 14,
    3: 15,
    4: 16,
    5: 18,
    6: 21,
    7: 24,
    8: 27,
    9: 31,
    10: 36,
    true: 16,
  },
  weight: {
    1: '400',
    2: '400',
    3: '400',
    4: '400',
    5: '400',
    6: '400',
    7: '400',
    8: '400',
    9: '400',
    10: '400',
    true: '400',
  },
  letterSpacing: {
    0: 0,
  },
  face: {
    400: { normal: fontFamilies.mono },
    700: { normal: fontFamilies.monoBold },
  },
});

const tokens = {
  ...defaultConfig.tokens,
  radius: {
    ...defaultConfig.tokens.radius,
    full: appRadius.full,
    '3xl': appRadius['3xl'],
    '2xl': appRadius['2xl'],
    lg: appRadius.lg,
  },
  space: {
    ...defaultConfig.tokens.space,
    gutter: spacing.gutter,
    safeAreaBottom: spacing.safeAreaBottom,
  },
};

const dark = {
  ...defaultConfig.themes.dark,
  // Semantic roles mapped to the app's dark design.
  background: colors.ink,
  background0: colors.ink,
  background02: colors.ink,
  background04: colors.coal,
  background06: colors.ash,
  background08: colors.ash,
  backgroundHover: colors.ash,
  backgroundPress: colors.ash,
  backgroundFocus: colors.coal,
  borderColor: colors.line,
  borderColorHover: colors.lineHover,
  borderColorPress: colors.lineHover,
  borderColorFocus: colors.lineHover,
  color: colors.bone,
  colorHover: colors.bone,
  colorPress: colors.bone,
  colorFocus: colors.bone,
  placeholderColor: colors.fog,
  outlineColor: colors.lineHover,
  shadowColor: '#000000',
  accentBackground: colors.ember,
  accentColor: colors.bone,
  // Brand palette, exposed as theme keys for direct use in styles.
  ink: colors.ink,
  coal: colors.coal,
  ash: colors.ash,
  ember: colors.ember,
  flare: colors.flare,
  mint: colors.mint,
  bone: colors.bone,
  fog: colors.fog,
  line: colors.line,
  lineHover: colors.lineHover,
  emberSoft: colors.emberSoft,
  emberBorder: colors.emberBorder,
};

export const config = createTamagui({
  ...defaultConfig,
  tokens,
  fonts: {
    ...defaultConfig.fonts,
    display: displayFont,
    body: bodyFont,
    mono: monoFont,
  },
  themes: {
    ...defaultConfig.themes,
    dark,
  },
});

export type AppConfig = typeof config;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;