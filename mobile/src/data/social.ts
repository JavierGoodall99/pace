import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import type { Gender } from './identity';
import { DEMO_DATA, demo } from '../config';

// Mock of the social graph: who liked you and who you matched with.
// Seeded from the design's fixed match set; both lists are editable in
// the Likes inbox and Matches screens until a real backend exists.

export const LIKES_IDS = [2, 4, 6, 8];
export const MATCH_IDS = [1, 3, 5, 7];

export type ReportReason =
  'money' | 'fake' | 'inappropriate' | 'harassment' | 'safety' | 'underage' | 'other';

export interface Report {
  athleteId: number;
  reason: ReportReason;
  detail: string;
  at: string;
}

interface SocialState {
  likes: number[];
  matches: number[];
  blocked: number[];
  reports: Report[];
  // When each match happened — silent matches expire (MATCH_TTL_DAYS).
  matchedAt: Record<number, string>;
  // People you swiped left on, and when. They stay out of the deck for
  // PASS_COOLDOWN_DAYS, then may come back.
  passed: Record<number, string>;
  // Order of passes, newest last, so the latest can be undone.
  passOrder: number[];
}

export const PASS_COOLDOWN_DAYS = 30;

const STORAGE_KEY = 'pace.social.v1';

const DEFAULT_STATE: SocialState = {
  likes: demo(LIKES_IDS, []),
  matches: demo(MATCH_IDS, []),
  blocked: [],
  reports: [],
  matchedAt: {},
  passed: {},
  passOrder: [],
};

let state: SocialState = DEFAULT_STATE;
const listeners = new Set<() => void>();

function setState(patch: Partial<SocialState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

function getSnapshot(): SocialState {
  return state;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSocialState(): SocialState {
  return state;
}

// Invites to train are only for people you've matched with: you both
// liked each other.
export function isMatched(athleteId: number, s: SocialState = state): boolean {
  return s.matches.includes(athleteId);
}

// Recently passed people, excluded from the swipe deck.
export function recentlyPassed(s: SocialState, now: Date = new Date()): number[] {
  const cutoff = now.getTime() - PASS_COOLDOWN_DAYS * 86400000;
  return Object.entries(s.passed)
    .filter(([, at]) => new Date(at).getTime() >= cutoff)
    .map(([id]) => Number(id));
}

export async function passPacer(athleteId: number, now: Date = new Date()) {
  setState({
    passed: { ...state.passed, [athleteId]: now.toISOString() },
    passOrder: [...state.passOrder.filter((id) => id !== athleteId), athleteId],
  });
  await persist();
}

// Rewind the most recent pass. Returns the athlete brought back, if any.
export async function undoLastPass(): Promise<number | null> {
  const id = state.passOrder[state.passOrder.length - 1];
  if (id === undefined) return null;
  const passed = { ...state.passed };
  delete passed[id];
  setState({ passed, passOrder: state.passOrder.slice(0, -1) });
  await persist();
  return id;
}

// "Show people I passed on" from the empty deck.
export async function clearPasses() {
  setState({ passed: {}, passOrder: [] });
  await persist();
}

export function useSocial(): SocialState {
  return useSyncExternalStore(subscribe, getSnapshot);
}

export function resetSocial() {
  setState(DEFAULT_STATE);
}

// The demo cast a new account starts with. Pace matches women with men,
// so it depends on who you are: the default lists (women matched, men
// liking you) only fit a man.
export function demoGraphFor(gender: Gender | null): { likes: number[]; matches: number[] } {
  if (!DEMO_DATA) return { likes: [], matches: [] };
  // Only a couple of matches, so most demo people stay in the deck.
  if (gender === 'woman') return { likes: [6, 8], matches: [2] };
  if (gender === 'man') return { likes: [7], matches: [1, 5] };
  return { likes: [], matches: [] };
}

export async function seedSocialFor(gender: Gender | null) {
  setState({ ...DEFAULT_STATE, ...demoGraphFor(gender) });
  await persist();
}

async function persist() {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to persist social state:', e);
  }
}

AsyncStorage.getItem(STORAGE_KEY)
  .then((raw) => {
    if (raw) {
      const saved = JSON.parse(raw) as Partial<SocialState>;
      setState({
        likes: saved.likes ?? DEFAULT_STATE.likes,
        matches: saved.matches ?? DEFAULT_STATE.matches,
        blocked: saved.blocked ?? [],
        reports: saved.reports ?? [],
        matchedAt: saved.matchedAt ?? {},
        passed: saved.passed ?? {},
        passOrder: saved.passOrder ?? [],
      });
    }
  })
  .catch(() => {});

export async function likeBack(athleteId: number) {
  setState({
    likes: state.likes.filter((id) => id !== athleteId),
    matches: state.matches.includes(athleteId) ? state.matches : [...state.matches, athleteId],
    matchedAt: state.matchedAt[athleteId]
      ? state.matchedAt
      : { ...state.matchedAt, [athleteId]: new Date().toISOString() },
  });
  await persist();
}

export async function passOn(athleteId: number) {
  setState({ likes: state.likes.filter((id) => id !== athleteId) });
  await persist();
}

export async function blockAthlete(athleteId: number) {
  setState({
    likes: state.likes.filter((id) => id !== athleteId),
    matches: state.matches.filter((id) => id !== athleteId),
    blocked: state.blocked.includes(athleteId) ? state.blocked : [...state.blocked, athleteId],
  });
  await persist();
}
export async function unblockAthlete(athleteId: number) {
  setState({ blocked: state.blocked.filter((id) => id !== athleteId) });
  await persist();
}

export async function unmatchAthlete(athleteId: number) {
  setState({ matches: state.matches.filter((id) => id !== athleteId) });
  await persist();
}

export async function fileReport(report: Omit<Report, 'at'>) {
  setState({ reports: [...state.reports, { ...report, at: new Date().toISOString() }] });
  await persist();
}
