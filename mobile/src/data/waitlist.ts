import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

// Pace is Cape Town only for now. People from other cities leave their
// email and we tell them when Pace launches there.
//
// Local mock: signups are kept on this device. A real build posts each
// one to the backend (e.g. a `waitlist` table) so the team can email
// people per city at launch.

export interface WaitlistEntry {
  email: string;
  city: string;
  at: string; // ISO
}

const STORAGE_KEY = 'pace.waitlist.v1';

let entries: WaitlistEntry[] = [];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function resetWaitlist() {
  entries = [];
  emit();
}

export const waitlistReady: Promise<void> = AsyncStorage.getItem(STORAGE_KEY)
  .then((raw) => {
    if (raw) {
      const saved = JSON.parse(raw) as WaitlistEntry[];
      // Keep anything added before the load finished.
      const keys = new Set(entries.map(keyOf));
      entries = [...saved.filter((e) => !keys.has(keyOf(e))), ...entries];
      emit();
    }
  })
  .catch(() => {});

const keyOf = (e: Pick<WaitlistEntry, 'email' | 'city'>) =>
  `${e.email.toLowerCase()}|${e.city.toLowerCase()}`;

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useWaitlist(): WaitlistEntry[] {
  return useSyncExternalStore(subscribe, () => entries);
}

export function getWaitlist(): WaitlistEntry[] {
  return entries;
}

export function isOnWaitlist(email: string, city: string, list = entries): boolean {
  return list.some((e) => keyOf(e) === keyOf({ email: email.trim(), city: city.trim() }));
}

export type WaitlistResult = { ok: true } | { ok: false; error: string };

export async function joinWaitlist(email: string, city: string): Promise<WaitlistResult> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanCity = city.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { ok: false, error: 'Enter a valid email.' };
  }
  if (!cleanCity) return { ok: false, error: 'Tell us which city you’re in.' };
  if (!isOnWaitlist(cleanEmail, cleanCity)) {
    entries = [...entries, { email: cleanEmail, city: cleanCity, at: new Date().toISOString() }];
    emit();
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (e) {
      console.warn('Failed to save waitlist signup:', e);
    }
  }
  return { ok: true };
}
