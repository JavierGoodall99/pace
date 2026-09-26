// Design tokens for Pace. Two palettes — a warm off-white light theme
// and a warm near-black dark theme — share the same semantic keys, so
// screens read as `$text on $card` and switch themes for free. Tamagui
// styles use the `$key` theme values; JS-side colors (icons, SVG,
// Animated styles) come from `useColors()` in `./appearance`.

const lightPalette = {
  // Surfaces
  canvas: '#FAF8F6', // screen background
  card: '#FFFFFF', // raised cards, sheets, tab bar
  surface: '#F3EFEB', // quiet fills: chips, inputs, icon wells
  border: '#ECE7E2',
  borderStrong: '#DCD5CE',

  // Text
  text: '#1C1917',
  muted: '#6F6863', // secondary copy — 5:1 on canvas
  onAccent: '#FFFFFF',
  onPhoto: '#FFFFFF', // copy sitting on a photo scrim

  // Brand
  accent: '#CF4A12', // ember orange fills — 4.5:1 against white text
  accentText: '#C2410C', // accent-colored copy on canvas/card — 4.9:1
  accentSoft: '#FDEEE5',
  accentBorder: '#F8D0BA',

  // Status
  success: '#178A5B',
  successSoft: '#E3F4EC',

  // Photo scrim and floating controls over images
  scrim: 'rgba(28,25,23,0.55)',
  glass: 'rgba(255,255,255,0.88)',
  tabBar: '#FFFFFF',
  raised: '#FFFFFF', // selected segment / thumb sitting on a surface

  // Celebration / aurora accents
  peach: '#FFB38A',
  sky: '#9CC9DC',
  sun: '#FFD166',
  auroraOpacity: 0.55,
};

export type Palette = { [K in keyof typeof lightPalette]: (typeof lightPalette)[K] };

const darkPalette: Palette = {
  canvas: '#131211',
  card: '#1D1B1A',
  surface: '#282624',
  border: '#2F2C2A',
  borderStrong: '#45413D',

  text: '#F5F0EC',
  muted: '#A8A09B', // 7:1 on canvas
  onAccent: '#FFFFFF',
  onPhoto: '#FFFFFF',

  accent: '#CF4A12',
  accentText: '#FF7A45', // 7:1 on canvas
  accentSoft: '#3A2218',
  accentBorder: '#5E3421',

  success: '#3CCB8A',
  successSoft: '#15302A',

  scrim: 'rgba(0,0,0,0.6)',
  glass: 'rgba(29,27,26,0.82)',
  tabBar: '#211F1D',
  raised: '#3D3A37',

  peach: '#FF9E70',
  sky: '#6FA9C2',
  sun: '#FFC94D',
  auroraOpacity: 0.35,
};

export const palettes = { light: lightPalette, dark: darkPalette } as const;

// Theme-independent brand colors for module-level constants (confetti,
// glows) that can't read the current theme.
export const brand = {
  accent: lightPalette.accent,
  peach: lightPalette.peach,
  sky: lightPalette.sky,
  sun: lightPalette.sun,
} as const;

export const radius = {
  full: 9999,
  '3xl': 28,
  '2xl': 20,
  xl: 16,
  lg: 12,
} as const;

// Plus Jakarta Sans for UI — friendly and highly legible, each weight
// registered as its own face so it renders the same on every platform —
// paired with Instrument Serif for editorial display headlines.
export const fonts = {
  display: 'InstrumentSerif_400Regular',
  displayItalic: 'InstrumentSerif_400Regular_Italic',
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
} as const;

export const spacing = {
  gutter: 20,
  safeAreaBottom: 34,
} as const;

// Soft, diffuse card shadow — gives white cards lift on the warm canvas
// without a heavy outline.
export const shadow = {
  card: {
    shadowColor: '#1C1917',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  raised: {
    shadowColor: '#1C1917',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
} as const;

// The data layer stores labels as SHOUTY constants ('RUNNING',
// 'EARLY MORNING', '4-5X/WK'). Screens run them through this before
// display so the UI stays in sentence case without migrating stored
// values.
const LABEL_OVERRIDES: Record<string, string> = {
  CROSSFIT: 'CrossFit',
  '2-3X/WK': '2–3× a week',
  '4-5X/WK': '4–5× a week',
  '6+X/WK': '6+× a week',
  'TRI BRICK': 'Tri brick',
  WOD: 'WOD',
};

export function formatLabel(value: string): string {
  if (LABEL_OVERRIDES[value]) return LABEL_OVERRIDES[value];
  // Leave anything that's already mixed case alone.
  if (value !== value.toUpperCase()) return value;
  const lower = value.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}
