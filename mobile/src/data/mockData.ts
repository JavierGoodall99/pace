// Mock data ported 1:1 from the DC script in `../Pace App.dc.html`.

export type Discipline =
  | 'RUNNING'
  | 'CYCLING'
  | 'TRAIL'
  | 'SWIMMING'
  | 'CROSSFIT'
  | 'CLIMBING'
  | 'TRIATHLON';

export const DISCIPLINES: Discipline[] = [
  'RUNNING',
  'CYCLING',
  'TRAIL',
  'SWIMMING',
  'CROSSFIT',
  'CLIMBING',
  'TRIATHLON',
];

export interface Athlete {
  id: number;
  slotId: string;
  name: string;
  age: number;
  discipline: Discipline;
  pace: string;
  city: string;
  bio: string;
  weekly: number;
}

export const ATHLETES: Athlete[] = [
  { id: 1, slotId: 'athlete-1', name: 'Lerato', age: 27, discipline: 'RUNNING', pace: '4:45/KM', city: 'Cape Town', bio: 'Sunrise road runner training for Two Oceans. Early starts, no excuses.', weekly: 5 },
  { id: 2, slotId: 'athlete-2', name: 'Sipho', age: 31, discipline: 'CYCLING', pace: '32 KM/H AVG', city: 'Johannesburg', bio: 'Weekend gravel grinder, weekday commuter. Always down for a coffee-stop ride.', weekly: 4 },
  { id: 3, slotId: 'athlete-3', name: 'Amahle', age: 26, discipline: 'TRAIL', pace: '6:10/KM', city: 'Cape Town', bio: 'Table Mountain most Saturdays. Slow and steady, big views over big pace.', weekly: 3 },
  { id: 4, slotId: 'athlete-4', name: 'Jacques', age: 34, discipline: 'SWIMMING', pace: '1:35/100M', city: 'Durban', bio: 'Open water through summer, pool laps the rest of the year.', weekly: 5 },
  { id: 5, slotId: 'athlete-5', name: 'Naledi', age: 29, discipline: 'CROSSFIT', pace: '5X / WEEK', city: 'Pretoria', bio: 'Competing at regionals next year. Coffee after WODs, always.', weekly: 5 },
  { id: 6, slotId: 'athlete-6', name: 'Dean', age: 30, discipline: 'CLIMBING', pace: 'V6 PROJECT', city: 'Cape Town', bio: 'Bouldering most nights, sport climbing on weekends.', weekly: 4 },
  { id: 7, slotId: 'athlete-7', name: 'Zanele', age: 28, discipline: 'TRIATHLON', pace: 'OLYMPIC DIST.', city: 'Johannesburg', bio: 'Swim-bike-run, in that order, always. Racing three events this season.', weekly: 3 },
  { id: 8, slotId: 'athlete-8', name: 'Kagiso', age: 32, discipline: 'RUNNING', pace: '3:55/KM', city: 'Pretoria', bio: 'Track sessions Tuesdays, long run Sundays. Chasing a sub-3 marathon.', weekly: 6 },
];

// Companion activities that round out a one-line profile to the
// multi-activity card the design calls for (3 tiles, as in the mock).
export const SECONDARY_TAGS: Record<Discipline, [Discipline, Discipline]> = {
  RUNNING: ['TRAIL', 'CYCLING'],
  CYCLING: ['RUNNING', 'TRAIL'],
  TRAIL: ['RUNNING', 'CLIMBING'],
  SWIMMING: ['TRIATHLON', 'RUNNING'],
  CROSSFIT: ['CLIMBING', 'RUNNING'],
  CLIMBING: ['TRAIL', 'CROSSFIT'],
  TRIATHLON: ['SWIMMING', 'CYCLING'],
};

export function tagsForDiscipline(d: Discipline): Discipline[] {
  return [d, ...SECONDARY_TAGS[d]];
}

export function athleteById(id: number): Athlete | undefined {
  return ATHLETES.find((a) => a.id === id);
}

export interface ChatThread {
  id: number;
  athleteId: number;
  lastMsg: string;
  time: string;
  unread: boolean;
}

export const CHAT_THREADS: ChatThread[] = [
  { id: 1, athleteId: 1, lastMsg: 'See you at 6am at the promenade?', time: '2M', unread: true },
  { id: 2, athleteId: 3, lastMsg: 'That trail was brutal, great pace though.', time: '1H', unread: false },
  { id: 3, athleteId: 5, lastMsg: 'Down for a WOD Thursday?', time: '3H', unread: false },
  { id: 4, athleteId: 7, lastMsg: 'Nice PB on the swim leg!', time: '1D', unread: false },
];

// An activity plan attached to a message, composed inline in a chat
// thread and mirrored into the Planner's sessions as a PENDING invite.
export interface PlanCard {
  activity: Discipline;
  when: string;
  location: string;
}

export interface ThreadMessage {
  from: 'them' | 'me';
  text: string;
  plan?: PlanCard;
}

