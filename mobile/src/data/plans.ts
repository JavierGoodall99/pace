import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import type { Level } from './athleteDepth';
import { dateFromWhenLabel, daysFrom, dropKey, nextDateFor } from './dates';
import type { Discipline, PlanCard, PlanStatus as CardStatus } from './mockData';
import { isMatched } from './social';
import type { IlloName } from '../components/Illustrations';
import { DEMO_DATA, demo } from '../config';

// Sessions are the core of Pace: once two people match (they liked each
// other), the relationship moves forward through sessions, not chat.
// Invites to train are only possible between matches.
//
//   Plan         — a 1:1 session with someone (sent/received invite →
//                  confirmed → done), plus private post-session check-ins
//   OpenSession  — a session anyone can ask to join (1:1 or group)
//   drop         — legacy daily-drop actions (the swipe deck replaced it;
//                  passes now live in social.ts)
//
// Local mock until a backend exists; seeds are relative to "now" so the
// demo always has something upcoming and something to check in on.

export type DropAction = 'invited' | 'skipped' | 'liked';
export type CheckIn = 'again' | 'coffee' | 'buddies';
export type PlanStatus = 'sent' | 'received' | 'confirmed' | 'declined' | 'done';

export interface Plan {
  id: string;
  athleteId: number;
  activity: Discipline;
  date: string; // ISO datetime
  place: string;
  status: PlanStatus;
  note?: string;
  shareWithFriend?: boolean;
  checkInTimer?: boolean;
  myCheckIn?: CheckIn;
  theirCheckIn?: CheckIn;
}

export type Attendee = number | 'me';

export interface OpenSession {
  id: string;
  hostId: Attendee;
  title: string;
  activity: Discipline;
  date: string;
  place: string;
  city: string;
  distance: string;
  level: Level;
  spots: number; // places besides the host
  joined: Attendee[];
  note?: string;
  // Singles run club: open to singles only, with a gender-balanced
  // guest list so nobody walks into a room of 9 guys and one woman.
  singles?: boolean;
  balance?: { women: number; men: number }; // spots held per side
  // You joined with the check-in timer on.
  myCheckIn?: boolean;
}

interface PlansState {
  plans: Plan[];
  open: OpenSession[];
  drop: { week: string; actions: Record<number, DropAction> };
  // Plan just accepted by the other person — the app celebrates it once.
  celebrate: string | null;
}

// Athletes who say yes to invites in the demo (others stay pending).
const RESPONDERS = demo([1, 2, 3, 5, 7, 8], []);
// How each athlete answers a post-session check-in in the demo.
const THEIR_CHECKIN: Record<number, CheckIn> = {
  1: 'again',
  2: 'buddies',
  3: 'coffee',
  5: 'again',
  7: 'coffee',
  8: 'again',
};

