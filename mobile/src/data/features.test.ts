// Training log, PBs/routes, waitlist and filter rules.

import { addRoute, MAX_PBS, upsertPb } from './highlights';
import { filteredOut } from './deck';
import { DEFAULT_FILTERS as DEFAULT_FILTERS_FOR_TEST } from './filters';
import { isLaunchCity } from './places';
import { freshMe } from './session';
import {
  activityOf,
  allTraining,
  importSynced,
  logTraining,
  resetTraining,
  trainingHeatmap,
  getTrainingLog,
} from './training';

describe('training log', () => {
  const now = new Date(2026, 8, 26, 12, 0); // Saturday
  beforeEach(() => resetTraining());

  test('nothing logged means inactive and hidden', () => {
    const a = activityOf(allTraining(getTrainingLog(), [], now), now);
    expect(a.lastTrainedDays).toBeNull();
    expect(a.active).toBe(false);
  });

  test('logging today makes you active and trained today', () => {
    const res = logTraining(
      { at: new Date(2026, 8, 26, 7, 0), sport: 'RUNNING', minutes: 45 },
      now
    );
    expect(res.ok).toBe(true);
    const a = activityOf(allTraining(getTrainingLog(), [], now), now);
    expect(a.trainedToday).toBe(true);
    expect(a.active).toBe(true);
    expect(a.source).toBe('manual');
  });

  test('rejects future, too-old and silly entries', () => {
    expect(logTraining({ at: new Date(2026, 8, 27), sport: 'RUNNING', minutes: 30 }, now).ok).toBe(
      false
    );
    expect(logTraining({ at: new Date(2026, 8, 10), sport: 'RUNNING', minutes: 30 }, now).ok).toBe(
      false
    );
    expect(
      logTraining({ at: new Date(2026, 8, 26, 6), sport: 'RUNNING', minutes: 2 }, now).ok
    ).toBe(false);
    expect(
      logTraining({ at: new Date(2026, 8, 26, 6), sport: 'RUNNING', minutes: 30, km: 900 }, now).ok
    ).toBe(false);
  });

  test('done Pace sessions count, and stale training goes inactive', () => {
    const plan = {
      id: 'p1',
      athleteId: 1,
      activity: 'TRAIL' as const,
      date: new Date(2026, 8, 1, 7, 0).toISOString(),
      place: 'Lion’s Head',
      status: 'done' as const,
    };
    const a = activityOf(allTraining([], [plan], now), now);
    expect(a.source).toBe('session');
    expect(a.lastTrainedDays).toBe(25);
    expect(a.active).toBe(false); // > 14 days
  });

  test('a Strava sync fills the log and the heatmap, never with future days', () => {
    const weeks = Array.from({ length: 4 }, () => [1, 0, 2, 0, 3, 1, 1]);
    const imported = importSynced(
      { provider: 'strava', at: now.toISOString(), activities: 0, km: 0, weeks },
      'RUNNING',
      now
    );
    expect(imported.every((e) => new Date(e.at).getTime() <= now.getTime())).toBe(true);
    const all = allTraining(getTrainingLog(), [], now);
    expect(activityOf(all, now).source).toBe('strava');
    const map = trainingHeatmap(all, now);
    expect(map).toHaveLength(4);
    expect(map[3][6]).toBe(0); // Sunday hasn't happened yet
    expect(map[0][4]).toBeGreaterThan(0);
    // Re-syncing replaces, not duplicates.
    importSynced(
      { provider: 'strava', at: now.toISOString(), activities: 0, km: 0, weeks },
      'RUNNING',
      now
    );
    expect(getTrainingLog().filter((e) => e.source === 'strava')).toHaveLength(imported.length);
  });
});

describe('personal bests and routes', () => {
  test('adding, updating and the cap', () => {
    let pbs = upsertPb([], '10 km', '44:12');
    expect(pbs.ok).toBe(true);
    if (!pbs.ok) return;
    // Same label updates in place and drops any verified badge.
    const verified = [{ ...pbs.value[0], source: 'strava' as const }];
    const updated = upsertPb(verified, '10 KM', '43:50');
    expect(updated.ok && updated.value).toEqual([{ label: '10 KM', value: '43:50' }]);
    expect(upsertPb([], '', '1').ok).toBe(false);
    expect(upsertPb([], '5 km', '').ok).toBe(false);
    const full = Array.from({ length: MAX_PBS }, (_, i) => ({ label: `PB ${i}`, value: '1' }));
    expect(upsertPb(full, 'New', '1').ok).toBe(false);
  });

  test('routes need a name and no duplicates', () => {
    const r = addRoute([], 'Sea Point Promenade', '10 km · flat');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(addRoute(r.value, 'sea point promenade', '').ok).toBe(false);
    expect(addRoute([], '  ', '').ok).toBe(false);
  });
});

describe('launch city', () => {
  test('only Cape Town is live', () => {
    expect(isLaunchCity('Cape Town')).toBe(true);
    expect(isLaunchCity('cape town')).toBe(true);
    expect(isLaunchCity('Johannesburg')).toBe(false);
    expect(isLaunchCity('')).toBe(false);
  });
});

describe('waitlist', () => {
  test('stores one signup per email and city, and validates', async () => {
    jest.resetModules();
    const w = require('./waitlist') as typeof import('./waitlist');
    expect((await w.joinWaitlist('nope', 'Durban')).ok).toBe(false);
    expect((await w.joinWaitlist('a@x.co', '')).ok).toBe(false);
    expect((await w.joinWaitlist('A@x.co', 'Durban')).ok).toBe(true);
    expect((await w.joinWaitlist('a@x.co', 'durban')).ok).toBe(true);
    expect(w.getWaitlist()).toHaveLength(1);
    expect(w.isOnWaitlist('a@x.co', 'Durban')).toBe(true);
  });
});

describe('filters', () => {
  test('availability filter now actually filters', () => {
    const me = { ...freshMe('Ana', 'a@x.co'), city: 'Cape Town', age: '29' };
    const none = filteredOut(me, DEFAULT_FILTERS_FOR_TEST);
    const evenings = filteredOut(me, { ...DEFAULT_FILTERS_FOR_TEST, times: ['EVENING'] });
    expect(evenings.length).toBeGreaterThan(none.length);
  });
});
