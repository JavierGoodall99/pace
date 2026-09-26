import { depthFor } from './athleteDepth';
import { seeking } from './identity';
import { inRange, isActive } from './trust';
import { Compat, compatibility } from './compat';
import { dayIndex, nextDateFor } from './dates';
import { ATHLETES, Athlete, Discipline } from './mockData';
import { spotsFor } from './places';
import type { MeProfile } from './session';

// The pacer deck: everyone near you who fits (verified, recently active,
// mutual gender and age preferences), best training fit first, shown one
// card at a time. Swipe right to like, left to pass. A like on someone who
// already liked you is a match, and only matches can invite to train.
// The daily like budget (trust.LIKES_PER_DAY) keeps likes meaningful, so
// the deck itself doesn't need a daily cap. Standouts shows who's getting
// the most likes near you.

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

// Women see men and men see women. Before gender is answered, nothing
// is filtered.
export function wantEachOther(me: MeProfile, a: Athlete): boolean {
  const d = depthFor(a);
  const want = seeking(me.gender);
  if (want && d.gender !== want) return false;
  // Their age range has to include you too.
  const myAge = Number(me.age);
  if (myAge && !inRange(myAge, d.ageRange)) return false;
  return true;
}

// Only verified people who've actually trained recently make the drop.
export function isShowable(a: Athlete): boolean {
  return a.verified && isActive(depthFor(a));
}

function candidates(me: MeProfile, excluded: number[]): Athlete[] {
  const myFirst = me.name.trim().split(' ')[0];
  return ATHLETES.filter(
    (a) => !excluded.includes(a.id) && a.name !== myFirst && isShowable(a) && wantEachOther(me, a)
  );
}

// The whole deck, ranked by training fit. `excluded` is everyone who
// shouldn't appear: blocked, matched, already liked, recently passed, or
// outside your filters.
export function pacerDeck(me: MeProfile, excluded: number[], now: Date = new Date()): Pacer[] {
  return candidates(me, excluded)
    .map((athlete) => {
      const compat = compatibility(me, athlete);
      return { athlete, compat, suggestion: suggestSession(me, athlete, compat, now) };
    })
    .sort((x, y) => y.compat.score - x.compat.score);
}

// Most-liked people near you this week who'd also want to see you.
export function standouts(me: MeProfile, excluded: number[], limit = 4): Athlete[] {
  return candidates(me, excluded)
    .sort((x, y) => depthFor(y).likesThisWeek - depthFor(x).likesThisWeek)
    .slice(0, limit);
}
