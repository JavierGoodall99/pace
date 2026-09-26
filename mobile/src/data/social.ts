import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

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
}

const STORAGE_KEY = 'pace.social.v1';

const DEFAULT_STATE: SocialState = {
  likes: LIKES_IDS,
  matches: MATCH_IDS,
  blocked: [],
  reports: [],
  matchedAt: {},
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

export function useSocial(): SocialState {
  return useSyncExternalStore(subscribe, getSnapshot);
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
        likes: saved.likes ?? LIKES_IDS,
        matches: saved.matches ?? MATCH_IDS,
        blocked: saved.blocked ?? [],
        reports: saved.reports ?? [],
        matchedAt: saved.matchedAt ?? {},
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
