import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import { depthFor } from './athleteDepth';
import { athleteById, THREAD_MESSAGES, ThreadMessage } from './mockData';
import type { MeProfile } from './session';
import { getSocialState, likeBack } from './social';
import { dayKeyOf, likesLeft, matchHoursLeft } from './trust';

// Chat threads and first-move likes. A like can target a specific photo
// or prompt and carry a comment; if it's mutual, the comment opens the
// thread. Messages can be text, a voice note or a photo reply.
// Local mock until a backend exists.

export interface LikeTarget {
  kind: 'photo' | 'prompt';
  index: number;
  label: string; // "Two Oceans build" / the prompt question
  text?: string; // the prompt answer, for prompt likes
}

export interface ChatMessage extends ThreadMessage {
  at?: string;
  voiceSec?: number;
  photoUri?: string;
  like?: LikeTarget;
}

interface ChatState {
  threads: Record<number, ChatMessage[]>;
  // Athletes you've sent a like to (pending until they like back).
  sentLikes: number[];
  // Today's like budget use (see LIKES_PER_DAY).
  likesUsed?: { day: string; count: number };
}

const STORAGE_KEY = 'pace.chat.v1';

function seed(): ChatState {
  return { threads: { ...THREAD_MESSAGES }, sentLikes: [] };
}

let state: ChatState = seed();
const listeners = new Set<() => void>();

function setState(patch: Partial<ChatState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
}

AsyncStorage.getItem(STORAGE_KEY)
  .then((raw) => {
    if (!raw) return;
    state = { ...seed(), ...(JSON.parse(raw) as Partial<ChatState>) };
    listeners.forEach((l) => l());
  })
  .catch(() => {});

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useChat(): ChatState {
  return useSyncExternalStore(subscribe, () => state);
}

export function getChatState(): ChatState {
  return state;
}

export function resetChat() {
  state = seed();
  listeners.forEach((l) => l());
}

export function messagesWith(s: ChatState, athleteId: number): ChatMessage[] {
  return s.threads[athleteId] ?? [];
}

export function sendMessage(athleteId: number, msg: Omit<ChatMessage, 'at'>) {
  const list = state.threads[athleteId] ?? [];
  setState({
    threads: {
      ...state.threads,
      [athleteId]: [...list, { ...msg, at: new Date().toISOString() }],
    },
  });
}

type MatchInfo = { matches: number[]; blocked: number[]; matchedAt: Record<number, string> };

// A match you can still act on: not blocked, and not a silent match
// past MATCH_TTL_DAYS (nobody said anything in time). Chats, Matches,
// the thread, profile and invites all use this so they agree.
export function isActiveMatch(
  athleteId: number,
  social: MatchInfo,
  chat: ChatState,
  now: Date = new Date()
): boolean {
  if (!social.matches.includes(athleteId) || social.blocked.includes(athleteId)) return false;
  const at = social.matchedAt[athleteId];
  if (!at || messagesWith(chat, athleteId).length > 0) return true;
  return matchHoursLeft(at, now) > 0;
}

export function activeMatches(
  social: MatchInfo,
  chat: ChatState,
  now: Date = new Date()
): number[] {
  return social.matches.filter((id) => isActiveMatch(id, social, chat, now));
}

// Women-first: if she has it on, a man can't open the chat — she makes
// the first move. Returns why the composer is locked, or null.
export function composerLock(me: MeProfile, athleteId: number, s: ChatState): string | null {
  const a = athleteById(athleteId);
  if (!a) return null;
  const theirs = messagesWith(s, athleteId).some((m) => m.from === 'them');
  if (theirs) return null;
  if (depthFor(a).womenFirst && me.gender === 'man') {
    return `${a.name} makes the first move here. We’ll ping you when she says hi.`;
  }
  return null;
}

// Athletes who answer a like in the demo, and what they say back.
const LIKE_REPLIES: Record<number, string> = {
  1: 'Ha, that was mile 18. Worth it though! Run this week?',
  2: 'Chappies at sunrise is unbeatable. You ride?',
  3: 'Thank you! That summit was hard earned. Trail this weekend?',
  5: 'Friday boxing is my therapy. Want to try a session?',
  7: 'You noticed! Midmar is in February — swim buddy?',
  8: 'Appreciate it! Tuesday track is open if you’re keen.',
};

export function hasLiked(s: ChatState, athleteId: number): boolean {
  return s.sentLikes.includes(athleteId);
}

// Send a like on a photo or prompt, optionally with a comment. If they
// already liked you it's a match straight away. In the demo, most other
// athletes like back after a moment. Either way the thread opens with
// your like/comment, and invites to train unlock.
// Returns 'match' when the like matched instantly, otherwise 'sent'.
export function sendLike(
  athleteId: number,
  like: LikeTarget,
  comment: string,
  opts: { replyDelayMs?: number; onMatch?: (athleteId: number) => void } = {}
): 'match' | 'sent' {
  const today = dayKeyOf();
  const used = state.likesUsed?.day === today ? state.likesUsed.count : 0;
  if (!state.sentLikes.includes(athleteId)) {
    setState({
      sentLikes: [...state.sentLikes, athleteId],
      likesUsed: { day: today, count: used + 1 },
    });
  }

  const mine: ChatMessage = {
    from: 'me',
    text: comment.trim(),
    like,
    at: new Date().toISOString(),
  };
  const openThread = (reply?: string) => {
    const list = state.threads[athleteId] ?? [];
    setState({
      sentLikes: state.sentLikes.filter((id) => id !== athleteId),
      threads: {
        ...state.threads,
        [athleteId]: [
          ...list,
          mine,
          ...(reply ? [{ from: 'them' as const, text: reply, at: new Date().toISOString() }] : []),
        ],
      },
    });
  };

  if (getSocialState().likes.includes(athleteId)) {
    likeBack(athleteId);
    openThread();
    opts.onMatch?.(athleteId);
    return 'match';
  }

  const reply = LIKE_REPLIES[athleteId];
  if (!reply) return 'sent';
  setTimeout(() => {
    likeBack(athleteId);
    openThread(reply);
    opts.onMatch?.(athleteId);
  }, opts.replyDelayMs ?? 2600);
  return 'sent';
}

// Preview line for the chat list.
export function previewOf(m: ChatMessage | undefined): string {
  if (!m) return '';
  if (m.voiceSec) return `Voice note · 0:${String(m.voiceSec).padStart(2, '0')}`;
  if (m.photoUri) return 'Photo';
  if (m.like && !m.text) return `Liked “${m.like.label}”`;
  if (m.plan) return m.text || 'Session invite';
  return m.text;
}

export function clearThread(athleteId: number) {
  const threads = { ...state.threads };
  delete threads[athleteId];
  setState({ threads, sentLikes: state.sentLikes.filter((id) => id !== athleteId) });
}

export function updateMessage(athleteId: number, index: number, patch: Partial<ChatMessage>) {
  const list = state.threads[athleteId] ?? [];
  setState({
    threads: {
      ...state.threads,
      [athleteId]: list.map((m, i) => (i === index ? { ...m, ...patch } : m)),
    },
  });
}

export function likesLeftToday(s: ChatState, now: Date = new Date()): number {
  return likesLeft(s.likesUsed, now);
}
