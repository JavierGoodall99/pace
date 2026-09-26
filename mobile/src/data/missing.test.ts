import { depthFor } from './athleteDepth';
import { photoProblem } from './identity';
import { ATHLETES, NOTIFICATIONS } from './mockData';
import {
  isUnread,
  markAllRead,
  markRead,
  resetNotifications,
  unreadCount,
  visibleNotifications,
} from './notifications';
import { matchKind, wantEachOther } from './pacers';
import { freshMe, Intent } from './session';
import { nextStreakReminder } from './training';

const woman = (intent: Intent | null) => ({
  ...freshMe('Ana', 'a@x.co'),
  gender: 'woman' as const,
  age: '29',
  intent,
});

describe('what you are here for', () => {
  const women = ATHLETES.filter((a) => depthFor(a).gender === 'woman');
  const men = ATHLETES.filter((a) => depthFor(a).gender === 'man');

  test('looking for love shows only the other gender', () => {
    expect(women.some((a) => wantEachOther(woman('love'), a))).toBe(false);
    expect(men.some((a) => wantEachOther(woman('love'), a))).toBe(true);
  });

  test('training partners can be the same gender when both want that', () => {
    const shown = women.filter((a) => wantEachOther(woman('partner'), a));
    expect(shown.length).toBeGreaterThan(0);
    shown.forEach((a) => expect(['partner', 'both']).toContain(depthFor(a).intent));
    shown.forEach((a) => expect(matchKind(woman('partner'), a)).toBe('partner'));
  });

  test('a same-gender athlete who only wants love never sees you', () => {
    const loveOnly = women.filter((a) => depthFor(a).intent === 'love');
    expect(loveOnly.length).toBeGreaterThan(0);
    loveOnly.forEach((a) => expect(wantEachOther(woman('both'), a)).toBe(false));
  });
});

test('photo rule: two or more, all labelled, one off the clock', () => {
  expect(photoProblem(['a'], ['action'])).toMatch(/at least 2/);
  expect(photoProblem(['a', 'b'], ['action'])).toMatch(/every photo/);
  expect(photoProblem(['a', 'b'], ['action', 'race'])).toMatch(/Off the clock/);
  expect(photoProblem(['a', 'b'], ['action', 'offclock'])).toBeNull();
});

describe('streak reminder', () => {
  // Wednesday 17 Sep 2025.
  const wed = new Date(2025, 8, 17, 12);

  test('at risk: this Saturday morning', () => {
    const r = nextStreakReminder({ weeks: 3, atRisk: true, best: 3 }, wed);
    expect(r.at).toEqual(new Date(2025, 8, 20, 9));
    expect(r.title).toBe('Keep your 3-week streak');
  });

  test('already trained this week: next Saturday', () => {
    const r = nextStreakReminder({ weeks: 3, atRisk: false, best: 3 }, wed);
    expect(r.at).toEqual(new Date(2025, 8, 27, 9));
  });

  test('Saturday afternoon falls back to Sunday evening', () => {
    const satPm = new Date(2025, 8, 20, 15);
    expect(nextStreakReminder({ weeks: 0, atRisk: false, best: 0 }, satPm).at).toEqual(
      new Date(2025, 8, 21, 17)
    );
  });
});

describe('notification read state', () => {
  beforeEach(resetNotifications);

  test('reading one clears it; mark all clears the rest', () => {
    const first = visibleNotifications([]).find((n) => n.unread)!;
    const before = unreadCount([], []);
    markRead(first.id);
    const read = [first.id];
    expect(isUnread(first, read)).toBe(false);
    expect(unreadCount([], read)).toBe(before - 1);
    markAllRead();
    expect(
      unreadCount(
        [],
        NOTIFICATIONS.map((n) => n.id)
      )
    ).toBe(0);
  });

  test('blocked people drop out of the feed', () => {
    const id = NOTIFICATIONS[0].athleteId;
    expect(visibleNotifications([id]).some((n) => n.athleteId === id)).toBe(false);
  });
});

describe('photos have to show you', () => {
  const two = ['a', 'b'];
  const labels = ['action', 'offclock'] as const;

  test('an object as the main photo is rejected', () => {
    expect(photoProblem(two, [...labels], [0, 1])).toMatch(/main photo needs to show your face/);
  });

  test('a group shot as the main photo is rejected', () => {
    expect(photoProblem(two, [...labels], [3, 1])).toMatch(/just you/);
  });

  test('needs two photos with a face', () => {
    expect(photoProblem(two, [...labels], [1, 0])).toMatch(/another photo/);
    expect(photoProblem(two, [...labels], [1, 1])).toBeNull();
  });

  test('unchecked photos (web, older profiles) are not held against you', () => {
    expect(photoProblem(two, [...labels], [null, null])).toBeNull();
    expect(photoProblem(two, [...labels])).toBeNull();
  });
});
