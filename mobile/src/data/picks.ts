import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import { depthFor } from './athleteDepth';
import { COMMUNITIES } from './capeTown';
import type { Compat } from './compat';
import { DAY } from './dates';
import { CREW_MEMBERS } from './explore';
import type { Athlete } from './mockData';
import { raceById } from './races';
import type { MeProfile } from './session';

// Daily picks: a handful of people a day, each with a reason, instead of
// an endless deck. Picked at the 07:00 drop from the ranked deck and kept
// for the day, so liking or passing doesn't pull in someone new — the
// next picks come with the next drop.

export const DAILY_PICKS = 5;

interface PicksState {
  day: string | null; // dropKey the picks belong to
  ids: number[];
  // The allowance they were picked with (more with Pro).
  size: number;
  ready: boolean;
}

// v2: picks re-drawn once after the demo cast grew.
const STORAGE_KEY = 'pace.picks.v2';

let state: PicksState = { day: null, ids: [], size: DAILY_PICKS, ready: false };
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

AsyncStorage.getItem(STORAGE_KEY)
  .then((raw) => {
    const saved = raw ? (JSON.parse(raw) as Partial<PicksState>) : null;
    state = {
      day: saved?.day ?? null,
      ids: saved?.ids ?? [],
      size: saved?.size ?? DAILY_PICKS,
      ready: true,
    };
    emit();
  })
  .catch(() => {
    state = { ...state, ready: true };
    emit();
  });

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function usePicksState(): PicksState {
  return useSyncExternalStore(subscribe, () => state);
}

export function savePicks(day: string, ids: number[], size: number = state.size) {
  if (state.day === day && state.ids.join() === ids.join() && state.size === size) return;
  state = { ...state, day, ids, size };
  emit();
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ day, ids, size })).catch(() => {});
}

// Bring people back into today's picks (e.g. "See the people you passed").
export function addToPicks(day: string, ids: number[]) {
  const base = state.day === day ? state.ids : [];
  savePicks(day, [...base, ...ids.filter((id) => !base.includes(id))]);
}

export function resetPicks() {
  state = { day: null, ids: [], size: DAILY_PICKS, ready: true };
  emit();
}

// Today's picks: the saved ones if they're for today, otherwise the top
// of the ranked deck. Only a bigger allowance (upgrading to Pro mid-day)
// tops them up; people joining later wait for tomorrow's drop.
export function choosePicks(
  rankedIds: number[],
  saved: { day: string | null; ids: number[]; size?: number },
  today: string,
  n: number = DAILY_PICKS
): number[] {
  if (saved.day !== today) return rankedIds.slice(0, n);
  const extra = n - (saved.size ?? DAILY_PICKS);
  if (extra <= 0) return saved.ids;
  const more = rankedIds.filter((id) => !saved.ids.includes(id));
  return [...saved.ids, ...more.slice(0, extra)];
}

const TIME_REASON: Record<string, string> = {
  'EARLY MORNING': 'Also an early bird',
  MIDDAY: 'Also trains at lunch',
  EVENING: 'Also trains after work',
  WEEKENDS: 'Also trains weekends',
};

// One short line on why this person is today's pick, from what you
// actually share: a race, a crew, training days, time of day.
export function pickReason(
  me: MeProfile,
  a: Athlete,
  compat: Pick<Compat, 'sharedDayIdx'>,
  followedCrews: string[]
): string {
  const d = depthFor(a);
  const reasons: string[] = [];

  const race = me.goalRaceId && d.goalRaceId === me.goalRaceId ? raceById(me.goalRaceId) : null;
  if (race) reasons.push(`Training for ${race.name} too`);

  const crew = COMMUNITIES.find(
    (c) => followedCrews.includes(c.id) && CREW_MEMBERS[c.id]?.includes(a.id)
  );
  if (crew) reasons.push(`Also runs with ${crew.name}`);

  const days = compat.sharedDayIdx.map((i) => DAY[i]);
  if (days.length > 2) reasons.push(`Shares ${days.length} training days`);
  else if (days.length) reasons.push(`Same ${days.join(' & ')} sessions`);

  const time = me.times.find((t) => d.times.includes(t));
  if (time && TIME_REASON[time]) reasons.push(TIME_REASON[time]);

  return reasons.slice(0, 2).join(' · ') || 'Trains close to you';
}
