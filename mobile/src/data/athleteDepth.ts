import type { Athlete } from './mockData';
import type { IlloName } from '../components/Illustrations';
import type { Gender, Lifestyle } from './identity';
import type { Intent } from './session';

// The "proof of effort" side of each athlete — effort level, when they
// like to train, what they're training for, personal bests, prompts and
// favourite routes. Kept beside `mockData.ts` (keyed by athlete id) so
// the core Athlete shape stays small; a real backend would return this
// with the profile.

// Effort level — how hard someone goes, comparable across sports. Pace
// matches within a level or one apart so sessions actually work.
export type Level = 1 | 2 | 3 | 4;

export const LEVELS: { id: Level; illo: IlloName; label: string; detail: string }[] = [
  { id: 1, illo: 'level1', label: 'Easy going', detail: 'Chatty pace, no watch-checking' },
  { id: 2, illo: 'level2', label: 'Steady', detail: 'Consistent, comfortably hard' },
  { id: 3, illo: 'level3', label: 'Strong', detail: 'Intervals, tempo, pushing limits' },
  { id: 4, illo: 'level4', label: 'Racing', detail: 'Chasing podiums and PBs' },
];

export function levelLabel(level: Level | null | undefined): string {
  return LEVELS.find((l) => l.id === level)?.label ?? 'Not set';
}

export interface Prompt {
  q: string;
  a: string;
}

export interface Route {
  name: string;
  detail: string;
}

export interface AthleteDepth {
  level: Level;
  times: string[]; // 'EARLY MORNING' | 'MIDDAY' | 'EVENING' | 'WEEKENDS'
  goalRaceId: string | null;
  pbs: { label: string; value: string }[];
  prompts: Prompt[];
  routes: Route[];
  // Approximate km from the city centre — combined with the city to
  // estimate distance to you.
  nearKm: number;
  // Dating basics.
  gender: Gender;
  lifestyle: Lifestyle;
  // Days since they last updated their photos.
  photosDaysAgo: number;
  // Women-first messaging: after a match, only she can start the chat.
  womenFirst: boolean;
  // Main photo is a motion clip (plays as a slow loop on the card).
  motion: boolean;
  // Proof they're actually active: days since their last synced activity
  // or Pace session, and where it came from.
  lastTrainedDays: number;
  activitySource: 'strava' | 'garmin' | 'sessions';
  // The ages they want to see — mutual with yours.
  ageRange: [number, number];
  replies: 'fast' | 'usually';
  // What they're on Pace for — same options as yours.
  intent: Intent;
}

