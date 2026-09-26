// Swipe deck rules: likes, passes, undo and match-only invites.

type Chat = typeof import('./chat');
type Social = typeof import('./social');
type Plans = typeof import('./plans');

let chat: Chat;
let social: Social;
let plans: Plans;

beforeEach(() => {
  jest.resetModules();
  jest.useFakeTimers();
  social = require('./social');
  chat = require('./chat');
  plans = require('./plans');
});
afterEach(() => jest.useRealTimers());

const photo = { kind: 'photo' as const, index: 0, label: 'photo' };
const base = { activity: 'RUNNING' as const, date: new Date().toISOString(), place: 'Zoo Lake' };

test('swiping right on someone who already liked you is an instant match', () => {
  // Kagiso (8) is in the seeded "liked you" list.
  expect(social.isMatched(8)).toBe(false);
  expect(plans.sendInvite({ athleteId: 8, ...base })).toBeNull();
  const onMatch = jest.fn();
  expect(chat.sendLike(8, photo, '', { onMatch })).toBe('match');
  expect(onMatch).toHaveBeenCalledWith(8);
  expect(social.isMatched(8)).toBe(true);
  expect(social.getSocialState().likes).not.toContain(8);
  // Now invites work.
  expect(plans.sendInvite({ athleteId: 8, ...base })).not.toBeNull();
});

test('a like on someone who has not liked you waits for them', () => {
  // Sipho (2) likes back in the demo after a moment.
  social.passOn(2); // clear him from "liked you" so it's a fresh like
  const onMatch = jest.fn();
  expect(chat.sendLike(2, photo, '', { onMatch, replyDelayMs: 100 })).toBe('sent');
  expect(social.isMatched(2)).toBe(false);
  expect(chat.hasLiked(chat.getChatState(), 2)).toBe(true);
  jest.advanceTimersByTime(150);
  expect(social.isMatched(2)).toBe(true);
  expect(onMatch).toHaveBeenCalledWith(2);
});

test('passes stay out of the deck for the cooldown, then come back', async () => {
  const now = new Date(2026, 8, 26, 12, 0);
  await social.passPacer(6, now);
  expect(social.recentlyPassed(social.getSocialState(), now)).toContain(6);
  const later = new Date(now.getTime() + (social.PASS_COOLDOWN_DAYS + 1) * 86400000);
  expect(social.recentlyPassed(social.getSocialState(), later)).not.toContain(6);
});

test('undo brings back the most recent pass only', async () => {
  await social.passPacer(2);
  await social.passPacer(6);
  expect(await social.undoLastPass()).toBe(6);
  const passed = social.recentlyPassed(social.getSocialState());
  expect(passed).toContain(2);
  expect(passed).not.toContain(6);
  await social.clearPasses();
  expect(social.recentlyPassed(social.getSocialState())).toHaveLength(0);
  expect(await social.undoLastPass()).toBeNull();
});
