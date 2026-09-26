// Regression tests for bugs found in the September 2026 review.

import { dateFromWhenLabel, dayIndex, localDayKey } from './dates';
import { canonicalCity, cityDistanceKm, distanceTo, spotsFor } from './places';
import { daysPerWeek, toggleTrainingDay } from './rhythm';
import { dayKeyOf, likesLeft, LIKES_PER_DAY, scamSignal, sharesContact } from './trust';

type PlansModule = typeof import('./plans');
type ExploreModule = typeof import('./explore');

describe('city matching', () => {
  test('free-text spellings map onto the canonical city', () => {
    expect(canonicalCity('cape town')).toBe('Cape Town');
    expect(canonicalCity('  Cape Town, WC ')).toBe('Cape Town');
    expect(canonicalCity('Cape Town, South Africa')).toBe('Cape Town');
    expect(canonicalCity('capetown')).toBe('Cape Town');
    expect(canonicalCity('Joburg')).toBe('Johannesburg');
    expect(canonicalCity('Stellenbosch')).toBe('Stellenbosch');
    expect(canonicalCity('')).toBe('');
  });

  test('a lowercase city no longer drops everyone to 500 km', () => {
    expect(distanceTo('cape town', 'Cape Town', 6)).toBe(6);
    expect(distanceTo('Cape Town, WC', 'Cape Town', 6)).toBe(6);
    expect(cityDistanceKm('pretoria', 'Johannesburg')).toBe(55);
    expect(spotsFor('cape town').every((s) => s.city === 'Cape Town')).toBe(true);
  });
});

describe('training week', () => {
  test('toggling a day keeps cadence in step with the days', () => {
    let week = toggleTrainingDay(null, 0);
    expect(week.trainingDays.filter(Boolean)).toHaveLength(1);
    expect(week.cadence).toBe('2-3X/WK');
    for (const i of [1, 2, 3]) week = toggleTrainingDay(week.trainingDays, i);
    expect(week.cadence).toBe('4-5X/WK');
    expect(daysPerWeek(week.cadence, week.trainingDays)).toBe(4);
    for (const i of [0, 1, 2, 3]) week = toggleTrainingDay(week.trainingDays, i);
    expect(week.cadence).toBeNull();
  });
});

describe('chat safety', () => {
  test('normal date talk is not flagged', () => {
    expect(scamSignal('Meet at Signal Hill?')).toBeNull();
    expect(scamSignal('Sunrise on Signal Hill then coffee')).toBeNull();
    expect(scamSignal("I'll pay for coffee")).toBeNull();
    expect(scamSignal('Send me the route?')).toBeNull();
    expect(scamSignal('Worth investing in good trail shoes')).toBeNull();
    expect(scamSignal('Two Oceans entry is R450 this year')).toBeNull();
    expect(sharesContact('Meet at Signal Hill?')).toBe(false);
  });

  test('real scam asks are still flagged', () => {
    expect(scamSignal('Can you send me R500 for data?')).toBe('money');
    expect(scamSignal('Could you lend me some money till Friday')).toBe('money');
    expect(scamSignal('I made R25,000 last month, easy')).toBe('money');
    expect(scamSignal('Great investment opportunity, guaranteed returns')).toBe('money');
    expect(scamSignal('Message me on Signal instead')).toBe('off-app');
    expect(scamSignal('Add me on Snapchat')).toBe('off-app');
  });
});

describe('local day keys', () => {
  test('keys follow the local calendar day, not UTC', () => {
    // 01:00 local on 26 Sep is still 26 Sep, whatever the device time zone.
    const oneAm = new Date(2026, 8, 26, 1, 0);
    expect(localDayKey(oneAm)).toBe('2026-09-26');
    expect(dayKeyOf(oneAm)).toBe('2026-09-26');
    const lateNight = new Date(2026, 8, 25, 23, 30);
    expect(dayKeyOf(lateNight)).toBe('2026-09-25');
  });

  test('the like budget resets at local midnight', () => {
    const used = { day: dayKeyOf(new Date(2026, 8, 25, 23, 0)), count: LIKES_PER_DAY };
    expect(likesLeft(used, new Date(2026, 8, 25, 23, 59))).toBe(0);
    expect(likesLeft(used, new Date(2026, 8, 26, 0, 1))).toBe(LIKES_PER_DAY);
  });

  test('a 01:00 spot stamp counts for that day', () => {
    jest.resetModules();
    const explore = require('./explore') as ExploreModule;
    const oneAm = new Date(2026, 8, 26, 1, 0);
    expect(explore.stampSpot('lions-head', oneAm)).toBe(true);
    const state = explore.getExploreState();
    expect(explore.stampedToday(state, 'lions-head', new Date(2026, 8, 26, 22, 0))).toBe(true);
    expect(explore.stampedToday(state, 'lions-head', new Date(2026, 8, 25, 22, 0))).toBe(false);
  });
});