function seed(now: Date = new Date()): PlansState {
  if (!DEMO_DATA)
    return { plans: [], open: [], drop: { week: dropKey(now), actions: {} }, celebrate: null };
  const iso = (d: Date) => d.toISOString();
  return {
    plans: [
      {
        id: 'p-lerato-next',
        athleteId: 1,
        activity: 'RUNNING',
        date: iso(nextDateFor(5, '06:00', now)),
        place: 'Sea Point Promenade',
        status: 'confirmed',
        shareWithFriend: true,
      },
      {
        // Invites only come from matches; Zanele (7) is one.
        id: 'p-zanele-invite',
        athleteId: 7,
        activity: 'TRIATHLON',
        date: iso(nextDateFor(1, '06:30', now)),
        place: 'Sea Point Pavilion pool',
        status: 'received',
        note: 'Easy swim set, then coffee?',
      },
      {
        // Lerato's "trail with me?" card in chat points at this plan.
        id: 'p-lerato-trail',
        athleteId: 1,
        activity: 'TRAIL',
        date: iso(nextDateFor(6, '07:00', now)),
        place: 'Table Mountain, Cape Town',
        status: 'received',
      },
      {
        id: 'p-amahle-sent',
        athleteId: 3,
        activity: 'TRAIL',
        date: iso(nextDateFor(6, '06:30', now)),
        place: 'Kloof Nek parking, Lion’s Head',
        status: 'sent',
      },
      {
        id: 'p-zanele-done',
        athleteId: 7,
        activity: 'TRIATHLON',
        date: iso(daysFrom(now, -2, '07:00')),
        place: 'Rondebosch Common',
        status: 'done',
        theirCheckIn: 'coffee',
      },
      {
        id: 'p-lerato-1',
        athleteId: 1,
        activity: 'RUNNING',
        date: iso(daysFrom(now, -9, '06:00')),
        place: 'Sea Point Promenade',
        status: 'done',
        myCheckIn: 'again',
        theirCheckIn: 'again',
      },
      {
        id: 'p-lerato-2',
        athleteId: 1,
        activity: 'TRAIL',
        date: iso(daysFrom(now, -16, '06:30')),
        place: 'Kloof Nek parking, Lion’s Head',
        status: 'done',
        myCheckIn: 'coffee',
        theirCheckIn: 'coffee',
      },
    ],
    open: [
      {
        id: 'o-singles-sunrise',
        hostId: 8,
        title: 'Singles sunrise run club',
        activity: 'RUNNING',
        date: iso(nextDateFor(5, '06:30', now)),
        place: 'Green Point Urban Park',
        city: 'Cape Town',
        distance: '6 km · chatty pace',
        level: 1,
        spots: 11,
        joined: [5, 4, 3],
        note: 'Singles only, 6 women + 6 men. Easy loop, then coffee at the gate. Name tags provided.',
        singles: true,
        balance: { women: 6, men: 6 },
      },
      {
        id: 'o-singles-padel',
        hostId: 7,
        title: 'Singles trail + braai',
        activity: 'TRAIL',
        date: iso(nextDateFor(6, '08:00', now)),
        place: 'Rhodes Memorial',
        city: 'Cape Town',
        distance: '8 km · rotating pairs',
        level: 2,
        spots: 7,
        joined: [2, 6],
        note: 'Swap running partners every 2 km on the contour path, then coffee at the memorial. Balanced 4 + 4.',
        singles: true,
        balance: { women: 4, men: 4 },
      },
      {
        id: 'o-kagiso-track',
        hostId: 8,
        title: 'Tuesday track session',
        activity: 'RUNNING',
        date: iso(nextDateFor(1, '17:30', now)),
        place: 'Green Point Athletics Stadium',
        city: 'Cape Town',
        distance: '8 km · 6×800 m',
        level: 4,
        spots: 4,
        joined: [2],
        note: 'All paces welcome for the warm-up. Tacos after.',
      },
      {
        id: 'o-sipho-ride',
        hostId: 2,
        title: 'Saturday coffee ride',
        activity: 'CYCLING',
        date: iso(nextDateFor(5, '07:00', now)),
        place: 'Sea Point Promenade',
        city: 'Cape Town',
        distance: '60 km · no-drop',
        level: 2,
        spots: 6,
        joined: [7],
        note: 'No-drop pace. We regroup at every climb.',
      },
      {
        id: 'o-lerato-10k',
        hostId: 1,
        title: 'Sea Point sunrise 10k',
        activity: 'RUNNING',
        date: iso(nextDateFor(6, '06:00', now)),
        place: 'Sea Point Promenade',
        city: 'Cape Town',
        distance: '10 km · steady',
        level: 3,
        spots: 1,
        joined: [],
      },
      {
        id: 'o-amahle-hike',
        hostId: 3,
        title: 'Lion’s Head hike-run',
        activity: 'TRAIL',
        date: iso(nextDateFor(6, '06:30', now)),
        place: 'Kloof Nek parking, Lion’s Head',
        city: 'Cape Town',
        distance: '5.5 km · 670 m up',
        level: 1,
        spots: 5,
        joined: [1],
        note: 'Sunrise at the top. Headlamps recommended.',
      },
      {
        id: 'o-zanele-brick',
        hostId: 7,
        title: 'Brick session',
        activity: 'TRIATHLON',
        date: iso(nextDateFor(6, '07:00', now)),
        place: 'Rondebosch Common',
        city: 'Cape Town',
        distance: '30 km ride + 5 km run',
        level: 3,
        spots: 2,
        joined: [],
      },
      {
        id: 'o-dean-boulder',
        hostId: 6,
        title: 'Evening bouldering',
        activity: 'CLIMBING',
        date: iso(nextDateFor(2, '18:30', now)),
        place: 'City Rock, Observatory',
        city: 'Cape Town',
        distance: '2 hours',
        level: 2,
        spots: 3,
        joined: [],
      },
    ],
    drop: { week: dropKey(now), actions: {} },
    celebrate: null,
  };
}

