import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

// Privacy and notification preferences. Persisted locally so they survive
// a restart; a backend has to read these same fields to enforce them for
// other people (visibility, city, photos) and to decide what to send.

export type Visibility = 'EVERYONE' | 'MATCHES ONLY';

export interface PrivacySettings {
  visibility: Visibility;
  showStats: boolean;
  showCity: boolean;
  publicTrainingPhotos: boolean;
}

export type PushKey = 'likes' | 'messages' | 'matches' | 'invites' | 'reminders';
export type EmailKey = 'digest' | 'matchEmails' | 'product';

export interface AppSettings {
  privacy: PrivacySettings;
  push: Record<PushKey, boolean>;
  email: Record<EmailKey, boolean>;
}

export const DEFAULT_SETTINGS: AppSettings = {
  privacy: {
    visibility: 'EVERYONE',
    showStats: true,
    showCity: true,
    publicTrainingPhotos: false,
  },
  push: { likes: true, messages: true, matches: true, invites: true, reminders: false },
  email: { digest: true, matchEmails: false, product: false },
};

const STORAGE_KEY = 'pace.settings.v1';

let state: AppSettings = DEFAULT_SETTINGS;
// Changes made before hydration finishes are re-applied on top of what
// was stored, so an early tap is never overwritten by the load.
let pending: ((s: AppSettings) => AppSettings)[] = [];
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function resetSettings() {
  state = DEFAULT_SETTINGS;
  pending = [];
  emit();
}

function merge(saved: Partial<AppSettings> | null): AppSettings {
  return {
    privacy: { ...DEFAULT_SETTINGS.privacy, ...saved?.privacy },
    push: { ...DEFAULT_SETTINGS.push, ...saved?.push },
    email: { ...DEFAULT_SETTINGS.email, ...saved?.email },
  };
}

async function persist() {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to persist settings:', e);
  }
}

function apply(update: (s: AppSettings) => AppSettings) {
  state = update(state);
  if (!hydrated) pending.push(update);
  emit();
  persist();
}

export const settingsReady: Promise<void> = AsyncStorage.getItem(STORAGE_KEY)
  .then((raw) => (raw ? (JSON.parse(raw) as Partial<AppSettings>) : null))
  .catch(() => null)
  .then((saved) => {
    state = pending.reduce((s, fn) => fn(s), merge(saved));
    pending = [];
    hydrated = true;
    emit();
  });

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSettings(): AppSettings {
  return state;
}

export function useSettings(): AppSettings {
  return useSyncExternalStore(subscribe, getSettings);
}

export function setPrivacy(patch: Partial<PrivacySettings>) {
  apply((s) => ({ ...s, privacy: { ...s.privacy, ...patch } }));
}

export function setPush(key: PushKey, on: boolean) {
  apply((s) => ({ ...s, push: { ...s.push, [key]: on } }));
}

export function setEmail(key: EmailKey, on: boolean) {
  apply((s) => ({ ...s, email: { ...s.email, [key]: on } }));
}
