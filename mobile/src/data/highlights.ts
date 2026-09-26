import type { Route } from './athleteDepth';
import type { Discipline } from './mockData';
import type { MeProfile } from './session';

// Personal bests and favourite routes on your card. You add these
// yourself; a PB only shows "Verified by Strava/Garmin" when it came from
// a sync, and editing it by hand drops that badge.

export const MAX_PBS = 4;
export const MAX_ROUTES = 4;

export type PB = MeProfile['pbs'][number];

// Quick-pick PB names per sport, so most people never type a label.
export const PB_PRESETS: Record<Discipline, string[]> = {
  RUNNING: ['5 km', '10 km', 'Half marathon', 'Marathon'],
  TRAIL: ['UTCT 35 km', 'Lion’s Head up', 'Platteklip up'],
  CYCLING: ['40 km TT', 'FTP', 'Chapman’s Peak climb'],
  SWIMMING: ['100 m freestyle', '1 km open water', 'Robben Island crossing'],
  CROSSFIT: ['Back squat', 'Deadlift', 'Clean & jerk', 'Fran'],
  CLIMBING: ['Top boulder grade', 'Top sport grade'],
  TRIATHLON: ['Sprint', 'Olympic', '70.3'],
};

export function pbPresetsFor(disciplines: Discipline[]): string[] {
  const list = (disciplines.length ? disciplines : (['RUNNING'] as Discipline[])).flatMap(
    (d) => PB_PRESETS[d]
  );
  return Array.from(new Set(list));
}

export type EditResult<T> = { ok: true; value: T } | { ok: false; error: string };

// Adds or replaces (same label, case-insensitive) a PB. Hand-entered PBs
// are never marked verified.
export function upsertPb(pbs: PB[], label: string, value: string): EditResult<PB[]> {
  const l = label.trim();
  const v = value.trim();
  if (!l) return { ok: false, error: 'Name the PB, e.g. 10 km or Back squat.' };
  if (!v) return { ok: false, error: 'Add your time, weight or grade.' };
  if (l.length > 28 || v.length > 16) return { ok: false, error: 'Keep it short.' };
  const i = pbs.findIndex((p) => p.label.toLowerCase() === l.toLowerCase());
  if (i >= 0) {
    const next = [...pbs];
    next[i] = { label: l, value: v };
    return { ok: true, value: next };
  }
  if (pbs.length >= MAX_PBS) return { ok: false, error: `Up to ${MAX_PBS} PBs. Remove one first.` };
  return { ok: true, value: [...pbs, { label: l, value: v }] };
}

export function addRoute(routes: Route[], name: string, detail: string): EditResult<Route[]> {
  const n = name.trim();
  const d = detail.trim();
  if (!n) return { ok: false, error: 'Name the route, e.g. Sea Point Promenade.' };
  if (n.length > 40 || d.length > 40) return { ok: false, error: 'Keep it short.' };
  if (routes.some((r) => r.name.toLowerCase() === n.toLowerCase()))
    return { ok: false, error: 'That route is already on your card.' };
  if (routes.length >= MAX_ROUTES)
    return { ok: false, error: `Up to ${MAX_ROUTES} routes. Remove one first.` };
  return { ok: true, value: [...routes, { name: n, detail: d }] };
}
