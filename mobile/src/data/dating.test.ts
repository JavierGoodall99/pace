import { getChatState, composerLock, messagesWith, resetChat, sendLike } from './chat';
import { dropKey, nextDrop } from './dates';
import { freshnessLabel, showMeLabel } from './identity';
import { getMomentsState, kudosCount, liveMoments, resetMoments, toggleKudos } from './moments';
import { getPlansState, resetPlans } from './plans';
import { block, report } from './safety';
import { activeCity, freshMe } from './session';

// AsyncStorage is mocked by jest-expo's preset; these stores only need
// their in-memory state.

beforeEach(() => {
  jest.useFakeTimers();
  resetChat();
  resetPlans();
});
afterEach(() => jest.useRealTimers());

test('a like with a comment opens the thread once it is mutual', () => {
  const onMatch = jest.fn();
  sendLike(1, { kind: 'photo', index: 1, label: 'Two Oceans build' }, 'That finish!', { onMatch });
  expect(getChatState().sentLikes).toContain(1);
  jest.runAllTimers();
  expect(onMatch).toHaveBeenCalledWith(1);
  const msgs = messagesWith(getChatState(), 1);
  const mine = msgs[msgs.length - 2];
  expect(mine.like?.label).toBe('Two Oceans build');
  expect(mine.text).toBe('That finish!');
  expect(msgs[msgs.length - 1].from).toBe('them');
});

test('women-first locks the composer for men until she says hi', () => {
  const man = { ...freshMe('Tom', 't@x.co'), gender: 'man' as const };
  const woman = { ...freshMe('Ana', 'a@x.co'), gender: 'woman' as const };
  resetChat();
  // Zanele (7) has women-first on but already messaged in the seed.
  expect(composerLock(man, 7, getChatState())).toBeNull();
  // Amahle (3) too — clear her thread to simulate a brand-new match.
  const s = getChatState();
  const fresh = { ...s, threads: { ...s.threads, 3: [] } };
  expect(composerLock(man, 3, fresh)).toMatch(/makes the first move/);
  expect(composerLock(woman, 3, fresh)).toBeNull();
});

test('blocking and reporting clear the chat and plans with that person', async () => {
  expect(getPlansState().plans.some((p) => p.athleteId === 1)).toBe(true);
  await block(1);
  expect(getPlansState().plans.some((p) => p.athleteId === 1)).toBe(false);
  expect(messagesWith(getChatState(), 1)).toHaveLength(0);
  await report(7, 'harassment', ' rude ');
  expect(messagesWith(getChatState(), 7)).toHaveLength(0);
});

test('moments last 24 hours and only show your matches', () => {
  const now = new Date(2026, 8, 26, 12, 0);
  resetMoments(now);
  const s = getMomentsState();
  // Seeded: Lerato (1) 3h ago, Amahle (3) 7h ago, Zanele (7) 15h ago.
  expect(liveMoments(s, [1, 3], now).map((m) => m.author)).toEqual([1, 3]);
  const later = new Date(now.getTime() + 20 * 3600000);
  expect(liveMoments(s, [1, 3, 7], later).map((m) => m.author)).toEqual([1]);
});

test('kudos count includes yours and toggles off again', () => {
  resetMoments(new Date(2026, 8, 26, 12, 0));
  const m = getMomentsState().moments[0];
  toggleKudos(m.id);
  expect(kudosCount(getMomentsState(), m)).toBe(m.kudos + 1);
  toggleKudos(m.id);
  expect(kudosCount(getMomentsState(), m)).toBe(m.kudos);
});

test('the drop day starts at 07:00', () => {
  expect(dropKey(new Date(2026, 8, 26, 6, 59))).toBe('2026-09-25');
  expect(dropKey(new Date(2026, 8, 26, 7, 0))).toBe('2026-09-26');
  expect(nextDrop(new Date(2026, 8, 26, 8, 0)).getDate()).toBe(27);
});

test('travel mode changes the city you match in until it ends', () => {
  const me = { ...freshMe('Ana', 'a@x.co'), city: 'Pretoria' };
  const now = new Date(2026, 8, 26);
  const travelling = {
    ...me,
    travel: { city: 'Durban', until: new Date(2026, 8, 28).toISOString() },
  };
  expect(activeCity(travelling, now)).toBe('Durban');
  expect(activeCity(travelling, new Date(2026, 8, 30))).toBe('Pretoria');
});

test('labels read naturally', () => {
  expect(showMeLabel(['man'])).toBe('Men');
  expect(showMeLabel(['woman', 'man', 'nonbinary'])).toBe('Everyone');
  expect(freshnessLabel(3)).toBe('Photos updated 3 days ago');
  expect(freshnessLabel(22)).toBe('Photos updated 3 weeks ago');
});
