import { defaultConfig } from '@tamagui/config/v4';
import { createFont, createTamagui } from 'tamagui';
import {
  fonts as fontFamilies,
  Palette,
  palettes,
  radius as appRadius,
  spacing,
} from './src/theme/tokens';

// Tamagui design tokens for the app's light and dark themes (see
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

// Instrument Serif for editorial display headlines. Single weight; the
// italic is its own family so `*emphasis*` in titles can switch to it.
function serif(family: string) {
  return createFont({
    family,
    size: { ...size, 12: 40, 13: 48, 14: 56, true: 40 },
    lineHeight: { ...lineHeight, 12: 44, 13: 52, 14: 58, true: 44 },
    weight: { true: '400' },
    letterSpacing: { true: 0 },
    face: { 400: { normal: family } },
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

function buildTheme(base: typeof defaultConfig.themes.light, c: Palette) {
  return {
    ...base,
    // Semantic roles mapped to the app's palette.
    background: c.canvas,
    background0: c.canvas,
    background02: c.canvas,
    background04: c.surface,
    background06: c.card,
    background08: c.card,
    backgroundHover: c.surface,
    backgroundPress: c.surface,
    backgroundFocus: c.card,
    borderColor: c.border,
    borderColorHover: c.borderStrong,
    borderColorPress: c.borderStrong,
    borderColorFocus: c.accent,
    color: c.text,
    colorHover: c.text,
    colorPress: c.text,
    colorFocus: c.text,
    placeholderColor: c.muted,
    outlineColor: c.accentBorder,
    shadowColor: '#000000',
    accentBackground: c.accent,
    accentColor: c.onAccent,
    // Palette, exposed as theme keys for direct use in styles.
    canvas: c.canvas,
    card: c.card,
    surface: c.surface,
    border: c.border,
    borderStrong: c.borderStrong,
    text: c.text,
    muted: c.muted,
    onAccent: c.onAccent,
    onPhoto: c.onPhoto,
    accent: c.accent,
    accentText: c.accentText,
    accentSoft: c.accentSoft,
    accentBorder: c.accentBorder,
    success: c.success,
    successSoft: c.successSoft,
    scrim: c.scrim,
    glass: c.glass,
    tabBar: c.tabBar,
    raised: c.raised,
  };
}

const light = buildTheme(defaultConfig.themes.light, palettes.light);
const dark = buildTheme(defaultConfig.themes.dark, palettes.dark);

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
    display: serif(fontFamilies.display),
    displayItalic: serif(fontFamilies.displayItalic),
  },
  themes: {
    ...defaultConfig.themes,
    light,
    dark,
  },
});

export type AppConfig = typeof config;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;
