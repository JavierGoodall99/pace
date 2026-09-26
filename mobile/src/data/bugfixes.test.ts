import { deleteAccountAndData, seedDemoFor } from './account';
import { depthFor } from './athleteDepth';
import { activeMatches, getChatState, isActiveMatch, sendMessage } from './chat';
import { agoShort } from './dates';
import { getPlansState } from './plans';
import { demoGraphFor, getSocialState, likeBack } from './social';
import { getTrainingLog, logTraining } from './training';

describe('deleting an account', () => {
  test('clears in-memory data, not just storage', async () => {
    await likeBack(2);
    logTraining({ at: new Date(), sport: 'RUNNING', minutes: 30 });
    expect(getTrainingLog().length).toBeGreaterThan(0);

    await deleteAccountAndData();

    expect(getTrainingLog()).toEqual([]);
    expect(getSocialState().matchedAt).toEqual({});
  });
});

describe('demo cast', () => {
  test.each(['woman', 'man'] as const)('only has people a %s would be shown', (gender) => {
    const want = gender === 'woman' ? 'man' : 'woman';
    const { likes, matches } = demoGraphFor(gender);
    expect(likes.length + matches.length).toBeGreaterThan(0);
    [...likes, ...matches].forEach((id) => expect(depthFor({ id }).gender).toBe(want));
  });

  test('drops demo plans with anyone who is not a match', async () => {
    await seedDemoFor('woman');
    const { matches } = getSocialState();
    getPlansState().plans.forEach((p) => expect(matches).toContain(p.athleteId));
  });
});

describe('active matches', () => {
  const now = new Date(2025, 8, 17, 12);
  const fourDaysAgo = new Date(now.getTime() - 4 * 86400000).toISOString();
  const social = { matches: [2, 4], blocked: [], matchedAt: { 2: fourDaysAgo, 4: fourDaysAgo } };

  test('a silent match expires after 3 days', () => {
    expect(isActiveMatch(2, social, { threads: {}, sentLikes: [] }, now)).toBe(false);
  });

  test('a match you talked in never expires', () => {
    sendMessage(4, { from: 'me', text: 'Hi!' });
    expect(activeMatches(social, getChatState(), now)).toEqual([4]);
  });

  test('blocked people are never active', () => {
    const chat = { threads: {}, sentLikes: [] };
    expect(isActiveMatch(2, { matches: [2], blocked: [2], matchedAt: {} }, chat, now)).toBe(false);
  });
});

test('chat timestamps count up instead of staying on "Now"', () => {
  const now = new Date(2025, 8, 17, 12);
  const ago = (mins: number) => new Date(now.getTime() - mins * 60000).toISOString();
  expect(agoShort(ago(0), now)).toBe('Now');
  expect(agoShort(ago(5), now)).toBe('5m');
  expect(agoShort(ago(180), now)).toBe('3h');
  expect(agoShort(ago(2 * 1440), now)).toBe('2d');
  expect(agoShort(ago(9 * 1440), now)).toBe('Mon 8');
});
