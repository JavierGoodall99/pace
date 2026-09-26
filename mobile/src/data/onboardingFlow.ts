import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import { track } from '../lib/analytics';
import { photoProblem } from './identity';
import { isLaunchCity } from './places';
import type { MeProfile } from './session';
import { hasSync } from './sync';

// The onboarding flow: step order, what counts as answered, and where to
// pick up again after the app was closed.
//
// Screens 3–10 are answered before an account exists; 12–17 after. Every
// answer is written straight into the session profile (`updateMe`), and
// which steps are done is kept here, both on the phone. There's no
// server yet: `saveProfileStep` is where a backend write goes for the
// post-account steps (docs/backend-todo.md).

export type StepId =
  | 'welcome'
  | 'meet'
  | 'city'
  | 'basics'
  | 'sports'
  | 'week'
  | 'level'
  | 'time'
  | 'intent'
  | 'goal'
  | 'account'
  | 'name'
  | 'gender'
  | 'lifestyle'
  | 'photos'
  | 'sync'
  | 'verify'
  | 'building'
  | 'reveal'
  | 'paywall'
  | 'launch';

export const STEPS: StepId[] = [
  'welcome',
  'meet',
  'city',
  'basics',
  'sports',
  'week',
  'level',
  'time',
  'intent',
  'goal',
  'account',
  'name',
  'gender',
  'lifestyle',
  'photos',
  'sync',
  'verify',
  'building',
  'reveal',
  'paywall',
  'launch',
];

// Screens the progress bar covers.
export const QUESTIONS: StepId[] = STEPS.slice(STEPS.indexOf('city'), STEPS.indexOf('verify') + 1);

// Questions that make up the profile ("Profile strength"); the account
// isn't part of the card.
export const PROFILE_QUESTIONS: StepId[] = QUESTIONS.filter((s) => s !== 'account');

// Answered after the account exists: saved to the account as each one
// completes.
export const POST_ACCOUNT: StepId[] = ['name', 'gender', 'lifestyle', 'photos', 'sync', 'verify'];

export const SKIPPABLE: StepId[] = ['sync', 'verify'];

export function answered(step: StepId, me: MeProfile): boolean {
  switch (step) {
    case 'city':
      // Only Cape Town can carry on; everyone else joins the waitlist.
      return isLaunchCity(me.city);
    case 'name':
      return me.name.trim().length > 0;
    case 'gender':
      return !!me.gender;
    case 'intent':
      return !!me.intent;
    case 'sports':
      return me.disciplines.length > 0;
    case 'week':
      return !!me.trainingDays?.some(Boolean);
    case 'time':
      return me.times.length > 0;
    case 'level':
      return me.level != null;
    case 'goal':
      return me.goalRaceId !== null;
    case 'basics':
      return Number(me.age) >= 18;
    case 'lifestyle':
      return !!me.lifestyle.drinks && !!me.lifestyle.diet && !!me.lifestyle.restDay;
    case 'photos':
      return photoProblem(me.photos, me.photoLabels, me.photoFaces) === null;
    case 'sync':
      return hasSync(me);
    case 'verify':
      return me.verified;
    default:
      return true;
  }
}

// ---- Saved progress -------------------------------------------------

export interface OnboardingProgress {
  // Steps finished (or skipped). null = never recorded: profiles from
  // before this existed, where progress is worked out from the answers.
  completed: StepId[] | null;
  paywallSeen: boolean;
  started: boolean;
}

interface ProgressState extends OnboardingProgress {
  ready: boolean;
}

const STORAGE_KEY = 'pace.onboarding.v1';
const EMPTY: OnboardingProgress = { completed: null, paywallSeen: false, started: false };

let state: ProgressState = { ...EMPTY, ready: false };
const listeners = new Set<() => void>();

function setState(patch: Partial<ProgressState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
  const { ready: _ready, ...saved } = state;
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(saved)).catch(() => {});
}

AsyncStorage.getItem(STORAGE_KEY)
  .then((raw) => {
    const saved = raw ? (JSON.parse(raw) as Partial<OnboardingProgress>) : {};
    state = { ...EMPTY, ...saved, ready: true };
    listeners.forEach((l) => l());
  })
  .catch(() => {
    state = { ...state, ready: true };
    listeners.forEach((l) => l());
  });

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useOnboardingProgress(): ProgressState {
  return useSyncExternalStore(subscribe, () => state);
}

export function getOnboardingProgress(): ProgressState {
  return state;
}

export function markStepDone(step: StepId) {
  const completed = state.completed ?? [];
  if (!completed.includes(step)) setState({ completed: [...completed, step] });
}

export function markPaywallSeen() {
  setState({ paywallSeen: true });
}

// "onboarding_started" fires once per device, on the first run.
export function markStarted() {
  if (state.started) return;
  setState({ started: true });
  track('onboarding_started');
}

export function resetOnboardingProgress() {
  setState({ ...EMPTY });
}

// A step just finished. Post-account steps are saved to the account —
// today that's the local profile; with a backend, write here.
export function saveProfileStep(
  step: StepId,
  signedIn: boolean,
  props: Record<string, string> = {}
) {
  markStepDone(step);
  track('step_completed', { step, ...props });
  if (signedIn && POST_ACCOUNT.includes(step)) track('profile_step_saved', { step });
}

// ---- Where to resume ------------------------------------------------

export function isStepDone(
  step: StepId,
  p: OnboardingProgress,
  me: MeProfile,
  signedIn: boolean
): boolean {
  if (step === 'account') return signedIn;
  if (step === 'paywall') return p.paywallSeen;
  const required = QUESTIONS.includes(step) && !SKIPPABLE.includes(step);
  if (p.completed === null) {
    // Nothing recorded (older profile): go by the answers alone.
    if (step === 'welcome' || step === 'meet')
      return QUESTIONS.some((q) => q !== 'account' && answered(q, me));
    return QUESTIONS.includes(step) && answered(step, me);
  }
  // A required answer that's gone missing sends you back to it.
  return p.completed.includes(step) && (!required || answered(step, me));
}

// Index of the first step that isn't done yet; the last step if all are.
export function resumeIndex(
  steps: StepId[],
  p: OnboardingProgress,
  me: MeProfile,
  signedIn: boolean
): number {
  const i = steps.findIndex((s) => !isStepDone(s, p, me, signedIn));
  return i === -1 ? steps.length - 1 : i;
}
