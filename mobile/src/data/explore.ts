import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import { Challenge, CHALLENGES, CT_SPOTS } from './capeTown';
import { localDayKey } from './dates';
import { ATHLETES, Athlete } from './mockData';
import { isEligible, wantEachOther } from './pacers';
import type { MeProfile } from './session';
import { demo } from '../config';

// What you do in Explore: events you're going to, crews you follow,
// spots you've trained at (your Pace passport) and challenges you've
// joined. Local until a backend exists.

export interface Stamp {
  spotId: string;
  at: string; // ISO
}

export interface ExploreState {
  going: string[]; // event ids
  crews: string[]; // community ids
  stamps: Stamp[];
  challenges: string[];
}

const STORAGE_KEY = 'pace.explore.v1';
const EMPTY: ExploreState = { going: [], crews: [], stamps: [], challenges: [] };

let state: ExploreState = EMPTY;
const listeners = new Set<() => void>();

function setState(patch: Partial<ExploreState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
}

AsyncStorage.getItem(STORAGE_KEY)
  .then((raw) => {
    if (!raw) return;
    state = { ...EMPTY, ...(JSON.parse(raw) as Partial<ExploreState>) };
    listeners.forEach((l) => l());
  })
  .catch(() => {});

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useExplore(): ExploreState {
  return useSyncExternalStore(subscribe, () => state);
}

export function getExploreState(): ExploreState {
  return state;
}

export function resetExplore() {
  state = EMPTY;
  listeners.forEach((l) => l());
}

const toggle = (list: string[], id: string) =>
  list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

export function toggleGoing(eventId: string) {
  setState({ going: toggle(state.going, eventId) });
}

export function toggleCrew(communityId: string) {
  setState({ crews: toggle(state.crews, communityId) });
}

export function toggleChallenge(id: string) {
  setState({ challenges: toggle(state.challenges, id) });
}

// Stamps store a UTC timestamp; compare them by local calendar day.
const stampDay = (at: string) => localDayKey(new Date(at));

// One stamp per spot per (local) day.
export function stampSpot(spotId: string, now: Date = new Date()): boolean {
  const day = localDayKey(now);
  if (state.stamps.some((s) => s.spotId === spotId && stampDay(s.at) === day)) return false;
  setState({ stamps: [...state.stamps, { spotId, at: now.toISOString() }] });
  return true;
}

export function stampedToday(s: ExploreState, spotId: string, now: Date = new Date()): boolean {
  const day = localDayKey(now);
  return s.stamps.some((x) => x.spotId === spotId && stampDay(x.at) === day);
}

export function passport(s: ExploreState): { visited: number; total: number } {
  return { visited: new Set(s.stamps.map((x) => x.spotId)).size, total: CT_SPOTS.length };
}

// Progress this calendar month.
export function challengeProgress(c: Challenge, s: ExploreState, now: Date = new Date()): number {
  const month = localDayKey(now).slice(0, 7);
  const kindOf = (id: string) => CT_SPOTS.find((x) => x.id === id)?.kind;
  const counted = s.stamps
    .filter((x) => stampDay(x.at).slice(0, 7) === month)
    .filter((x) =>
      c.spotIds
        ? c.spotIds.includes(x.spotId)
        : c.kinds
          ? c.kinds.includes(kindOf(x.spotId)!)
          : true
    );
  const n = c.distinct ? new Set(counted.map((x) => x.spotId)).size : counted.length;
  return Math.min(n, c.goal);
}

export function completedChallenges(s: ExploreState, now: Date = new Date()): Challenge[] {
  return CHALLENGES.filter((c) => challengeProgress(c, s, now) >= c.goal);
}

// ── Who's going (mock) ──────────────────────────────────────────────
// Which Pace members said they're going / follow a crew. A backend
// would return these; the demo seeds a few so lists aren't empty.

export const EVENT_ATTENDEES: Record<string, number[]> = demo<Record<string, number[]>>(
  {
    'green-point-parkrun': [1, 8, 2, 5],
    'rondebosch-parkrun': [7, 4],
    'rlc-wednesday': [1, 8, 5, 3],
    'tuesday-trails-weekly': [3, 6, 8],
    'ppa-saturday': [2, 7],
    'utct-2026': [3, 6],
    'cycle-tour-2027': [2, 7, 4],
    'two-oceans-2027': [1, 8, 3, 5],
  },
  {}
);

export const CREW_MEMBERS: Record<string, number[]> = demo<Record<string, number[]>>(
  {
    'running-late-club': [1, 8, 5, 3],
    'tuesday-trails': [3, 6, 8],
    mustlovehills: [8, 1],
    notsofast: [5],
    'couch-potato': [],
    'social-runners': [2, 1],
    'atlantic-athletic': [8],
    'cold-water-social': [4, 7, 3],
    'swim-cape-town': [4, 7],
    'pedal-power': [2],
    'cycling-friends': [2, 7],
  },
  {}
);

export const CHALLENGE_MEMBERS: Record<string, number[]> = demo<Record<string, number[]>>(
  {
    'lions-head-4': [3, 1, 6],
    'spot-hopper': [8, 2, 5],
    'parkrun-3': [1, 8, 4],
    'cold-water-4': [4, 7],
    'mountain-3': [3, 6],
  },
  {}
);

export function athletesIn(ids: number[] | undefined): Athlete[] {
  return (ids ?? []).map((id) => ATHLETES.find((a) => a.id === id)!).filter(Boolean);
}

// People going who you'd actually see as pacers (eligible for your deck,
// the right gender and mutual age range) — the "pacers you might like"
// line that turns an events list into dating without swiping.
export function pacersAmong(
  me: MeProfile,
  ids: number[] | undefined,
  blocked: number[] = [],
  launch?: boolean
): Athlete[] {
  const myFirst = me.name.trim().split(' ')[0];
  return athletesIn(ids).filter(
    (a) =>
      !blocked.includes(a.id) && a.name !== myFirst && isEligible(a, launch) && wantEachOther(me, a)
  );
}
