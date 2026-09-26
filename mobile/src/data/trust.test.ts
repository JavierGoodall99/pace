import { ATHLETES } from './mockData';
import { dailyPacers, isShowable, wantEachOther } from './pacers';
import { freshMe } from './session';
import {
  defaultAgeRange,
  expiryLabel,
  likesLeft,
  LIKES_PER_DAY,
  matchHoursLeft,
  scamSignal,
  sharesContact,
} from './trust';

const byName = (n: string) => ATHLETES.find((a) => a.name === n)!;

test('money and off-app requests are flagged', () => {
  expect(scamSignal('Can you send me R500 for data?')).toBe('money');
  expect(scamSignal('I trade crypto, want in?')).toBe('money');
  expect(scamSignal('Buy me a gift card?')).toBe('money');
  expect(scamSignal('Add me on WhatsApp')).toBe('off-app');
  expect(scamSignal('my number is 082 555 1234')).toBe('off-app');
  expect(scamSignal('Easy 10k on Saturday? Coffee after')).toBeNull();
  expect(sharesContact('text me 0825551234')).toBe(true);
});

test('only verified, recently active people make the drop', () => {
  expect(isShowable(byName('Dean'))).toBe(false); // hasn't trained in 23 days
  expect(isShowable(byName('Kagiso'))).toBe(true);
  const me = { ...freshMe('Ana', 'a@x.co'), gender: 'woman' as const, age: '29' };
  expect(dailyPacers(me, []).map((p) => p.athlete.name)).not.toContain('Dean');
});

test('men see women, women see men, and age ranges are mutual', () => {
  const woman = { ...freshMe('Ana', 'a@x.co'), gender: 'woman' as const, age: '29' };
  expect(wantEachOther(woman, byName('Kagiso'))).toBe(true);
  expect(wantEachOther(woman, byName('Lerato'))).toBe(false);
  // Sipho wants 23–34: a 45-year-old woman never sees him, and vice versa.
  expect(wantEachOther({ ...woman, age: '45' }, byName('Sipho'))).toBe(false);
  expect(defaultAgeRange(29)).toEqual([21, 37]);
  expect(defaultAgeRange(null)).toEqual([18, 60]);
});

test('likes are a daily budget', () => {
  const now = new Date('2026-09-26T10:00:00Z');
  expect(likesLeft(undefined, now)).toBe(LIKES_PER_DAY);
  expect(likesLeft({ day: '2026-09-26', count: 4 }, now)).toBe(LIKES_PER_DAY - 4);
  expect(likesLeft({ day: '2026-09-25', count: 10 }, now)).toBe(LIKES_PER_DAY);
});

test('silent matches expire after three days', () => {
  const now = new Date('2026-09-26T12:00:00Z');
  expect(expiryLabel(matchHoursLeft('2026-09-26T00:00:00Z', now))).toBe('3d left');
  expect(expiryLabel(matchHoursLeft('2026-09-23T20:00:00Z', now))).toBe('8h left');
  expect(matchHoursLeft('2026-09-20T00:00:00Z', now)).toBeLessThan(0);
});