export const THREAD_MESSAGES: Record<number, ThreadMessage[]> = {
  1: [
    { from: 'them', text: 'Loved your split on the 10K yesterday.' },
    { from: 'me', text: 'Thanks! Felt strong the last 2K.' },
    { from: 'them', text: 'See you at 6am at the promenade?' },
    { from: 'me', text: "I'll be there. Bringing coffee after." },
  ],
  3: [
    { from: 'them', text: 'That trail was brutal, great pace though.' },
    { from: 'me', text: 'Barely made it up the last climb.' },
  ],
  5: [
    { from: 'them', text: 'Down for a WOD Thursday?' },
    { from: 'me', text: 'Always. 6pm at the box?' },
  ],
  7: [
    { from: 'them', text: 'Nice PB on the swim leg!' },
    { from: 'me', text: 'Two years of Tuesday laps finally paying off.' },
  ],
};

export interface FeedItem {
  id: number;
  athleteId: number | 'me';
  who: string;
  time: string;
  type: string;
  icon: 'activity' | 'zap' | 'map' | 'repeat';
  stat: string;
  kudos: number;
  hasPhoto: boolean;
}

export const FEED_ITEMS: FeedItem[] = [
  { id: 1, athleteId: 1, who: 'Lerato', time: '2H AGO', type: 'RUN', icon: 'activity', stat: '12.4km · 4:38/km · 54:02', kudos: 14, hasPhoto: false },
  { id: 2, athleteId: 5, who: 'You', time: '5H AGO', type: 'CROSSFIT', icon: 'zap', stat: '5 rounds · 38 reps · new PB on cleans', kudos: 22, hasPhoto: true },
  { id: 3, athleteId: 6, who: 'Dean', time: '8H AGO', type: 'CLIMB', icon: 'map', stat: 'V5 flash, 3 attempts', kudos: 9, hasPhoto: false },
  { id: 4, athleteId: 7, who: 'Zanele', time: '1D AGO', type: 'TRI BRICK', icon: 'repeat', stat: '1.5km swim + 40km ride + 10km run', kudos: 31, hasPhoto: true },
  { id: 5, athleteId: 8, who: 'Kagiso', time: '2D AGO', type: 'RUN', icon: 'activity', stat: '21.1km · 3:58/km', kudos: 47, hasPhoto: false },
];

export interface Session {
  id: number;
  athleteId: number;
  activity: string;
  when: string;
  location: string;
  status: 'CONFIRMED' | 'PENDING';
}

export const SESSIONS: Session[] = [
  { id: 1, athleteId: 1, activity: 'RUN', when: 'Sat · 06:00', location: 'Sea Point Promenade', status: 'CONFIRMED' },
  { id: 2, athleteId: 5, activity: 'CROSSFIT', when: 'Thu · 18:00', location: 'CrossFit Box, Pretoria East', status: 'PENDING' },
];

// Sessions added from a chat-thread plan hit the Planner's upcoming list
// as unconfirmed invites, so a plan lives in one place once it's sent.
export function addSession(
  athleteId: number,
  activity: Discipline,
  when: string,
  location: string,
) {
  const id = SESSIONS.reduce((max, s) => Math.max(max, s.id), 0) + 1;
  SESSIONS.push({ id, athleteId, activity, when, location, status: 'PENDING' });
}

export const PLANNER_PARTNER_IDS = [1, 3, 5, 7];

// Athletes who'll mutually match on a Discover "like" — same ids as
// PLANNER_PARTNER_IDS (both mirror MATCH_IDS in the design's DC script,
// which reuses one list for both).
export const MATCH_IDS = PLANNER_PARTNER_IDS;

export type NotificationKind = 'kudos' | 'message' | 'match' | 'invite' | 'comment';

export interface AppNotification {
  id: number;
  athleteId: number;
  kind: NotificationKind;
  text: string;
  time: string;
  group: 'TODAY' | 'EARLIER';
  unread: boolean;
}

export const NOTIFICATIONS: AppNotification[] = [
  { id: 1, athleteId: 5, kind: 'kudos', text: 'liked your run', time: '2M', group: 'TODAY', unread: true },
  { id: 2, athleteId: 1, kind: 'message', text: 'sent you a message', time: '14M', group: 'TODAY', unread: true },
  { id: 3, athleteId: 7, kind: 'match', text: 'matched with you', time: '41M', group: 'TODAY', unread: true },
  { id: 4, athleteId: 8, kind: 'invite', text: 'invited you to a run · Sat 06:00', time: '1H', group: 'TODAY', unread: false },
  { id: 5, athleteId: 3, kind: 'comment', text: 'commented on your climb', time: '3H', group: 'TODAY', unread: false },
  { id: 6, athleteId: 2, kind: 'kudos', text: 'liked your ride', time: '1D', group: 'EARLIER', unread: false },
  { id: 7, athleteId: 6, kind: 'message', text: 'sent you a message', time: '2D', group: 'EARLIER', unread: false },
];
