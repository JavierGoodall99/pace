import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

// Mock of the social graph: who liked you and who you matched with.
// Seeded from the design's fixed match set; both lists are editable in
// the Likes inbox and Matches screens until a real backend exists.

export const LIKES_IDS = [2, 4, 6, 8];
export const MATCH_IDS = [1, 3, 5, 7];

interface SocialState {
  likes: number[];
  matches: number[];
  blocked: number[];
}

const STORAGE_KEY = 'pace.social.v1';

const DEFAULT_STATE: SocialState = { likes: LIKES_IDS, matches: MATCH_IDS, blocked: [] };

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
      });
    }
  })
  .catch(() => {});

export async function likeBack(athleteId: number) {
  setState({
    likes: state.likes.filter((id) => id !== athleteId),
    matches: state.matches.includes(athleteId) ? state.matches : [...state.matches, athleteId],
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