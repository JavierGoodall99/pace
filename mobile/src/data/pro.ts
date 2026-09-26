import { useSyncExternalStore } from 'react';
import { PRO_EXTRA_PICKS } from '../config';
import { DAILY_PICKS } from './picks';

// What Pace Pro adds. Shown on Your plan and the onboarding paywall.
// Only list what's built: more to come once it exists.
export const PRO_FEATURES = [
  `${PRO_EXTRA_PICKS} extra daily picks (${DAILY_PICKS + PRO_EXTRA_PICKS} a day)`,
];

// Whether this account has Pro. Set from RevenueCat's customer info (see
// lib/purchases.ts); false until it says otherwise.
let pro = false;
const listeners = new Set<() => void>();

export function setPro(next: boolean) {
  if (pro === next) return;
  pro = next;
  listeners.forEach((l) => l());
}

export function useIsPro(): boolean {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => pro
  );
}

export function picksPerDay(isPro: boolean): number {
  return DAILY_PICKS + (isPro ? PRO_EXTRA_PICKS : 0);
}
