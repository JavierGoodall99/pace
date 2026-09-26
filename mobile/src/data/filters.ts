import { useSyncExternalStore } from 'react';
import { DEFAULT_RADIUS_KM, defaultAgeRange } from './trust';

// Discover deck filters, shared between the Discover screen and the
// filter modal. Stored in memory only — nothing here is persisted (it
// resets with the app), which is fine until a backend owns discovery.

export interface DiscoverFilterState {
  // When ageAuto is on, the range follows your own age (see
  // defaultAgeRange); moving a slider switches it off.
  ageAuto: boolean;
  ageMin: number;
  ageMax: number;
  radiusKm: number | null; // null = anywhere
  // Empty = any time. Otherwise only people who train at one of these.
  times: string[];
}

export const RADIUS_OPTIONS: { label: string; km: number }[] = [
  { label: '25KM', km: 25 },
  { label: '50KM', km: 50 },
  { label: '80KM', km: 80 },
  { label: '150KM', km: 150 },
];

export const AVAILABILITY_OPTIONS = ['EARLY MORNING', 'MIDDAY', 'EVENING', 'WEEKENDS'];

export const AGE_RANGE = { min: 18, max: 60 };

export const DEFAULT_FILTERS: DiscoverFilterState = {
  ageAuto: true,
  ageMin: 18,
  ageMax: 60,
  radiusKm: DEFAULT_RADIUS_KM,
  times: [],
};

let state: DiscoverFilterState = DEFAULT_FILTERS;
const listeners = new Set<() => void>();

function setState(patch: Partial<DiscoverFilterState>) {
  const changed = (Object.keys(patch) as (keyof DiscoverFilterState)[]).some(
    (k) => patch[k] !== state[k]
  );
  if (!changed) return;
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

function getSnapshot(): DiscoverFilterState {
  return state;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useFilters(): DiscoverFilterState {
  return useSyncExternalStore(subscribe, getSnapshot);
}

export function setFilters(patch: Partial<DiscoverFilterState>) {
  setState(patch);
}

export function resetFilters() {
  setState(DEFAULT_FILTERS);
}

// The age window actually applied.
export function ageWindow(f: DiscoverFilterState, myAge: string): [number, number] {
  return f.ageAuto ? defaultAgeRange(Number(myAge) || null) : [f.ageMin, f.ageMax];
}