const STORAGE_KEY = 'pace.plans.v1';

let state: PlansState = seed();
const listeners = new Set<() => void>();

function setState(patch: Partial<PlansState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
}

AsyncStorage.getItem(STORAGE_KEY)
  .then((raw) => {
    if (!raw) return;
    const saved = JSON.parse(raw) as PlansState;
    state = { ...saved, celebrate: null };
    listeners.forEach((l) => l());
  })
  .catch(() => {});

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function usePlans(): PlansState {
  return useSyncExternalStore(subscribe, () => state);
}

export function getPlansState(): PlansState {
  return state;
}

// For tests.
export function resetPlans(now?: Date) {
  state = seed(now);
  listeners.forEach((l) => l());
}

function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function updatePlan(id: string, patch: Partial<Plan>) {
  setState({ plans: state.plans.map((p) => (p.id === id ? { ...p, ...patch } : p)) });
}

// A confirmed session whose start is 2h+ in the past counts as done.
export function effectiveStatus(p: Plan, now: Date = new Date()): PlanStatus {
  if (p.status === 'confirmed' && new Date(p.date).getTime() < now.getTime() - 2 * 3600000)
    return 'done';
  return p.status;
}

// Only between matches: returns null (and does nothing) if you haven't
// both liked each other.
export function sendInvite(
  input: Omit<Plan, 'id' | 'status'>,
  opts: { replyDelayMs?: number } = {}
): Plan | null {
  if (!isMatched(input.athleteId)) return null;
  const plan: Plan = { ...input, id: newId('p'), status: 'sent' };
  setState({ plans: [plan, ...state.plans] });
  if (RESPONDERS.includes(input.athleteId)) {
    setTimeout(() => {
      const current = state.plans.find((p) => p.id === plan.id);
      if (current?.status !== 'sent') return;
      updatePlan(plan.id, { status: 'confirmed' });
      setState({ celebrate: plan.id });
    }, opts.replyDelayMs ?? 2200);
  }
  return plan;
}

export function respondToInvite(id: string, accept: boolean) {
  const plan = state.plans.find((p) => p.id === id);
  if (!plan) return;
  updatePlan(id, { status: accept ? 'confirmed' : 'declined' });
}

// Accept or decline an invite card from a chat thread. The card's plan
// is confirmed/declined here so it shows on Today like any other invite.
// Cards saved before they were linked to plans (or whose plan is gone)
// get a plan created from the card on first response. Returns the plan id
// so the caller can link the card to it.
export function respondToChatPlan(athleteId: number, card: PlanCard, accept: boolean): string {
  let plan = card.planId ? state.plans.find((p) => p.id === card.planId) : undefined;
  if (!plan) {
    plan = {
      id: card.planId ?? newId('p'),
      athleteId,
      activity: card.activity,
      date: dateFromWhenLabel(card.when).toISOString(),
      place: card.location,
      status: 'received',
    };
    setState({ plans: [plan, ...state.plans] });
  }
  respondToInvite(plan.id, accept);
  return plan.id;
}

// What a chat card should show, read from its linked plan when there is
// one so the card and Today never disagree.
export function chatCardStatus(s: PlansState, card: PlanCard): CardStatus {
  const plan = card.planId ? s.plans.find((p) => p.id === card.planId) : undefined;
  if (!plan) return card.status;
  if (plan.status === 'confirmed' || plan.status === 'done') return 'CONFIRMED';
  if (plan.status === 'declined') return 'DECLINED';
  return 'INVITE';
}

export const CHECK_IN_AFTER_MIN = 90;

export interface CheckInDue {
  key: string; // stable per plan/session
  at: Date;
  title: string;
  body: string;
}

