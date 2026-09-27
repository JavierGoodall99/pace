import type { AthleteDepth, Level } from './athleteDepth';
import type { Gender, Lifestyle } from './identity';
import type { Athlete, Discipline } from './mockData';
import type { Intent } from './session';

// The wider demo cast, so every tester gets a full Pacers deck whoever
// they are: 20 women and 20 men aged 19–60, each open to people about
// ten years either side, with a mix of love / partner / both. The core
// ten in mockData.ts carry the hand-written stories (chats, plans,
// moments); these fill the deck. `demoCast.test.ts` checks that every
// tester gender × intent × age 18–60 gets at least a day's picks.
//
// Demo only: ATHLETES is empty when DEMO_DATA is off. Photos reuse the
// ten stock portraits (see photos.ts).

type Row = [name: string, age: number, intent: Intent];

const WOMEN: Row[] = [
  ['Kayla', 19, 'both'],
  ['Palesa', 20, 'love'],
  ['Megan', 22, 'partner'],
  ['Nomvula', 23, 'both'],
  ['Ayesha', 25, 'love'],
  ['Refilwe', 27, 'partner'],
  ['Tamsin', 33, 'both'],
  ['Busisiwe', 36, 'love'],
  ['Marike', 38, 'partner'],
  ['Nandi', 40, 'both'],
  ['Leigh', 42, 'love'],
  ['Fatima', 44, 'partner'],
  ['Elize', 46, 'both'],
  ['Nicole', 48, 'love'],
  ['Thembeka', 50, 'partner'],
  ['Janine', 52, 'both'],
  ['Precious', 54, 'love'],
  ['Carla', 56, 'partner'],
  ['Lindiwe', 58, 'both'],
  ['Rochelle', 60, 'love'],
];

const MEN: Row[] = [
  ['Themba', 19, 'both'],
  ['Liam', 20, 'love'],
  ['Tshepo', 22, 'partner'],
  ['Ruan', 23, 'both'],
  ['Mandla', 25, 'love'],
  ['Ethan', 27, 'partner'],
  ['Bongani', 33, 'both'],
  ['Pieter', 36, 'love'],
  ['Yusuf', 38, 'partner'],
  ['Luthando', 40, 'both'],
  ['Craig', 42, 'love'],
  ['Andile', 44, 'partner'],
  ['Wian', 46, 'both'],
  ['Mpho', 48, 'love'],
  ['Gareth', 50, 'partner'],
  ['Sibusiso', 52, 'both'],
  ['Hendrik', 54, 'love'],
  ['Lwazi', 56, 'partner'],
  ['Keith', 58, 'both'],
  ['Desmond', 60, 'love'],
];

// What each sport's profile says. Two variants each, so neighbours in
// the deck don't read the same.
const SPORT: Record<
  Discipline,
  {
    pace: string[];
    bio: string[];
    pb: AthleteDepth['pbs'][number][];
    route: AthleteDepth['routes'][number];
    prompt: AthleteDepth['prompts'][number][];
    race: string | null;
  }
> = {
  RUNNING: {
    pace: ['5:05/KM', '5:40/KM'],
    bio: [
      'Parkrun most Saturdays, promenade miles midweek. Happy to chat at easy pace.',
      'Building back up to a half. Early starts, flat whites after.',
    ],
    pb: [
      { label: '10 km', value: '49:30' },
      { label: 'Half marathon', value: '1:52:10' },
    ],
    route: { name: 'Sea Point Promenade', detail: '10 km out-and-back · flat' },
    prompt: [
      { q: 'My post-long-run meal is…', a: 'Anything with eggs, then a nap.' },
      { q: 'Green flag', a: 'Runs back to fetch the slowest one.' },
    ],
    race: 'two-oceans-half',
  },
  CYCLING: {
    pace: ['28 KM/H AVG', '25 KM/H AVG'],
    bio: [
      'Chapman’s Peak on a still morning is my happy place.',
      'Coffee-ride cyclist with the occasional big day out.',
    ],
    pb: [
      { label: 'Cape Town Cycle Tour', value: '3:28:00' },
      { label: 'Longest ride', value: '140 km' },
    ],
    route: { name: 'Chapman’s Peak', detail: '45 km loop · coastal climbs' },
    prompt: [
      { q: 'Best coffee stop', a: 'Anywhere with a bike rack and a view.' },
      { q: 'Unpopular opinion', a: 'Headwinds build character.' },
    ],
    race: 'cape-town-cycle-tour',
  },
  TRAIL: {
    pace: ['6:30/KM', '7:10/KM'],
    bio: [
      'Mountain first, road never. Lion’s Head at sunrise whenever I can.',
      'Hiker turned trail runner. Slow on the ups, fearless on the downs.',
    ],
    pb: [{ label: 'Platteklip Gorge', value: '55 min' }],
    route: { name: 'Lion’s Head sunrise', detail: '5.5 km · 670 m climb' },
    prompt: [
      { q: 'I’m happiest when…', a: 'The mist burns off and the city shows up.' },
      { q: 'Slow down for…', a: 'Proteas, dassies and every view.' },
    ],
    race: 'utct',
  },
  SWIMMING: {
    pace: ['1:50/100M', '2:05/100M'],
    bio: [
      'Pool laps midweek, sea swims when the water’s kind.',
      'Converted runner, now a cold-water believer.',
    ],
    pb: [{ label: '1 km open water', value: '19:40' }],
    route: { name: 'Clifton to Camps Bay', detail: 'Open water · 2 km' },
    prompt: [
      { q: 'Unpopular opinion', a: 'Atlantic side over False Bay. Fight me.' },
      { q: 'After a swim you’ll find me…', a: 'Wrapped in a towel with a hot chocolate.' },
    ],
    race: 'midmar-mile',
  },
  CROSSFIT: {
    pace: ['4X / WEEK', '5X / WEEK'],
    bio: [
      '6am class regular. Loud music, heavy bars, good people.',
      'In it for the community, staying for the deadlifts.',
    ],
    pb: [
      { label: 'Deadlift', value: '120 kg' },
      { label: 'Fran', value: '6:10' },
    ],
    route: { name: 'CrossFit box, Woodstock', detail: '6am class' },
    prompt: [
      { q: 'Coffee after…', a: 'Every WOD. Non-negotiable.' },
      { q: 'The workout I’d never skip', a: 'Friday partner WOD.' },
    ],
    race: null,
  },
  CLIMBING: {
    pace: ['V4 PROJECT', '6B SPORT'],
    bio: [
      'Bouldering after work, Rocklands when the season allows.',
      'Gym climber getting braver outdoors. Always need a belay partner.',
    ],
    pb: [{ label: 'Boulder', value: 'V4' }],
    route: { name: 'City Rock', detail: 'Bouldering gym · Observatory' },
    prompt: [
      { q: 'Current project', a: 'A slabby problem that humbles me weekly.' },
      { q: 'Green flag', a: 'Offers a spot without being asked.' },
    ],
    race: null,
  },
  TRIATHLON: {
    pace: ['SPRINT DIST.', 'OLYMPIC DIST.'],
    bio: [
      'Three sports, zero free weekends, no regrets.',
      'Newish to tri: strong on the bike, working on the swim.',
    ],
    pb: [{ label: 'Sprint tri', value: '1:24:30' }],
    route: { name: 'Rondebosch Common', detail: 'Brick sessions · run loops' },
    prompt: [
      { q: 'Transition hack', a: 'Talc in the shoes. Trust me.' },
      { q: 'My weakest leg is…', a: 'The swim, so I’m looking for a pool buddy.' },
    ],
    race: 'im-703-east-london',
  },
};

