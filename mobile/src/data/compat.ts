import { depthFor, Level, levelLabel } from './athleteDepth';
import type { Athlete } from './mockData';
import { distanceTo } from './places';
import { Rhythm, rhythmForAthlete, rhythmForMe, sharedDays, WEEK_DAY_NAMES } from './rhythm';
import type { MeProfile } from './session';

// Pace compatibility: can you two actually train together? Four
// factors, each explained in plain words so the score earns trust:
//   days      — do your weeks overlap?
//   time      — same time of day?
//   pace      — similar effort level (a 4:30/km and a 6:30/km runner
//               can't run together)?
//   distance  — close enough to meet?

export type FactorKey = 'days' | 'time' | 'pace' | 'distance';

export interface Factor {
  key: FactorKey;
  label: string;
  detail: string;
  score: number; // 0–1
}

export interface Compat {
  score: number; // 40–99, shown as "% in sync"
  factors: Factor[];
  sharedDayIdx: number[];
  distanceKm: number;
  mine: Rhythm;
  theirs: Rhythm;
}

// Days, time and pace decide whether training together *works*;
// distance decides whether it can *happen*, so it scales the whole score
// rather than being one more weight — someone 600 km away can't top
// your week however well your schedules line up.
const WEIGHTS: Record<Exclude<FactorKey, 'distance'>, number> = {
  days: 0.45,
  time: 0.25,
  pace: 0.3,
};

const TIME_WORD: Record<string, string> = {
  'EARLY MORNING': 'early birds',
  MIDDAY: 'lunch-breakers',
  EVENING: 'evening trainers',
  WEEKENDS: 'weekend warriors',
};

function listDays(idx: number[]): string {
  const names = idx.map((i) => WEEK_DAY_NAMES[i]);
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`;
}

export function daysFactor(mine: Rhythm, theirs: Rhythm): Factor {
  const shared = sharedDays(mine, theirs);
  const union = mine.filter((on, i) => on || theirs[i]).length || 1;
  const score = shared.length / union;
  return {
    key: 'days',
    label: 'Training days',
    detail: shared.length
      ? `Same ${shared.length} day${shared.length === 1 ? '' : 's'}: ${listDays(shared)}`
      : 'No days in common yet',
    score,
  };
}

export function timeFactor(myTimes: string[], theirTimes: string[]): Factor {
  const shared = myTimes.filter((t) => theirTimes.includes(t));
  if (shared.length) {
    return {
      key: 'time',
      label: 'Time of day',
      detail: `You’re both ${TIME_WORD[shared[0]] ?? 'on the same clock'}`,
      score: 1,
    };
  }
  if (!myTimes.length || !theirTimes.length) {
    return {
      key: 'time',
      label: 'Time of day',
      detail: 'Add your training times to compare',
      score: 0.5,
    };
  }
  return {
    key: 'time',
    label: 'Time of day',
    detail: 'Different times — one of you would flex',
    score: 0.3,
  };
}

export function paceFactor(myLevel: Level | null, theirLevel: Level): Factor {
  if (myLevel == null) {
    return {
      key: 'pace',
      label: 'Pace & effort',
      detail: `They train ${levelLabel(theirLevel).toLowerCase()}`,
      score: 0.5,
    };
  }
  const diff = Math.abs(myLevel - theirLevel);
  const score = [1, 0.7, 0.35, 0.1][diff];
  const detail =
    diff === 0
      ? `Same effort level — both ${levelLabel(theirLevel).toLowerCase()}`
      : diff === 1
        ? 'Within one level — easy to match pace'
        : `Big gap: you’re ${levelLabel(myLevel).toLowerCase()}, they’re ${levelLabel(theirLevel).toLowerCase()}`;
  return { key: 'pace', label: 'Pace & effort', detail, score };
}

export function distanceFactor(km: number, theirCity: string): Factor {
  const score = km <= 5 ? 1 : km <= 15 ? 0.85 : km <= 60 ? 0.6 : km <= 250 ? 0.3 : 0.1;
  const detail =
    km <= 15
      ? `${km} km apart — easy to meet`
      : km <= 60
        ? `${km} km away in ${theirCity}`
        : `In ${theirCity} — better for race weekends`;
  return { key: 'distance', label: 'Distance', detail, score };
}

export function compatibility(me: MeProfile, a: Athlete): Compat {
  const depth = depthFor(a);
  const mine = rhythmForMe(me.cadence, me.trainingDays);
  const theirs = rhythmForAthlete(a);
  const distanceKm = distanceTo(me.city, a.city, depth.nearKm);
  const factors = [
    daysFactor(mine, theirs),
    timeFactor(me.times, depth.times),
    paceFactor(me.level, depth.level),
    distanceFactor(distanceKm, a.city),
  ];
  const fit = factors.reduce(
    (sum, f) => (f.key === 'distance' ? sum : sum + f.score * WEIGHTS[f.key]),
    0
  );
  const reach = 0.5 + 0.5 * factors[3].score;
  return {
    score: Math.round(40 + fit * reach * 59),
    factors,
    sharedDayIdx: sharedDays(mine, theirs),
    distanceKm,
    mine,
    theirs,
  };
}

// One-line reason used on cards: the strongest factors first.
export function compatHeadline(c: Compat): string {
  const top = [...c.factors].sort((x, y) => y.score - x.score).slice(0, 2);
  return top.map((f) => f.detail).join(' · ');
}
