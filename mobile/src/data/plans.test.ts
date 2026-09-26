type PlansModule = typeof import('./plans');

let plans: PlansModule;

beforeEach(() => {
  jest.resetModules();
  jest.useFakeTimers();
  plans = require('./plans') as PlansModule;
});

afterEach(() => {
  jest.useRealTimers();
});

const base = { activity: 'RUNNING' as const, date: new Date().toISOString(), place: 'Zoo Lake' };

test('check-in outcome only reveals what you both chose', () => {
  const p = { id: 'x', athleteId: 1, status: 'done' as const, ...base };
  expect(plans.checkInOutcome(p)).toBeNull();
  expect(plans.checkInOutcome({ ...p, myCheckIn: 'coffee' })).toBe('waiting');
  expect(plans.checkInOutcome({ ...p, myCheckIn: 'coffee', theirCheckIn: 'coffee' })).toBe(
    'coffee'
  );
  // A one-sided "coffee" is never shown — you both see "train again".
  expect(plans.checkInOutcome({ ...p, myCheckIn: 'coffee', theirCheckIn: 'again' })).toBe('again');
  expect(plans.checkInOutcome({ ...p, myCheckIn: 'again', theirCheckIn: 'buddies' })).toBe(
    'buddies'
  );
});

test('an invite to a match who responds is accepted and celebrated', () => {
  // Lerato (1) is a seeded match and a demo responder.
  const plan = plans.sendInvite({ athleteId: 1, ...base }, { replyDelayMs: 100 })!;
  expect(plan).not.toBeNull();
  expect(plans.getPlansState().plans.find((p) => p.id === plan.id)?.status).toBe('sent');
  jest.advanceTimersByTime(150);
  expect(plans.getPlansState().plans.find((p) => p.id === plan.id)?.status).toBe('confirmed');
  expect(plans.getPlansState().celebrate).toBe(plan.id);
});

test('you can only invite people you have matched with', () => {
  const before = plans.getPlansState().plans.length;
  // Kagiso (8) liked you but you haven't liked back; 4 is a stranger.
  expect(plans.sendInvite({ athleteId: 8, ...base })).toBeNull();
  expect(plans.sendInvite({ athleteId: 4, ...base })).toBeNull();
  expect(plans.getPlansState().plans).toHaveLength(before);
});

test('after matching, an invite to a non-responder stays pending', () => {
  const social = require('./social') as typeof import('./social');
  social.likeBack(4);
  const plan = plans.sendInvite({ athleteId: 4, ...base }, { replyDelayMs: 100 })!;
  jest.advanceTimersByTime(500);
  expect(plans.getPlansState().plans.find((p) => p.id === plan.id)?.status).toBe('sent');
});

test('checking in completes the session and moves the relationship along', () => {
  const now = new Date();
  plans.resetPlans(now);
  const s = plans.getPlansState();
  // Seeded: two sessions with Lerato, one of them a mutual coffee.
  expect(plans.sessionsTogether(s, 1, now)).toBe(2);
  expect(plans.stageWith(s, 1, true, now)).toBe('coffee');
  // Zanele: one session, not checked in yet.
  expect(plans.stageWith(s, 7, true, now)).toBe('train');
  plans.checkIn('p-zanele-done', 'coffee');
  expect(plans.stageWith(plans.getPlansState(), 7, true, now)).toBe('coffee');
});

test('open sessions can be joined and left', () => {
  plans.joinOpen('o-sipho-ride');
  expect(plans.getPlansState().open.find((o) => o.id === 'o-sipho-ride')?.joined).toContain('me');
  plans.leaveOpen('o-sipho-ride');
  expect(plans.getPlansState().open.find((o) => o.id === 'o-sipho-ride')?.joined).not.toContain(
    'me'
  );
});
