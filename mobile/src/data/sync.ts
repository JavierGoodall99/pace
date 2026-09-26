import { rhythmForMe } from './rhythm';
import type { MeProfile } from './session';

// Strava / Garmin sync. Mock of what a real import returns: the last
// four weeks of activities as a heatmap, totals, and your PBs marked as
// verified. A real build swaps `importActivities` for the provider API.

export type Provider = 'strava' | 'garmin';

export interface SyncSummary {
  provider: Provider;
  at: string; // ISO
  activities: number;
  km: number;
  // 4 weeks × 7 days, 0 = rest, 1–3 = effort.
  weeks: number[][];
}

export const PROVIDER_LABEL: Record<Provider, string> = { strava: 'Strava', garmin: 'Garmin' };

export function importActivities(
  provider: Provider,
  me: MeProfile,
  now: Date = new Date()
): SyncSummary {
  const rhythm = rhythmForMe(me.cadence, me.trainingDays);
  const seed = provider === 'strava' ? 5 : 2;
  const weeks = [0, 1, 2, 3].map((w) =>
    rhythm.map((on, d) => {
      if (!on) return (seed + w * 3 + d) % 13 === 0 ? 1 : 0;
      return (seed + w * 5 + d * 2) % 9 === 0 ? 0 : 1 + ((seed + w + d) % 3);
    })
  );
  const activities = weeks.flat().filter((v) => v > 0).length;
  const km = weeks.flat().reduce((sum, v) => sum + v * 4.5, 0);
  return { provider, at: now.toISOString(), activities, km: Math.round(km), weeks };
}

export function syncLabel(s: SyncSummary): string {
  return `Synced from ${PROVIDER_LABEL[s.provider]} · ${s.activities} activities · ${s.km} km`;
}
