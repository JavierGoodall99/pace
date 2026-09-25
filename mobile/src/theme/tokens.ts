// Design tokens for Pace's light theme: a warm off-white canvas, white
// cards, soft neutral borders and a single rose accent. Names are
// semantic (what a color is for), not descriptive, so screens read as
// `$text on $card` rather than hard-coding a palette.

export const colors = {
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
  accent: '#D6336C', // 4.6:1 against white text
  accentSoft: '#FCEAF0',
  accentBorder: '#F6C9D8',

  // Status
  success: '#178A5B',
  successSoft: '#E3F4EC',

  // Photo scrim and floating controls over images
  scrim: 'rgba(28,25,23,0.55)',
  glass: 'rgba(255,255,255,0.88)',

  // Celebration accents (confetti, match screen)
  peach: '#FFB38A',
  lilac: '#B9A6F5',
  sun: '#FFD166',
} as const;

export const radius = {
  full: 9999,
  '3xl': 28,
  '2xl': 20,
  xl: 16,
  lg: 12,
} as const;

// Plus Jakarta Sans throughout — one friendly, highly legible family,
// with each weight registered as its own font face so it renders the
// same on iOS, Android and web.
export const fonts = {
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
