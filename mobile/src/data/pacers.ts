import { depthFor } from './athleteDepth';
import { Compat, compatibility } from './compat';
import { dayIndex, nextDateFor } from './dates';
import { ATHLETES, Athlete, Discipline } from './mockData';
import { spotsFor } from './places';
import type { MeProfile } from './session';

// The daily drop: instead of an endless swipe deck, Pace hands you a
// handful of people who fit your training, each with a session already
// suggested. A fresh drop lands every morning at 07:00, and Standouts
// shows who's getting the most likes near you.

export const DROP_SIZE = 5;

export interface Suggestion {
  activity: Discipline;
  date: Date;
  time: string;
  place: string;
}

const TIME_SLOT: Record<string, string> = {
  'EARLY MORNING': '06:00',
  MIDDAY: '12:30',
  EVENING: '17:30',
  WEEKENDS: '08:00',
};

export function suggestSession(
  me: MeProfile,
  a: Athlete,
  c: Compat,
  now: Date = new Date()
): Suggestion {
  const depth = depthFor(a);
  const sharedTime =
    me.times.find((t) => depth.times.includes(t)) ?? depth.times[0] ?? 'EARLY MORNING';
  const time = TIME_SLOT[sharedTime] ?? '06:00';
  // Soonest shared day; otherwise the soonest day they train.
  const today = dayIndex(now);
  const candidates = c.sharedDayIdx.length
    ? c.sharedDayIdx
    : c.theirs.map((on, i) => (on ? i : -1)).filter((i) => i >= 0);
  const pick =
    [...candidates].sort((x, y) => ((x - today + 7) % 7) - ((y - today + 7) % 7))[0] ?? 5;
  return {
    activity: a.discipline,
    date: nextDateFor(pick, time, now),
    time,
    place: spotsFor(a.city, a.discipline)[0]?.name ?? 'A public spot you both know',
  };
}

export interface Pacer {
  athlete: Athlete;
  compat: Compat;
  suggestion: Suggestion;
}

// Mutual "show me": you want to see them and they want to see you.
// Unanswered preferences (null) don't filter.
export function wantEachOther(me: MeProfile, a: Athlete): boolean {
  const d = depthFor(a);
  if (me.showMe && me.showMe.length && !me.showMe.includes(d.gender)) return false;
  if (me.gender && !d.showMe.includes(me.gender)) return false;
  return true;
}

function candidates(me: MeProfile, excluded: number[]): Athlete[] {
  const myFirst = me.name.trim().split(' ')[0];
  return ATHLETES.filter(
    (a) => !excluded.includes(a.id) && a.name !== myFirst && wantEachOther(me, a)
  );
}

export function dailyPacers(me: MeProfile, excluded: number[], now: Date = new Date()): Pacer[] {
  return candidates(me, excluded)
    .map((athlete) => {
      const compat = compatibility(me, athlete);
      return { athlete, compat, suggestion: suggestSession(me, athlete, compat, now) };
    })
    .sort((x, y) => y.compat.score - x.compat.score)
    .slice(0, DROP_SIZE);
}

// Most-liked people near you this week who'd also want to see you.
export function standouts(me: MeProfile, excluded: number[], limit = 4): Athlete[] {
  return candidates(me, excluded)
    .sort((x, y) => depthFor(y).likesThisWeek - depthFor(x).likesThisWeek)
    .slice(0, limit);
}