// Sessions with the check-in timer on that are still ahead: invites that
// are sent or confirmed, and group sessions you joined. The reminder
// schedule is kept in line with this list.
export function checkInsDue(
  s: Pick<PlansState, 'plans' | 'open'>,
  nameOf: (id: Attendee) => string,
  now: Date = new Date()
): CheckInDue[] {
  const after = (iso: string) => new Date(new Date(iso).getTime() + CHECK_IN_AFTER_MIN * 60000);
  const one = s.plans
    .filter((p) => p.checkInTimer && (p.status === 'sent' || p.status === 'confirmed'))
    .map((p) => ({
      key: `plan-${p.id}`,
      at: after(p.date),
      title: 'All good?',
      body: `How was your session with ${nameOf(p.athleteId)}? Tap if you need help.`,
    }));
  const group = s.open
    .filter((o) => o.myCheckIn && o.joined.includes('me'))
    .map((o) => ({
      key: `open-${o.id}`,
      at: after(o.date),
      title: 'All good?',
      body: `How was ${o.title}? Tap if you need help.`,
    }));
  return [...one, ...group].filter((c) => c.at.getTime() > now.getTime());
}

// Unmatch / block: drop every 1:1 plan with that person.
export function removePlansWith(athleteId: number) {
  setState({ plans: state.plans.filter((p) => p.athleteId !== athleteId) });
}

export function cancelPlan(id: string) {
  setState({ plans: state.plans.filter((p) => p.id !== id) });
}

export function checkIn(id: string, choice: CheckIn) {
  const plan = state.plans.find((p) => p.id === id);
  if (!plan) return;
  updatePlan(id, {
    status: 'done',
    myCheckIn: choice,
    theirCheckIn: plan.theirCheckIn ?? THEIR_CHECKIN[plan.athleteId] ?? 'again',
  });
}

export function clearCelebrate() {
  if (state.celebrate) setState({ celebrate: null });
}

export function joinOpen(id: string, opts: { checkInTimer?: boolean } = {}) {
  setState({
    open: state.open.map((o) =>
      o.id === id && !o.joined.includes('me')
        ? { ...o, joined: [...o.joined, 'me'], myCheckIn: !!opts.checkInTimer }
        : o
    ),
  });
}

export function leaveOpen(id: string) {
  setState({
    open: state.open.map((o) =>
      o.id === id ? { ...o, joined: o.joined.filter((j) => j !== 'me'), myCheckIn: false } : o
    ),
  });
}

export function hostOpen(input: Omit<OpenSession, 'id' | 'hostId' | 'joined'>): OpenSession {
  const s: OpenSession = { ...input, id: newId('o'), hostId: 'me', joined: [] };
  setState({ open: [s, ...state.open] });
  return s;
}

// ── Relationship progress ────────────────────────────────────────────

const RANK: Record<CheckIn, number> = { buddies: 0, again: 1, coffee: 2 };

// Check-ins are private: you only learn the outcome you both chose (the
// lower of the two), so nobody sees a one-sided "coffee?".
export function checkInOutcome(p: Plan): CheckIn | 'waiting' | null {
  if (!p.myCheckIn) return null;
  if (!p.theirCheckIn) return 'waiting';
  return RANK[p.myCheckIn] <= RANK[p.theirCheckIn] ? p.myCheckIn : p.theirCheckIn;
}

export function sessionsTogether(s: PlansState, athleteId: number, now: Date = new Date()): number {
  return s.plans.filter((p) => p.athleteId === athleteId && effectiveStatus(p, now) === 'done')
    .length;
}

export type Stage = 'match' | 'train' | 'coffee' | 'date';
export const STAGES: { id: Stage; label: string; illo: IlloName }[] = [
  { id: 'match', label: 'Match', illo: 'buddies' },
  { id: 'train', label: 'Train', illo: 'run' },
  { id: 'coffee', label: 'Coffee', illo: 'coffee' },
  { id: 'date', label: 'Date', illo: 'heart' },
];

// How far along you are with someone. "Date" is never automatic — it's
// the next step you choose once coffee is mutual.
export function stageWith(
  s: PlansState,
  athleteId: number,
  matched: boolean,
  now: Date = new Date()
): Stage | null {
  const plans = s.plans.filter((p) => p.athleteId === athleteId);
  if (plans.some((p) => checkInOutcome(p) === 'coffee')) return 'coffee';
  if (plans.some((p) => effectiveStatus(p, now) === 'done')) return 'train';
  if (matched || plans.some((p) => p.status === 'confirmed')) return 'match';
  return null;
}
