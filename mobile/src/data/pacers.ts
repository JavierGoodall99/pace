import { depthFor } from './athleteDepth';
import { Compat, compatibility } from './compat';
import { dayIndex, nextDateFor } from './dates';
import { ATHLETES, Athlete, Discipline } from './mockData';
import { spotsFor } from './places';
import type { MeProfile } from './session';

// The weekly drop: instead of an endless swipe deck, Pace hands you a
// handful of people who fit *this week's* training, each with a session
// already suggested. Lands Sunday evening, when athletes plan the week.

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

export function weeklyPacers(me: MeProfile, blocked: number[], now: Date = new Date()): Pacer[] {
  const myFirst = me.name.trim().split(' ')[0];
  return ATHLETES.filter((a) => !blocked.includes(a.id) && a.name !== myFirst)
    .map((athlete) => {
      const compat = compatibility(me, athlete);
      return { athlete, compat, suggestion: suggestSession(me, athlete, compat, now) };
    })
    .sort((x, y) => y.compat.score - x.compat.score)
    .slice(0, DROP_SIZE);
}
