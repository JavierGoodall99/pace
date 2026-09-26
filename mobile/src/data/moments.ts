import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import type { Discipline } from './mockData';
import { ATHLETE_ACTION_PHOTOS, ATHLETE_PHOTOS } from './photos';
import { DEMO_DATA } from '../config';

// Session moments: after a workout you post one photo that your matches
// see for 24 hours. Keeps profiles honest and fresh, and gives matches a
// natural reason to say something. Kudos is the one-tap reaction.

export type MomentAuthor = number | 'me';

export interface Moment {
  id: string;
  author: MomentAuthor;
  // A bundled image (require id) or a picked photo uri.
  source: number | { uri: string };
  caption: string;
  activity: Discipline;
  stat?: string; // "10 km · 52:10"
  at: string; // ISO
  kudos: number; // from others
}

export const MOMENT_TTL_MS = 24 * 3600000;

interface MomentsState {
  moments: Moment[];
  myKudos: string[]; // moment ids I gave kudos to
  seen: string[];
}

const STORAGE_KEY = 'pace.moments.v1';

function hoursAgo(now: Date, h: number) {
  return new Date(now.getTime() - h * 3600000).toISOString();
}

function seed(now: Date = new Date()): MomentsState {
  if (!DEMO_DATA) return { moments: [], myKudos: [], seen: [] };
  return {
    moments: [
      {
        id: 'm-lerato',
        author: 1,
        source: ATHLETE_ACTION_PHOTOS['athlete-1'],
        caption: 'Sunrise 16 km. Legs are cooked, heart is full.',
        activity: 'RUNNING',
        stat: '16 km · 5:02/km',
        at: hoursAgo(now, 3),
        kudos: 12,
      },
      {
        id: 'm-amahle',
        author: 3,
        source: ATHLETE_ACTION_PHOTOS['athlete-3'],
        caption: 'Lion’s Head before work. Worth the 4:45 alarm.',
        activity: 'TRAIL',
        stat: '9 km · 640 m up',
        at: hoursAgo(now, 7),
        kudos: 8,
      },
      {
        id: 'm-zanele',
        author: 7,
        source: ATHLETE_PHOTOS['athlete-7'],
        caption: 'Brick session done. Coffee is the recovery plan.',
        activity: 'TRIATHLON',
        stat: '30 km + 5 km',
        at: hoursAgo(now, 15),
        kudos: 19,
      },
    ],
    myKudos: [],
    seen: [],
  };
}

let state: MomentsState = seed();
const listeners = new Set<() => void>();

function setState(patch: Partial<MomentsState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
  // Only persist my own moments and kudos; seeds are regenerated fresh.
  AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      mine: state.moments.filter((m) => m.author === 'me'),
      myKudos: state.myKudos,
      seen: state.seen,
    })
  ).catch(() => {});
}

AsyncStorage.getItem(STORAGE_KEY)
  .then((raw) => {
    if (!raw) return;
    const saved = JSON.parse(raw) as { mine: Moment[]; myKudos: string[]; seen: string[] };
    state = {
      moments: [...(saved.mine ?? []), ...seed().moments],
      myKudos: saved.myKudos ?? [],
      seen: saved.seen ?? [],
    };
    listeners.forEach((l) => l());
  })
  .catch(() => {});

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useMoments(): MomentsState {
  return useSyncExternalStore(subscribe, () => state);
}

export function resetMoments(now?: Date) {
  state = seed(now);
  listeners.forEach((l) => l());
}

// Live moments visible to me: mine plus my matches', newest first.
export function liveMoments(s: MomentsState, matches: number[], now: Date = new Date()): Moment[] {
  return s.moments
    .filter((m) => now.getTime() - new Date(m.at).getTime() < MOMENT_TTL_MS)
    .filter((m) => m.author === 'me' || matches.includes(m.author))
    .sort((a, b) => b.at.localeCompare(a.at));
}

export function postMoment(input: Omit<Moment, 'id' | 'author' | 'at' | 'kudos'>): Moment {
  const m: Moment = {
    ...input,
    id: `m-${Date.now().toString(36)}`,
    author: 'me',
    at: new Date().toISOString(),
    kudos: 0,
  };
  setState({ moments: [m, ...state.moments] });
  return m;
}

// Only your own moments can be deleted.
export function deleteMoment(id: string) {
  setState({
    moments: state.moments.filter((m) => !(m.id === id && m.author === 'me')),
  });
}

export function toggleKudos(id: string) {
  setState({
    myKudos: state.myKudos.includes(id)
      ? state.myKudos.filter((x) => x !== id)
      : [...state.myKudos, id],
  });
}

export function markSeen(id: string) {
  if (!state.seen.includes(id)) setState({ seen: [...state.seen, id] });
}

export function kudosCount(s: MomentsState, m: Moment): number {
  return m.kudos + (s.myKudos.includes(m.id) ? 1 : 0);
}

export function timeLeft(m: Moment, now: Date = new Date()): string {
  const left = MOMENT_TTL_MS - (now.getTime() - new Date(m.at).getTime());
  const h = Math.max(0, Math.floor(left / 3600000));
  return h >= 1 ? `${h}h left` : 'Ending soon';
}

export function postedAgo(m: Moment, now: Date = new Date()): string {
  const mins = Math.floor((now.getTime() - new Date(m.at).getTime()) / 60000);
  if (mins < 60) return mins <= 1 ? 'Just now' : `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

export function getMomentsState(): MomentsState {
  return state;
}
