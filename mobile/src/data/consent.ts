import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import { track } from '../lib/analytics';

// Consent for health and biometric processing, recorded on the phone
// (what, when, which wording version) so it can move to the server later.
// Bump a version when its wording changes: people are asked again.

export type ConsentKind = 'health' | 'biometric';

export const CONSENT_VERSION: Record<ConsentKind, number> = { health: 1, biometric: 1 };

export interface ConsentRecord {
  kind: ConsentKind;
  version: number;
  at: string; // ISO
  accepted: boolean;
}

const STORAGE_KEY = 'pace.consent.v1';

let records: ConsentRecord[] = [];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

AsyncStorage.getItem(STORAGE_KEY)
  .then((raw) => {
    if (!raw) return;
    // Keep anything recorded before the load finished.
    records = [...(JSON.parse(raw) as ConsentRecord[]), ...records];
    emit();
  })
  .catch(() => {});

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useConsents(): ConsentRecord[] {
  return useSyncExternalStore(subscribe, () => records);
}

export function getConsents(): ConsentRecord[] {
  return records;
}

// Has the current wording been accepted (and not declined since)?
export function hasConsent(kind: ConsentKind, list: ConsentRecord[] = records): boolean {
  const latest = [...list].reverse().find((r) => r.kind === kind);
  return !!latest && latest.accepted && latest.version === CONSENT_VERSION[kind];
}

export function recordConsent(kind: ConsentKind, accepted: boolean, now: Date = new Date()) {
  records = [...records, { kind, version: CONSENT_VERSION[kind], at: now.toISOString(), accepted }];
  emit();
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(records)).catch(() => {});
  track(accepted ? 'consent_accepted' : 'consent_declined', { kind });
}

export function resetConsents() {
  records = [];
  emit();
}
