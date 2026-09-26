import type { Athlete } from './mockData';

// Training rhythm: which days of the week someone trains. Pace matches on
// this — two people who both run Tuesday and Saturday mornings are far
// more likely to actually meet up than two people who share a sport.
//
// Mock derivation until the backend syncs real training history: each
// athlete's week is a stable pattern picked from their weekly session
// count and id, and "you" derive from the cadence set in onboarding.

export const WEEK_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;
export const WEEK_DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export type Rhythm = boolean[]; // length 7, Monday first

// Day-index orderings to fill from — distinct "shapes" of a training week.
const PATTERNS = [
  [1, 3, 5, 6, 0, 2, 4], // Tue Thu Sat Sun ...
  [0, 2, 4, 5, 6, 1, 3], // Mon Wed Fri Sat ...
  [5, 6, 1, 3, 0, 2, 4], // weekend-heavy
  [0, 1, 3, 4, 5, 2, 6], // weekday grinder
];

function fill(order: number[], count: number): Rhythm {
  const days: Rhythm = [false, false, false, false, false, false, false];
  order.slice(0, Math.max(1, Math.min(7, count))).forEach((d) => (days[d] = true));
  return days;
}

export function rhythmForAthlete(a: Pick<Athlete, 'id' | 'weekly'>): Rhythm {
  return fill(PATTERNS[a.id % PATTERNS.length], a.weekly);
}

const CADENCE_COUNT: Record<string, number> = { '2-3X/WK': 3, '4-5X/WK': 5, '6+X/WK': 6 };

// Your week: the days you picked in onboarding when set, otherwise a
// pattern sized to your cadence.
export function rhythmForMe(cadence: string | null, trainingDays?: boolean[] | null): Rhythm {
  if (trainingDays && trainingDays.length === 7 && trainingDays.some(Boolean)) return trainingDays;
  return fill(PATTERNS[0], cadence ? (CADENCE_COUNT[cadence] ?? 4) : 4);
}

// Stored cadence bucket for a picked number of training days.
export function cadenceForDays(count: number): string {
  return count >= 6 ? '6+X/WK' : count >= 4 ? '4-5X/WK' : '2-3X/WK';
}

export const NO_DAYS: Rhythm = [false, false, false, false, false, false, false];

// Flip one day in your week and keep the stored cadence bucket in step,
// so everything that still reads `cadence` agrees with `trainingDays`.
export function toggleTrainingDay(
  days: boolean[] | null,
  i: number
): { trainingDays: Rhythm; cadence: string | null } {
  const next = [...(days && days.length === 7 ? days : NO_DAYS)];
  next[i] = !next[i];
  const count = next.filter(Boolean).length;
  return { trainingDays: next, cadence: count ? cadenceForDays(count) : null };
}

// Days a week you train: your picked week when set, else the cadence
// bucket's typical count.
export function daysPerWeek(cadence: string | null, trainingDays?: boolean[] | null): number {
  return rhythmForMe(cadence, trainingDays).filter(Boolean).length;
}

// Time-of-day buckets. Shared by onboarding and Settings → Training so the
// two can't drift (Settings used to be missing MIDDAY).
export const TRAINING_TIMES = [
  { id: 'EARLY MORNING', title: 'Early morning', subtitle: 'Before the world wakes up' },
  { id: 'MIDDAY', title: 'Midday', subtitle: 'Lunch-break sessions' },
  { id: 'EVENING', title: 'Evening', subtitle: 'After work, under the lights' },
  { id: 'WEEKENDS', title: 'Weekends', subtitle: 'Long runs and big rides' },
] as const;

export function sharedDays(a: Rhythm, b: Rhythm): number[] {
  return a.map((on, i) => (on && b[i] ? i : -1)).filter((i) => i >= 0);
}

// 0–100 "in sync" score: overlap over union, eased into a friendlier
// 55–98 band so a single shared day still reads as promising.
export function syncScore(a: Rhythm, b: Rhythm): number {
  const shared = sharedDays(a, b).length;
  const union = a.filter((on, i) => on || b[i]).length || 1;
  return Math.round(55 + (shared / union) * 43);
}

export function sharedDaysLabel(a: Rhythm, b: Rhythm): string {
  const days = sharedDays(a, b).map((i) => WEEK_DAY_NAMES[i]);
  if (days.length === 0) return 'No shared days yet';
  if (days.length === 1) return `You both train ${days[0]}`;
  return `You both train ${days.slice(0, -1).join(', ')} & ${days[days.length - 1]}`;
}