export const DEPTH: Record<number, AthleteDepth> = {
  1: {
    level: 3,
    times: ['EARLY MORNING', 'WEEKENDS'],
    goalRaceId: 'two-oceans',
    pbs: [
      { label: '10 km', value: '44:12' },
      { label: 'Half marathon', value: '1:38:40' },
    ],
    prompts: [
      { q: 'My post-long-run meal is…', a: 'Shakshuka and a flat white at the promenade.' },
      { q: 'The workout I’d never skip', a: 'Thursday tempo. Non-negotiable.' },
    ],
    routes: [
      { name: 'Sea Point Promenade', detail: '10 km out-and-back · flat' },
      { name: 'Signal Hill loop', detail: '8 km · 250 m climb' },
    ],
    nearKm: 3,
    gender: 'woman',
    lifestyle: { drinks: 'social', diet: 'anything', restDay: 'brunch' },
    photosDaysAgo: 9,
    womenFirst: false,
    motion: true,
    lastTrainedDays: 0,
    activitySource: 'strava',
    ageRange: [25, 36],
    replies: 'fast',
    intent: 'both',
  },
  2: {
    level: 2,
    times: ['EARLY MORNING', 'WEEKENDS'],
    goalRaceId: 'cape-town-cycle-tour',
    pbs: [
      { label: '100 km', value: '3:05:00' },
      { label: 'Longest ride', value: '160 km' },
    ],
    prompts: [
      { q: 'Best coffee stop', a: 'Anywhere with a bike rack and banana bread.' },
      { q: 'Green flag', a: 'Waits at the top of the climb.' },
    ],
    routes: [{ name: 'Cradle of Humankind loop', detail: '85 km · rolling hills' }],
    nearKm: 6,
    gender: 'man',
    lifestyle: { drinks: 'social', diet: 'highprotein', restDay: 'brunch' },
    photosDaysAgo: 22,
    womenFirst: false,
    motion: false,
    lastTrainedDays: 1,
    activitySource: 'strava',
    ageRange: [23, 34],
    replies: 'usually',
    intent: 'love',
  },
  3: {
    level: 1,
    times: ['WEEKENDS', 'EARLY MORNING'],
    goalRaceId: 'utct',
    pbs: [{ label: 'Platteklip Gorge', value: '48 min' }],
    prompts: [
      { q: 'I’m happiest when…', a: 'The mist burns off at the top of Lion’s Head.' },
      { q: 'Slow down for…', a: 'Every single view. Photos are mandatory.' },
    ],
    routes: [
      { name: 'Lion’s Head sunrise', detail: '5.5 km · 670 m climb' },
      { name: 'Pipe Track', detail: '12 km · gentle trail' },
    ],
    nearKm: 5,
    gender: 'woman',
    lifestyle: { drinks: 'never', diet: 'vegetarian', restDay: 'adventure' },
    photosDaysAgo: 4,
    womenFirst: true,
    motion: true,
    lastTrainedDays: 0,
    activitySource: 'garmin',
    ageRange: [24, 34],
    replies: 'fast',
    intent: 'partner',
  },
  4: {
    level: 3,
    times: ['EARLY MORNING', 'EVENING'],
    goalRaceId: 'midmar-mile',
    pbs: [
      { label: '1.5 km open water', value: '24:30' },
      { label: '100 m freestyle', value: '1:09' },
    ],
    prompts: [{ q: 'Unpopular opinion', a: 'Cold water is a personality trait.' }],
    routes: [{ name: 'North Beach to uShaka', detail: '2 km sea swim' }],
    nearKm: 4,
    gender: 'man',
    lifestyle: { drinks: 'offseason', diet: 'highprotein', restDay: 'couch' },
    photosDaysAgo: 48,
    womenFirst: false,
    motion: false,
    lastTrainedDays: 3,
    activitySource: 'garmin',
    ageRange: [26, 38],
    replies: 'usually',
    intent: 'both',
  },
  5: {
    level: 3,
    times: ['EARLY MORNING', 'EVENING'],
    goalRaceId: null,
    pbs: [
      { label: 'Back squat', value: '110 kg' },
      { label: 'Fran', value: '4:52' },
    ],
    prompts: [{ q: 'Coffee after…', a: 'Every WOD. Every single one.' }],
    routes: [{ name: 'CrossFit box, Woodstock', detail: '6am class' }],
    nearKm: 7,
    gender: 'woman',
    lifestyle: { drinks: 'social', diet: 'highprotein', restDay: 'brunch' },
    photosDaysAgo: 15,
    womenFirst: false,
    motion: false,
    lastTrainedDays: 1,
    activitySource: 'sessions',
    ageRange: [26, 38],
    replies: 'fast',
    intent: 'love',
  },
  6: {
    level: 2,
    times: ['EVENING', 'WEEKENDS'],
    goalRaceId: null,
    pbs: [{ label: 'Boulder', value: 'V6' }],
    prompts: [{ q: 'Current project', a: 'A crimpy V6 at City Rock that hates me.' }],
    routes: [{ name: 'City Rock', detail: 'Bouldering gym · Observatory' }],
    nearKm: 4,
    gender: 'man',
    lifestyle: { drinks: 'social', diet: 'anything', restDay: 'adventure' },
    photosDaysAgo: 6,
    womenFirst: false,
    motion: true,
    lastTrainedDays: 23,
    activitySource: 'strava',
    ageRange: [22, 34],
    replies: 'usually',
    intent: 'partner',
  },
  7: {
    level: 3,
    times: ['EARLY MORNING', 'WEEKENDS'],
    goalRaceId: 'im-703-east-london',
    pbs: [{ label: 'Olympic tri', value: '2:31:08' }],
    prompts: [{ q: 'Transition hack', a: 'Elastic laces. Changed my life.' }],
    routes: [{ name: 'Rondebosch Common', detail: 'Brick sessions · run loops' }],
    nearKm: 8,
    gender: 'woman',
    lifestyle: { drinks: 'offseason', diet: 'vegan', restDay: 'adventure' },
    photosDaysAgo: 11,
    womenFirst: true,
    motion: true,
    lastTrainedDays: 0,
    activitySource: 'strava',
    ageRange: [26, 37],
    replies: 'fast',
    intent: 'both',
  },
  8: {
    level: 4,
    times: ['EVENING', 'WEEKENDS'],
    goalRaceId: 'two-oceans-half',
    pbs: [
      { label: 'Marathon', value: '3:04:55' },
      { label: '5 km', value: '17:40' },
    ],
    prompts: [{ q: 'Chasing', a: 'Sub-3. This is the year.' }],
    routes: [{ name: 'Green Point Athletics Stadium', detail: 'Tuesday intervals' }],
    nearKm: 5,
    gender: 'man',
    lifestyle: { drinks: 'never', diet: 'highprotein', restDay: 'couch' },
    photosDaysAgo: 3,
    womenFirst: false,
    motion: true,
    lastTrainedDays: 2,
    activitySource: 'strava',
    ageRange: [24, 35],
    replies: 'fast',
    intent: 'love',
  },
};

export function depthFor(a: Pick<Athlete, 'id'>): AthleteDepth {
  return (
    DEPTH[a.id] ?? {
      level: 2,
      times: [],
      goalRaceId: null,
      pbs: [],
      prompts: [],
      routes: [],
      nearKm: 10,
      gender: 'woman',
      lifestyle: { drinks: null, diet: null, restDay: null },
      photosDaysAgo: 30,
      womenFirst: false,
      motion: false,
      lastTrainedDays: 30,
      activitySource: 'sessions',
      ageRange: [18, 60],
      replies: 'usually',
      intent: 'both',
    }
  );
}
