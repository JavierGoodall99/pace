import type { Gender, Lifestyle, PhotoLabel } from './identity';
import type { Provider, SyncSummary } from './sync';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import type { Level, Prompt, Route } from './athleteDepth';
import type { Discipline } from './mockData';
import { canonicalCity } from './places';

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
  // Activity sources the user has linked (Strava, Apple Health, …).
  connected: Provider[];
  verified: boolean;
  // What they're here for — set in onboarding.
  intent: Intent | null;
  // The days they train, Monday first. Drives rhythm matching; null
  // until onboarding's "build your week" step.
  trainingDays: boolean[] | null;
  // Effort level 1–4 (see athleteDepth LEVELS); null until onboarding.
  level: Level | null;
  // Race they're training for. null = not asked yet, '' = nothing specific.
  goalRaceId: string | null;
  prompts: Prompt[];
  pbs: { label: string; value: string; source?: Provider }[];
  // Favourite routes, added in Personal bests & routes.
  routes: Route[];
  // Last provider import.
  sync: SyncSummary | null;
  // Dating basics — null until asked in onboarding.
  gender: Gender | null;
  lifestyle: Lifestyle;
  // One label per entry in `photos` (same order).
  photoLabels: PhotoLabel[];
  // Faces found in each photo (same order); null = couldn't be checked.
  photoFaces: (number | null)[];
  photosUpdatedAt: string | null;
  // Women-first messaging: after a match, only you can start the chat.
  womenFirst: boolean;
}

export type Intent = 'love' | 'partner' | 'both';

export type AuthMethod = 'email' | 'apple' | 'google';

export interface StoredAccount {
  method: AuthMethod;
  // Stable id for this account (RevenueCat, analytics, later the server).
  userId: string;
  // May be empty: Apple lets people hide their email, and only sends it
  // on the first sign-in.
  email: string;
  // Email accounts only.
  password?: string;
  // Apple / Google accounts: the provider's user id.
  providerId?: string;
}

// What Apple or Google hand back after signing in.
export interface SocialProfile {
  method: 'apple' | 'google';
  providerId: string;
  email: string | null;
  name: string | null;
}

export const MIN_PASSWORD = 8;

