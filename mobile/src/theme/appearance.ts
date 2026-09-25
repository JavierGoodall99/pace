import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import { useColorScheme } from 'react-native';
import { Palette, palettes } from './tokens';

// Appearance preference: follow the system, or force light/dark.
// Persisted so the choice survives restarts.

export type AppearancePreference = 'system' | 'light' | 'dark';
export type ColorScheme = 'light' | 'dark';

const STORAGE_KEY = 'pace.appearance.v1';

let preference: AppearancePreference = 'system';
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

AsyncStorage.getItem(STORAGE_KEY)
  .then((raw) => {
    if (raw === 'light' || raw === 'dark' || raw === 'system') {
      preference = raw;
      emit();
    }
  })
  .catch(() => {});

export function setAppearance(next: AppearancePreference) {
  if (next === preference) return;
  preference = next;
  emit();
  AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useAppearance(): { preference: AppearancePreference; scheme: ColorScheme } {
  const pref = useSyncExternalStore(subscribe, () => preference);
  const system = useColorScheme();
  const scheme: ColorScheme = pref === 'system' ? (system === 'dark' ? 'dark' : 'light') : pref;
  return { preference: pref, scheme };
}

// The current theme's palette, for colors used outside Tamagui styles
// (Icon strokes, SVG fills, Animated styles).
export function useColors(): Palette {
  return palettes[useAppearance().scheme];
}
