import { defaultConfig } from '@tamagui/config/v4';
import { createFont, createTamagui } from 'tamagui';
import { colors, fonts as fontFamilies, radius as appRadius, spacing } from './src/theme/tokens';

// Tamagui design tokens for the app's light theme (see
// `src/theme/tokens.ts`). The v4 config carries colors inside themes
// rather than tokens, so the palette is exposed as theme keys
// (`$accent`, `$card`, `$muted`, ...) that any Tamagui component can use.

const size = {
  1: 11,
  2: 12,
  3: 13,
  4: 14,
  5: 15,
  6: 16,
  7: 18,
  8: 20,
  9: 24,
  10: 28,
  11: 34,
  true: 15,
};

const lineHeight = {
  1: 15,
  2: 16,
  3: 18,
  4: 20,
  5: 22,
  6: 24,
  7: 26,
  8: 28,
  9: 30,
  10: 34,
  11: 40,
  true: 22,
};

// Each weight is its own family token (`$body`, `$medium`, `$semibold`,
// `$bold`, `$heading`) so screens never rely on synthetic bolding. The
// `face` map also lets a `fontWeight` prop on `$body` resolve to the
// right file on native.
const face = {
  400: { normal: fontFamilies.regular },
  500: { normal: fontFamilies.medium },
  600: { normal: fontFamilies.semibold },
  700: { normal: fontFamilies.bold },
  800: { normal: fontFamilies.extrabold },
};

function jakarta(family: string, weight: string) {
  return createFont({
    family,
    size,
    lineHeight,
    weight: { true: weight },
    letterSpacing: { true: 0 },
    face,
  });
}

const tokens = {
  ...defaultConfig.tokens,
  radius: {
    ...defaultConfig.tokens.radius,
    full: appRadius.full,
    '3xl': appRadius['3xl'],
    '2xl': appRadius['2xl'],
    xl: appRadius.xl,
    lg: appRadius.lg,
  },
  space: {
    ...defaultConfig.tokens.space,
    gutter: spacing.gutter,
    safeAreaBottom: spacing.safeAreaBottom,
  },
};

const light = {
  ...defaultConfig.themes.light,
  // Semantic roles mapped to the app's palette.
  background: colors.canvas,
  background0: colors.canvas,
  background02: colors.canvas,
  background04: colors.surface,
  background06: colors.card,
  background08: colors.card,
  backgroundHover: colors.surface,
  backgroundPress: colors.surface,
  backgroundFocus: colors.card,
  borderColor: colors.border,
  borderColorHover: colors.borderStrong,
  borderColorPress: colors.borderStrong,
  borderColorFocus: colors.accent,
  color: colors.text,
  colorHover: colors.text,
  colorPress: colors.text,
  colorFocus: colors.text,
  placeholderColor: colors.muted,
  outlineColor: colors.accentBorder,
  shadowColor: colors.text,
  accentBackground: colors.accent,
  accentColor: colors.onAccent,
  // Palette, exposed as theme keys for direct use in styles.
  canvas: colors.canvas,
  card: colors.card,
  surface: colors.surface,
  border: colors.border,
  borderStrong: colors.borderStrong,
  text: colors.text,
  muted: colors.muted,
  onAccent: colors.onAccent,
  onPhoto: colors.onPhoto,
  accent: colors.accent,
  accentSoft: colors.accentSoft,
  accentBorder: colors.accentBorder,
  success: colors.success,
  successSoft: colors.successSoft,
  scrim: colors.scrim,
  glass: colors.glass,
};

export const config = createTamagui({
  ...defaultConfig,
  tokens,
  fonts: {
    ...defaultConfig.fonts,
    body: jakarta(fontFamilies.regular, '400'),
    medium: jakarta(fontFamilies.medium, '500'),
    semibold: jakarta(fontFamilies.semibold, '600'),
    bold: jakarta(fontFamilies.bold, '700'),
    heading: jakarta(fontFamilies.extrabold, '800'),
  },
  themes: {
    ...defaultConfig.themes,
    light,
  },
});

export type AppConfig = typeof config;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;
