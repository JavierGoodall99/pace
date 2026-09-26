import { streakText, TrainingEntry, weeklyStreak } from './training';

// Wednesday 17 Sep 2025, local time.
const now = new Date(2025, 8, 17, 12);

function on(daysAgo: number): TrainingEntry {
  const at = new Date(now);
  at.setDate(at.getDate() - daysAgo);
  return {
    id: `e${daysAgo}`,
    at: at.toISOString(),
    sport: 'RUNNING',
    minutes: 40,
    source: 'manual',
  };
}

test('no training means no streak', () => {
  expect(weeklyStreak([], now)).toEqual({ weeks: 0, atRisk: false, best: 0 });
});

test('counts consecutive weeks including this one', () => {
  // Mon this week, last week, two weeks ago.
  const s = weeklyStreak([on(2), on(8), on(15)], now);
  expect(s).toEqual({ weeks: 3, atRisk: false, best: 3 });
});

test('rest days inside a week never break it', () => {
  // Mon last week, then nothing until Wed this week: 8 rest days.
  expect(weeklyStreak([on(0), on(9)], now).weeks).toBe(2);
});

test('an empty current week keeps the streak but puts it at risk', () => {
  const s = weeklyStreak([on(3), on(10)], now); // Sun last week, Sun before
  expect(s).toEqual({ weeks: 2, atRisk: true, best: 2 });
  expect(streakText(s)).toBe('2-week streak · train this week to keep it');
});

test('a missed full week resets it but best remembers', () => {
  // This week, then a gap last week, then three weeks in a row before.
  const s = weeklyStreak([on(1), on(16), on(23), on(30)], now);
  expect(s.weeks).toBe(1);
  expect(s.best).toBe(3);
});

test('several sessions in one week count once', () => {
  expect(weeklyStreak([on(0), on(1), on(2)], now).weeks).toBe(1);
});
