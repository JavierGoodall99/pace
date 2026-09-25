import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import type { Discipline } from './mockData';

// Local mock of the auth + profile backend. There is no real server yet:
// the account lives in AsyncStorage and every "server" transition below
// is a placeholder for a real endpoint. Do not ship this as auth.

export interface MeProfile {
  name: string;
  age: string;
  city: string;
  email: string;
  bio: string;
  disciplines: Discipline[];
  cadence: string | null;
  times: string[];
  photos: string[];
  stravaConnected: boolean;
  garminConnected: boolean;
  verified: boolean;
  // What they're here for — set in onboarding.
  intent: Intent | null;
  // The days they train, Monday first. Drives rhythm matching; null
  // until onboarding's "build your week" step.
  trainingDays: boolean[] | null;
}

export type Intent = 'love' | 'partner' | 'both';

export interface StoredAccount {
  email: string;
  password: string;
}

interface SessionState {
  account: StoredAccount | null;
  me: MeProfile;
  onboarded: boolean;
  loading: boolean;
}

const STORAGE_KEY = 'pace.session.v1';

const DEFAULT_ME: MeProfile = {
  name: 'Naledi Khumalo',
  age: '29',
  city: 'Pretoria',
  email: 'naledi@pace.fit',
  bio: 'Competing at regionals next year. Coffee after WODs, always.',
  disciplines: ['CROSSFIT'],
  cadence: '4-5X/WK',
  times: ['EARLY MORNING'],
  photos: [],
  stravaConnected: false,
  garminConnected: false,
  verified: true,
  intent: 'both',
  trainingDays: null,
};

const DEFAULT_STATE: SessionState = {
  account: null,
  me: DEFAULT_ME,
  onboarded: false,
  loading: true,
};

let state: SessionState = DEFAULT_STATE;
const listeners = new Set<() => void>();

function setState(patch: Partial<SessionState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

function getSnapshot(): SessionState {
  return state;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useSession(): SessionState {
  return useSyncExternalStore(subscribe, getSnapshot);
}

export function useMe(): MeProfile {
  return useSession().me;
}

async function persist() {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        account: state.account,
        me: state.me,
        onboarded: state.onboarded,
      })
    );
  } catch (e) {
    console.warn('Failed to persist session:', e);
  }
}

// Hydrate once at module load; screens render the default state until
// the stored session (if any) replaces it.
AsyncStorage.getItem(STORAGE_KEY)
  .then((raw) => {
    if (raw) {
      const saved = JSON.parse(raw) as Partial<SessionState>;
      setState({
        account: saved.account ?? null,
        me: { ...DEFAULT_ME, ...saved.me },
        onboarded: saved.onboarded ?? false,
        loading: false,
      });
    } else {
      setState({ loading: false });
    }
  })
  .catch(() => setState({ loading: false }));

export function freshMe(name: string, email: string): MeProfile {
  return {
    name,
    age: '',
    city: '',
    email,
    bio: '',
    disciplines: [],
    cadence: null,
    times: [],
    photos: [],
    stravaConnected: false,
    garminConnected: false,
    verified: false,
    intent: null,
    trainingDays: null,
  };
}

export type AuthResult = { ok: true } | { ok: false; error: string };

export async function signUp(name: string, email: string, password: string): Promise<AuthResult> {
  const trimmedEmail = email.trim().toLowerCase();
  if (name.trim().length === 0) return { ok: false, error: 'Enter your name.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return { ok: false, error: 'Enter a valid email.' };
  }
  if (password.length < 6) return { ok: false, error: 'Password must be at least 6 characters.' };
  if (state.account) return { ok: false, error: 'You are already signed in.' };
  setState({
    account: { email: trimmedEmail, password },
    me: freshMe(name.trim(), trimmedEmail),
    onboarded: false,
  });
  await persist();
  return { ok: true };
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  const trimmedEmail = email.trim().toLowerCase();
  const account = state.account;
  if (!account) {
    return { ok: false, error: 'No account for this email yet. Create one first.' };
  }
  if (account.email !== trimmedEmail || account.password !== password) {
    return { ok: false, error: 'Incorrect email or password.' };
  }
  setState({});
  await persist();
  return { ok: true };
}

export async function signOut() {
  // Keep the profile + onboarded flags, just end the session (mock).
  setState({ account: null });
  await persist();
}

export async function updateMe(patch: Partial<MeProfile>) {
  setState({ me: { ...state.me, ...patch } });
  await persist();
}

export async function completeOnboarding() {
  setState({ onboarded: true });
  await persist();
}
