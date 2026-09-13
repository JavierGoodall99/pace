import { useSyncExternalStore } from 'react';

// Discover deck filters, shared between the Discover screen and the
// filter modal. Stored in memory only — nothing here is persisted (it
// resets with the app), which is fine until a backend owns discovery.

export interface DiscoverFilterState {
  ageMin: number;
  ageMax: number;
  radiusKm: number | null; // null = anywhere
  verifiedOnly: boolean;
  times: string[];
}

export const RADIUS_OPTIONS: { label: string; km: number }[] = [
  { label: '5KM', km: 5 },
  { label: '10KM', km: 10 },
  { label: '25KM', km: 25 },
  { label: '50KM', km: 50 },
];

export const AVAILABILITY_OPTIONS = ['EARLY MORNING', 'MIDDAY', 'EVENING', 'WEEKENDS'];

export const AGE_RANGE = { min: 18, max: 60 };

const DEFAULT_FILTERS: DiscoverFilterState = {
  ageMin: 18,
  ageMax: 60,
  radiusKm: null,
  verifiedOnly: false,
  times: [],
};

let state: DiscoverFilterState = DEFAULT_FILTERS;
const listeners = new Set<() => void>();

function setState(patch: Partial<DiscoverFilterState>) {
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

// Mock radius → cities. The athletes carry cities but no coordinates,
// and the user defaults to Pretoria, so distances are approximated as
// city groups for the demo. Remove once real location data exists.
const RADIUS_CITIES: Record<number, string[]> = {
  5: ['Pretoria'],
  10: ['Pretoria', 'Johannesburg'],
  25: ['Pretoria', 'Johannesburg', 'Durban'],
  50: ['Pretoria', 'Johannesburg', 'Durban', 'Cape Town'],
};

export function cityWithinRadius(city: string, radiusKm: number | null): boolean {
  if (radiusKm == null) return true;
  const cities = RADIUS_CITIES[radiusKm];
  return cities ? cities.includes(city) : true;
}