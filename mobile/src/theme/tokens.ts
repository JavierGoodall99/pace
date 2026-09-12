// Design tokens ported from the Claude Design mockup at
// `../Pace App.dc.html` and its design-system bundle under `../_ds/`.

export const colors = {
  ink: '#0a0a0d',
  coal: '#0f0f14',
  ash: '#15151c',
  ember: '#ff4d2e',
  flare: '#ff8a6b',
  bone: '#f4f1ea',
  fog: '#8f8d97',
  line: 'rgba(244,241,234,0.09)',
  lineHover: 'rgba(244,241,234,0.25)',
  emberSoft: 'rgba(255,77,46,0.08)',
  emberBorder: 'rgba(255,77,46,0.3)',
} as const;

export const radius = {
  full: 9999,
  '3xl': 24,
  '2xl': 16,
  lg: 8,
} as const;

export const fonts = {
  display: 'Anton_400Regular',
  sans: 'Archivo_400Regular',
  sansMedium: 'Archivo_600SemiBold',
  mono: 'JetBrainsMono_400Regular',
  monoBold: 'JetBrainsMono_700Bold',
} as const;

export const spacing = {
  gutter: 20,
  safeAreaBottom: 34,
} as const;