describe('chat plan cards', () => {
  let plans: PlansModule;
  beforeEach(() => {
    jest.resetModules();
    jest.useFakeTimers();
    plans = require('./plans') as PlansModule;
  });
  afterEach(() => jest.useRealTimers());

  test("accepting Lerato's trail card confirms the plan Today reads", () => {
    const card = {
      planId: 'p-lerato-trail',
      activity: 'TRAIL' as const,
      when: 'Sun · 07:00',
      location: 'Table Mountain, Cape Town',
      status: 'INVITE' as const,
    };
    expect(plans.chatCardStatus(plans.getPlansState(), card)).toBe('INVITE');
    plans.respondToChatPlan(1, card, true);
    const plan = plans.getPlansState().plans.find((p) => p.id === 'p-lerato-trail');
    expect(plan?.status).toBe('confirmed');
    expect(plans.chatCardStatus(plans.getPlansState(), card)).toBe('CONFIRMED');
  });

  test('an old unlinked card creates a plan on first response', () => {
    const legacy = {
      id: 3,
      activity: 'TRAIL' as const,
      when: 'Sun · 07:00',
      location: 'Table Mountain, Cape Town',
      status: 'INVITE' as const,
    };
    const before = plans.getPlansState().plans.length;
    const id = plans.respondToChatPlan(1, legacy, false);
    const state = plans.getPlansState();
    expect(state.plans).toHaveLength(before + 1);
    const plan = state.plans.find((p) => p.id === id)!;
    expect(plan.status).toBe('declined');
    expect(plan.place).toBe('Table Mountain, Cape Town');
    expect(dayIndex(new Date(plan.date))).toBe(6); // Sunday
  });
});

test('chat "when" labels parse to the next matching day', () => {
  const fri = new Date(2026, 8, 25, 12, 0); // Friday
  const d = dateFromWhenLabel('Sun · 07:00', fri);
  expect(dayIndex(d)).toBe(6);
  expect(d.getHours()).toBe(7);
  expect(d.getDate()).toBe(27);
});

describe('privacy and notification settings', () => {
  // Each "app launch" gets a fresh module registry; the stored JSON is
  // carried across by hand, like a device keeping AsyncStorage.
  async function launch(stored: string | null) {
    jest.resetModules();
    const storage = require('@react-native-async-storage/async-storage');
    await storage.clear();
    if (stored) await storage.setItem('pace.settings.v1', stored);
    const settings = require('./settings') as typeof import('./settings');
    return { storage, settings };
  }

  test('toggles persist and survive a restart', async () => {
    const first = await launch(null);
    await first.settings.settingsReady;
    first.settings.setPrivacy({ visibility: 'MATCHES ONLY', showCity: false });
    first.settings.setPush('messages', false);
    await new Promise<void>((r) => setImmediate(r));
    const saved = await first.storage.getItem('pace.settings.v1');

    const { settings } = await launch(saved);
    await settings.settingsReady;
    const s = settings.getSettings();
    expect(s.privacy.visibility).toBe('MATCHES ONLY');
    expect(s.privacy.showCity).toBe(false);
    expect(s.push.messages).toBe(false);
    expect(s.push.likes).toBe(true);
  });

  test('a change made before hydration is not lost', async () => {
    const { settings } = await launch(JSON.stringify({ privacy: { visibility: 'MATCHES ONLY' } }));
    settings.setEmail('digest', false); // before settingsReady resolves
    await settings.settingsReady;
    expect(settings.getSettings().email.digest).toBe(false);
    expect(settings.getSettings().privacy.visibility).toBe('MATCHES ONLY');
  });
});
