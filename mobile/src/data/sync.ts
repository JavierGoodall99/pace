import { Platform } from 'react-native';
import { rhythmForMe } from './rhythm';
import type { MeProfile } from './session';

// Strava / Garmin / Apple Health / Samsung Health sync. Mock of what a
// real import returns: the last four weeks of activities as a heatmap,
// totals, and your PBs marked as verified. A real build swaps
// `importActivities` for the provider API (HealthKit on iOS, Samsung
// Health via Health Connect on Android).

export type Provider = 'strava' | 'garmin' | 'apple' | 'samsung';

export interface SyncSummary {
  provider: Provider;
  at: string; // ISO
  activities: number;
  km: number;
  // 4 weeks × 7 days, 0 = rest, 1–3 = effort.
  weeks: number[][];
}

export const PROVIDER_LABEL: Record<Provider, string> = {
  strava: 'Strava',
  garmin: 'Garmin',
  apple: 'Apple Health',
  samsung: 'Samsung Health',
};

export const PROVIDER_INFO: Record<
  Provider,
  { desc: string; icon: 'activity' | 'repeat' | 'heart' | 'zap' }
> = {
  strava: {
    desc: 'Sync runs, rides and swims so the stats on your card stay honest.',
    icon: 'activity',
  },
  garmin: {
    desc: 'Pair Garmin Connect and your sessions show up automatically.',
    icon: 'repeat',
  },
  apple: {
    desc: 'Share workouts from Apple Health, including anything your Apple Watch records.',
    icon: 'heart',
  },
  samsung: {
    desc: 'Share workouts from Samsung Health, including anything your Galaxy Watch records.',
    icon: 'zap',
  },
};

// Apple Health only exists on iPhone and Samsung Health only on Android;
// web (the demo build) shows both.
export function availableProviders(os: string = Platform.OS): Provider[] {
  if (os === 'ios') return ['strava', 'garmin', 'apple'];
  if (os === 'android') return ['strava', 'garmin', 'samsung'];
  return ['strava', 'garmin', 'apple', 'samsung'];
}

export function isProvider(v: unknown): v is Provider {
  return typeof v === 'string' && v in PROVIDER_LABEL;
}

export function hasSync(me: Pick<MeProfile, 'connected'>): boolean {
  return me.connected.length > 0;
}

// "Strava, Garmin, Apple Health or Samsung Health" for this device.
export function providerList(os?: string): string {
  const labels = availableProviders(os).map((p) => PROVIDER_LABEL[p]);
  return `${labels.slice(0, -1).join(', ')} or ${labels[labels.length - 1]}`;
}

export function importActivities(
  provider: Provider,
  me: MeProfile,
  now: Date = new Date()
): SyncSummary {
  const rhythm = rhythmForMe(me.cadence, me.trainingDays);
  const seed = { strava: 5, garmin: 2, apple: 3, samsung: 4 }[provider];
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
