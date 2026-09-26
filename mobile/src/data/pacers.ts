import { depthFor } from './athleteDepth';
import { seeking } from './identity';
import { LAUNCH_MODE, RANK_WEIGHTS } from '../config';
import { ACTIVE_DAYS, inRange, isActive } from './trust';
import { Compat, compatibility } from './compat';
import { dayIndex, nextDateFor } from './dates';
import { ATHLETES, Athlete, Discipline } from './mockData';
import { spotsFor } from './places';
import type { Intent, MeProfile } from './session';

// The pacer deck: everyone near you who fits (verified, recently active,
// mutual gender and age preferences), best training fit first, shown one
// card at a time. Swipe right to like, left to pass. A like on someone who
// already liked you is a match, and only matches can invite to train.
// The daily like budget (trust.LIKES_PER_DAY) keeps likes meaningful, so
// the deck itself doesn't need a daily cap.

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

const wantsPartner = (i: Intent | null) => i === 'partner' || i === 'both';

// Dates are women with men. Training partners can be anyone, but only
// when both people are here for a training partner ('partner' or
// 'both') — nobody looking only for love sees their own gender. Before
// gender is answered, nothing is filtered.
export function wantEachOther(me: MeProfile, a: Athlete): boolean {
  const d = depthFor(a);
  const want = seeking(me.gender);
  if (want && d.gender !== want && !(wantsPartner(me.intent) && wantsPartner(d.intent)))
    return false;
  // Their age range has to include you too.
  const myAge = Number(me.age);
  if (myAge && !inRange(myAge, d.ageRange)) return false;
  return true;
}

// How you'd meet: as training partners when you're the same gender, or
// when either of you is only here for a training partner.
export function matchKind(me: MeProfile, a: Athlete): 'date' | 'partner' {
  const d = depthFor(a);
  if (me.gender && d.gender === me.gender) return 'partner';
  return me.intent === 'partner' || d.intent === 'partner' ? 'partner' : 'date';
}

// The strict rule: verified people who've actually trained recently.
export function isShowable(a: Athlete): boolean {
  return a.verified && isActive(depthFor(a));
}

// Who can appear in decks and "who's going" lists. In launch mode
// everyone does, and verification / recent training rank them higher
// instead (see rankScore); otherwise the strict rule applies.
export function isEligible(a: Athlete, launch: boolean = LAUNCH_MODE): boolean {
  return launch || isShowable(a);
}

// Deck order. Outside launch mode it's the sync score alone; in launch
// mode verified and recently active people get the RANK_WEIGHTS boosts.
export function rankScore(syncScore: number, a: Athlete, launch: boolean = LAUNCH_MODE): number {
  if (!launch) return syncScore;
  const days = depthFor(a).lastTrainedDays;
  const { verified, active, activeFadeDays } = RANK_WEIGHTS;
  const fade =
    days <= ACTIVE_DAYS
      ? 1
      : days >= activeFadeDays
        ? 0
        : 1 - (days - ACTIVE_DAYS) / (activeFadeDays - ACTIVE_DAYS);
  return syncScore + (a.verified ? verified : 0) + active * fade;
}

function candidates(me: MeProfile, excluded: number[], launch: boolean): Athlete[] {
  const myFirst = me.name.trim().split(' ')[0];
  return ATHLETES.filter(
    (a) =>
      !excluded.includes(a.id) &&
      a.name !== myFirst &&
      isEligible(a, launch) &&
      wantEachOther(me, a)
  );
}

// The whole deck, ranked by training fit. `excluded` is everyone who
// shouldn't appear: blocked, matched, already liked, recently passed, or
// outside your filters.
export function pacerDeck(
  me: MeProfile,
  excluded: number[],
  now: Date = new Date(),
  launch: boolean = LAUNCH_MODE
): Pacer[] {
  return candidates(me, excluded, launch)
    .map((athlete) => {
      const compat = compatibility(me, athlete);
      return { athlete, compat, suggestion: suggestSession(me, athlete, compat, now) };
    })
    .sort(
      (x, y) =>
        rankScore(y.compat.score, y.athlete, launch) - rankScore(x.compat.score, x.athlete, launch)
    );
}