const SPORTS: Discipline[] = [
  'RUNNING',
  'CYCLING',
  'TRAIL',
  'SWIMMING',
  'CROSSFIT',
  'CLIMBING',
  'TRIATHLON',
];
const TIMES = [
  ['EARLY MORNING', 'WEEKENDS'],
  ['EVENING', 'WEEKENDS'],
  ['EARLY MORNING', 'EVENING'],
  ['MIDDAY', 'WEEKENDS'],
];
const LIFESTYLES: Lifestyle[] = [
  { drinks: 'social', diet: 'anything', restDay: 'brunch' },
  { drinks: 'never', diet: 'vegetarian', restDay: 'adventure' },
  { drinks: 'offseason', diet: 'highprotein', restDay: 'couch' },
  { drinks: 'social', diet: 'vegan', restDay: 'adventure' },
];

// The stock portraits, by gender, from the core ten (photos.ts).
const PORTRAITS: Record<Gender, string[]> = {
  woman: ['athlete-1', 'athlete-3', 'athlete-5', 'athlete-7', 'athlete-9', 'athlete-10'],
  man: ['athlete-2', 'athlete-4', 'athlete-6', 'athlete-8'],
};

const FIRST_ID = 11;

interface CastMember {
  athlete: Athlete;
  depth: AthleteDepth;
  // Which stock portrait and action shot this profile borrows.
  photos: { portrait: string; action: string };
}

function build(): CastMember[] {
  // Alternate women and men so ids interleave.
  const rows = WOMEN.flatMap((w, i) => [
    { row: w, gender: 'woman' as const },
    { row: MEN[i], gender: 'man' as const },
  ]);
  return rows.map(({ row: [name, age, intent], gender }, i) => {
    const id = FIRST_ID + i;
    const discipline = SPORTS[i % SPORTS.length];
    const sport = SPORT[discipline];
    const v = Math.floor(i / SPORTS.length) % 2; // which variant
    const level = ((i % 4) + 1) as Level;
    const portraits = PORTRAITS[gender];
    const p = Math.floor(i / 2) % portraits.length;
    return {
      athlete: {
        id,
        slotId: `athlete-${id}`,
        name,
        age,
        discipline,
        pace: sport.pace[v],
        city: 'Cape Town',
        bio: sport.bio[v],
        weekly: 3 + (i % 4),
        verified: i % 5 !== 4,
      },
      depth: {
        level,
        times: TIMES[i % TIMES.length],
        goalRaceId: v === 0 ? sport.race : null,
        pbs: sport.pb,
        prompts: [sport.prompt[v]],
        routes: [sport.route],
        nearKm: 2 + (i % 12),
        gender,
        lifestyle: LIFESTYLES[i % LIFESTYLES.length],
        photosDaysAgo: 2 + ((i * 7) % 40),
        womenFirst: gender === 'woman' && i % 6 === 0,
        motion: false,
        lastTrainedDays: i % 7 === 6 ? 16 : i % 5,
        activitySource: (['strava', 'garmin', 'sessions'] as const)[i % 3],
        ageRange: [Math.max(18, age - 10), age + 10],
        replies: i % 3 === 0 ? 'usually' : 'fast',
        intent,
      },
      // Pair each portrait with a different action shot than its owner's.
      photos: { portrait: portraits[p], action: portraits[(p + 1) % portraits.length] },
    };
  });
}

export const DEMO_CAST: CastMember[] = build();
