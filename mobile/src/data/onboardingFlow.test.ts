import { setAnalyticsSink } from '../lib/analytics';
import {
  getOnboardingProgress,
  isStepDone,
  OnboardingProgress,
  POST_ACCOUNT,
  QUESTIONS,
  resumeIndex,
  saveProfileStep,
  STEPS,
  StepId,
} from './onboardingFlow';
import { freshMe, MeProfile } from './session';

const blank = freshMe('', '');
const preAccount: MeProfile = {
  ...blank,
  city: 'Cape Town',
  age: '29',
  disciplines: ['RUNNING'],
  trainingDays: [true, false, true, false, true, false, false],
  level: 2,
  times: ['EARLY MORNING'],
  intent: 'both',
  goalRaceId: '',
};
const progress = (completed: StepId[] | null, paywallSeen = false): OnboardingProgress => ({
  completed,
  paywallSeen,
  started: true,
});
const at = (steps: StepId[], i: number) => steps[i];

test('order: age before sports, account before name, paywall before launch', () => {
  expect(STEPS.indexOf('basics')).toBeLessThan(STEPS.indexOf('sports'));
  expect(STEPS.indexOf('account')).toBeLessThan(STEPS.indexOf('name'));
  expect(STEPS.slice(-3)).toEqual(['reveal', 'paywall', 'launch']);
  expect(QUESTIONS[0]).toBe('city');
  expect(QUESTIONS[QUESTIONS.length - 1]).toBe('verify');
  expect(QUESTIONS).toContain('account');
});

test('first launch starts at Welcome', () => {
  expect(at(STEPS, resumeIndex(STEPS, progress(null), blank, false))).toBe('welcome');
  expect(at(STEPS, resumeIndex(STEPS, progress([]), blank, false))).toBe('welcome');
});

test('killed before the account: resumes at the next unanswered question', () => {
  const done: StepId[] = ['welcome', 'meet', 'city', 'basics', 'sports'];
  const me = { ...preAccount, level: null };
  expect(at(STEPS, resumeIndex(STEPS, progress(done), me, false))).toBe('week');
});

test('all pre-account answers done: resumes at Account', () => {
  const done = STEPS.slice(0, STEPS.indexOf('account'));
  expect(at(STEPS, resumeIndex(STEPS, progress(done), preAccount, false))).toBe('account');
});

test('killed after the account: resumes at the next profile step', () => {
  const steps = STEPS.filter((s) => s !== 'account');
  const done = [...STEPS.slice(0, STEPS.indexOf('account')), 'name', 'gender'] as StepId[];
  const me = { ...preAccount, name: 'Ada', gender: 'woman' as const };
  expect(at(steps, resumeIndex(steps, progress(done), me, true))).toBe('lifestyle');
});

test('a prefilled name still shows the Name step until it is confirmed', () => {
  const steps = STEPS.filter((s) => s !== 'account');
  const done = STEPS.slice(0, STEPS.indexOf('account'));
  const me = { ...preAccount, name: 'Ada from Apple' };
  expect(at(steps, resumeIndex(steps, progress(done), me, true))).toBe('name');
});

test('skipped Sync and Verify stay skipped', () => {
  const steps = STEPS.filter((s) => s !== 'account');
  const done = steps.slice(0, steps.indexOf('building'));
  const me = { ...preAccount, name: 'Ada' };
  // Not connected and not verified, but both were passed.
  expect(isStepDone('sync', progress(done), me, true)).toBe(true);
  expect(isStepDone('verify', progress(done), me, true)).toBe(true);
});

test('everything answered: Building, then the paywall once, then Launch', () => {
  const steps = STEPS.filter((s) => s !== 'account');
  const upToVerify = steps.slice(0, steps.indexOf('building'));
  const me = { ...preAccount, name: 'Ada' };
  // Photos etc. aren't really answered here, so force-complete by answers:
  // a step in `completed` whose required answer is missing is not done.
  expect(at(steps, resumeIndex(steps, progress(upToVerify), me, true))).toBe('gender');

  const full = {
    ...me,
    gender: 'woman' as const,
    lifestyle: { drinks: 'social' as const, diet: 'anything' as const, restDay: 'brunch' as const },
    photos: ['a', 'b'],
    photoLabels: ['action' as const, 'offclock' as const],
  };
  expect(at(steps, resumeIndex(steps, progress(upToVerify), full, true))).toBe('building');
  const pastReveal = [...upToVerify, 'building', 'reveal'] as StepId[];
  expect(at(steps, resumeIndex(steps, progress(pastReveal), full, true))).toBe('paywall');
  expect(at(steps, resumeIndex(steps, progress(pastReveal, true), full, true))).toBe('launch');
});

test('an under-18 or non-Cape Town answer sends you back to it', () => {
  const done = STEPS.slice(0, STEPS.indexOf('account'));
  expect(at(STEPS, resumeIndex(STEPS, progress(done), { ...preAccount, age: '16' }, false))).toBe(
    'basics'
  );
  expect(
    at(STEPS, resumeIndex(STEPS, progress(done), { ...preAccount, city: 'Durban' }, false))
  ).toBe('city');
});

test('older profiles with nothing recorded resume from their answers', () => {
  const steps = STEPS.filter((s) => s !== 'account');
  const me = { ...preAccount, name: 'Ada' };
  expect(at(steps, resumeIndex(steps, progress(null), me, true))).toBe('gender');
});

test('post-account steps are the ones saved to the account', () => {
  expect(POST_ACCOUNT).toEqual(['name', 'gender', 'lifestyle', 'photos', 'sync', 'verify']);
});

test('finishing a step logs it, and post-account steps count as saved', () => {
  const events: [string, object][] = [];
  setAnalyticsSink((e, p) => events.push([e, p]));

  saveProfileStep('sports', false);
  saveProfileStep('photos', true);

  expect(events).toEqual([
    ['step_completed', { step: 'sports' }],
    ['step_completed', { step: 'photos' }],
    ['profile_step_saved', { step: 'photos' }],
  ]);
  expect(getOnboardingProgress().completed).toEqual(['sports', 'photos']);
});