function newUserId(): string {
  return `u-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

// Accounts saved before sign-in methods existed were email + password.
function migrateAccount(a: Partial<StoredAccount> | null | undefined): StoredAccount | null {
  if (!a) return null;
  return {
    ...a,
    method: a.method ?? 'email',
    userId: a.userId ?? newUserId(),
    email: a.email ?? '',
  };
}

interface SessionState {
  // Credentials stay on the device after sign-out so the user can sign
  // back in; `signedIn` says whether a session is active.
  account: StoredAccount | null;
  signedIn: boolean;
  me: MeProfile;
  onboarded: boolean;
  loading: boolean;
}

const STORAGE_KEY = 'pace.session.v1';

// First launch starts from a blank profile: onboarding fills it in
// before any account exists.
const DEFAULT_STATE: SessionState = {
  account: null,
  signedIn: false,
  me: freshMe('', ''),
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

export function getMe(): MeProfile {
  return state.me;
}

async function persist() {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        account: state.account,
        signedIn: state.signedIn,
        me: state.me,
        onboarded: state.onboarded,
      })
    );
  } catch (e) {
    console.warn('Failed to persist session:', e);
  }
}

// Profiles saved before the city picker may hold free text ("cape town",
// "Cape Town, WC"); map them onto the canonical city names.
function normaliseMe(me: MeProfile): MeProfile {
  return { ...me, city: canonicalCity(me.city) };
}

// Saves from before `connected` stored one flag per provider.
function migrateConnected(me: Partial<MeProfile> | undefined): Partial<MeProfile> {
  if (!me || me.connected) return me ?? {};
  const old = me as { stravaConnected?: boolean; garminConnected?: boolean };
  const connected: Provider[] = [];
  if (old.stravaConnected) connected.push('strava');
  if (old.garminConnected) connected.push('garmin');
  return { ...me, connected };
}

// Hydrate once at module load; screens render the default state until
// the stored session (if any) replaces it.
AsyncStorage.getItem(STORAGE_KEY)
  .then((raw) => {
    if (raw) {
      const saved = JSON.parse(raw) as Partial<SessionState>;
      setState({
        account: migrateAccount(saved.account),
        // Saves from before `signedIn` existed were signed in whenever
        // they held an account.
        signedIn: saved.signedIn ?? !!saved.account,
        me: normaliseMe({ ...freshMe('', ''), ...migrateConnected(saved.me) }),
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
    connected: [],
    verified: false,
    intent: null,
    trainingDays: null,
    level: null,
    goalRaceId: null,
    prompts: [],
    pbs: [],
    routes: [],
    gender: null,
    lifestyle: { drinks: null, diet: null, restDay: null },
    photoLabels: [],
    photoFaces: [],
    photosUpdatedAt: null,
    womenFirst: false,
    sync: null,
  };
}

// Pace is Cape Town only for now; everyone matches in their home city.
export function activeCity(me: MeProfile): string {
  return me.city;
}

export type AuthResult = { ok: true } | { ok: false; error: string };

function validateCredentials(email: string, password: string): string | null {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email.';
  if (password.length < MIN_PASSWORD)
    return `Password must be at least ${MIN_PASSWORD} characters.`;
  if (state.signedIn) return 'You are already signed in.';
  return null;
}

export async function signUp(name: string, email: string, password: string): Promise<AuthResult> {
  const trimmedEmail = email.trim().toLowerCase();
  if (name.trim().length === 0) return { ok: false, error: 'Enter your name.' };
  const error = validateCredentials(trimmedEmail, password);
  if (error) return { ok: false, error };
  setState({
    account: { method: 'email', userId: newUserId(), email: trimmedEmail, password },
    signedIn: true,
    me: freshMe(name.trim(), trimmedEmail),
    onboarded: false,
  });
  await persist();
  return { ok: true };
}

// Onboarding's account step: saves the profile built so far under a new
// account instead of starting over like signUp does.
export async function createAccount(email: string, password: string): Promise<AuthResult> {
  const trimmedEmail = email.trim().toLowerCase();
  const error = validateCredentials(trimmedEmail, password);
  if (error) return { ok: false, error };
  setState({
    account: { method: 'email', userId: newUserId(), email: trimmedEmail, password },
    signedIn: true,
    me: { ...state.me, email: trimmedEmail },
  });
  await persist();
  return { ok: true };
}

// Onboarding's account step with Apple or Google. Keeps the profile
// built so far and prefills the name if the provider sent one (the Name
// step still lets the user change it).
export async function createSocialAccount(p: SocialProfile): Promise<AuthResult> {
  if (state.signedIn) return { ok: false, error: 'You are already signed in.' };
  const email = (p.email ?? '').trim().toLowerCase();
  setState({
    account: { method: p.method, userId: newUserId(), email, providerId: p.providerId },
    signedIn: true,
    me: {
      ...state.me,
      email: email || state.me.email,
      name: state.me.name.trim() || (p.name ?? '').trim(),
    },
  });
  await persist();
  return { ok: true };
}

// Signing back in with Apple or Google: it has to be the same account.
export async function signInWithProfile(p: SocialProfile): Promise<AuthResult> {
  const account = state.account;
  if (!account || account.method !== p.method || account.providerId !== p.providerId) {
    return { ok: false, error: 'No Pace account for this login on this phone yet.' };
  }
  setState({ signedIn: true });
  await persist();
  return { ok: true };
}

export function getAccount(): StoredAccount | null {
  return state.account;
}

// "naledi@pace.fit", or how they sign in when there's no email to show
// (Apple lets people hide theirs).
export function signInLabel(account: StoredAccount | null, email: string): string {
  if (email) return email;
  if (account?.method === 'apple') return 'Sign in with Apple';
  if (account?.method === 'google') return 'Google';
  return '';
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  const trimmedEmail = email.trim().toLowerCase();
  const account = state.account;
  if (!account) {
    return { ok: false, error: 'No account for this email yet. Create one first.' };
  }
  if (account.method !== 'email') {
    return {
      ok: false,
      error: `This account uses ${account.method === 'apple' ? 'Sign in with Apple' : 'Google'}.`,
    };
  }
  if (account.email !== trimmedEmail || account.password !== password) {
    return { ok: false, error: 'Incorrect email or password.' };
  }
  setState({ signedIn: true });
  await persist();
  return { ok: true };
}

export async function signOut() {
  // Keep the account, profile + onboarded flags so the user can sign
  // back in; just end the session (mock).
  setState({ signedIn: false });
  await persist();
}

// Mock account deletion: wipes every Pace key on this device and resets
// the session. A real backend must delete server-side data too.
export async function deleteAccount() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    await AsyncStorage.multiRemove(keys.filter((k) => k.startsWith('pace.')));
  } catch (e) {
    console.warn('Failed to clear account data:', e);
  }
  setState({ account: null, signedIn: false, me: freshMe('', ''), onboarded: false });
}

export async function updateMe(patch: Partial<MeProfile>) {
  const next = { ...state.me, ...patch };
  // The badge vouches for the photos it was earned with. Adding a new
  // photo takes it away until the selfie check is done again, so nobody
  // can verify and then swap in someone else's pictures.
  if (patch.photos && patch.verified === undefined && state.me.verified) {
    const added = patch.photos.some((p) => !state.me.photos.includes(p));
    if (added) next.verified = false;
  }
  setState({ me: patch.city !== undefined ? normaliseMe(next) : next });
  await persist();
}

export async function completeOnboarding() {
  setState({ onboarded: true });
  await persist();
}
