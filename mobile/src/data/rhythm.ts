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
