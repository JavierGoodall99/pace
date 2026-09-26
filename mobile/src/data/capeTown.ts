import type { Discipline } from './mockData';

// Cape Town launch content: established communities, events and public
// spots so there's always something to do on Pace — even on a day with
// no new pacers. Pace doesn't run its own clubs or events at launch; it
// points people to the ones Cape Town already loves.
//
// Community and event details come from the clubs' public pages and
// press (Instagram, club sites, Runner's World SA, parkrun). They change —
// every listing must be confirmed with the club before launch, and clubs
// can claim or remove their page. `listed` marks entries not yet
// confirmed by the club.

// ── Spots ────────────────────────────────────────────────────────────

export type SpotKind = 'run' | 'trail' | 'ride' | 'swim' | 'surf' | 'gym';

export interface CtSpot {
  id: string;
  // Matches place names used in sessions and invites.
  name: string;
  // Shorter display name, when the place name is long.
  label?: string;
  area: string;
  kind: SpotKind;
  sports: Discipline[];
  blurb: string;
  bestTime: string;
  safety: string;
  // Busy, public and easy to find — good for a first meet.
  firstMeet: boolean;
}

export const CT_SPOTS: CtSpot[] = [
  {
    id: 'sea-point-promenade',
    name: 'Sea Point Promenade',
    area: 'Sea Point',
    kind: 'run',
    sports: ['RUNNING', 'CYCLING'],
    blurb: 'Flat, sea-front and busy from sunrise to sunset. Cape Town’s default run.',
    bestTime: 'Sunrise or golden hour',
    safety: 'Busy and well lit. Watch for cyclists and dogs on the path.',
    firstMeet: true,
  },
  {
    id: 'green-point-park',
    name: 'Green Point Urban Park',
    area: 'Green Point',
    kind: 'run',
    sports: ['RUNNING'],
    blurb: 'Loops through the park next to the stadium, home of Green Point parkrun.',
    bestTime: 'Saturday 08:00 for parkrun',
    safety: 'Open, busy park with security. Park Café for coffee after.',
    firstMeet: true,
  },
  {
    id: 'green-point-track',
    name: 'Green Point Athletics Stadium',
    area: 'Green Point',
    kind: 'run',
    sports: ['RUNNING', 'TRIATHLON'],
    blurb: 'The track for interval nights and speed work.',
    bestTime: 'Weekday evenings',
    safety: 'Enclosed venue — check access hours before you go.',
    firstMeet: true,
  },
  {
    id: 'lions-head',
    name: 'Kloof Nek parking, Lion’s Head',
    label: 'Lion’s Head',
    area: 'Start at Kloof Nek parking',
    kind: 'trail',
    sports: ['TRAIL', 'RUNNING'],
    blurb: 'The classic sunrise and full-moon hike. Chains and ladders near the top.',
    bestTime: 'Sunrise, or full moon in a group',
    safety: 'Very busy at sunrise and sunset. Go in a group after dark; take a headlamp.',
    firstMeet: true,
  },
  {
    id: 'signal-hill',
    name: 'Signal Hill',
    area: 'Signal Hill',
    kind: 'trail',
    sports: ['RUNNING', 'CYCLING'],
    blurb: 'Road and jeep-track loops with the whole city below you.',
    bestTime: 'Sunset',
    safety: 'Stay on busy sections; don’t leave valuables in cars.',
    firstMeet: false,
  },
  {
    id: 'platteklip',
    name: 'Platteklip Gorge',
    area: 'Table Mountain',
    kind: 'trail',
    sports: ['TRAIL'],
    blurb: 'The steep, direct route up Table Mountain. A proper leg day.',
    bestTime: 'Early morning before the heat',
    safety: 'Check the weather — the table cloth rolls in fast. Carry water and a layer.',
    firstMeet: false,
  },
  {
    id: 'kloof-corner',
    name: 'Kloof Corner',
    area: 'Table Mountain',
    kind: 'trail',
    sports: ['TRAIL'],
    blurb: 'Short, rocky scramble with big views over Camps Bay.',
    bestTime: 'Late afternoon',
    safety: 'Some scrambling. Go with someone who knows the route.',
    firstMeet: false,
  },
  {
    id: 'newlands-forest',
    name: 'Newlands Forest',
    area: 'Newlands',
    kind: 'trail',
    sports: ['TRAIL', 'RUNNING'],
    blurb: 'Shady forest trails and contour paths — Tuesday Trails territory.',
    bestTime: 'Weekday evenings, weekend mornings',
    safety: 'Stick to popular paths and run in groups; avoid quiet sections alone.',
    firstMeet: false,
  },
  {
    id: 'rhodes-memorial',
    name: 'Rhodes Memorial',
    area: 'Rondebosch',
    kind: 'trail',
    sports: ['TRAIL', 'RUNNING'],
    blurb: 'Start of the contour path, with a café for after.',
    bestTime: 'Morning',
    safety: 'Busy near the memorial; quieter further along — go in pairs.',
    firstMeet: true,
  },
  {
    id: 'pipe-track',
    name: 'Pipe Track',
    area: 'Kloof Nek to Camps Bay',
    kind: 'trail',
    sports: ['TRAIL', 'RUNNING'],
    blurb: 'Mostly flat trail under the Twelve Apostles. Easy chatting pace.',
    bestTime: 'Late afternoon',
    safety: 'Popular but remote in places — go in a group.',
    firstMeet: false,
  },
  {
    id: 'silvermine',
    name: 'Silvermine',
    area: 'Tokai',
    kind: 'trail',
    sports: ['TRAIL', 'CYCLING'],
    blurb: 'Reservoir loop and mountain trails in the south.',
    bestTime: 'Weekend mornings',
    safety: 'Entry fee applies. Stay together on the longer trails.',
    firstMeet: false,
  },
  {
    id: 'rondebosch-common',
    name: 'Rondebosch Common',
    area: 'Rondebosch',
    kind: 'run',
    sports: ['RUNNING', 'TRIATHLON'],
    blurb: 'Open grass loops and home to Rondebosch Common parkrun.',
    bestTime: 'Saturday 08:00 for parkrun',
    safety: 'Busiest on Saturday mornings.',
    firstMeet: true,
  },
  {
    id: 'constantia-greenbelts',
    name: 'Constantia Greenbelts',
    area: 'Constantia',
    kind: 'run',
    sports: ['RUNNING', 'TRAIL'],
    blurb: 'Leafy, linked trails through the southern suburbs.',
    bestTime: 'Morning',
    safety: 'Some quiet stretches — best with a buddy.',
    firstMeet: false,
  },
  {
    id: 'tokai-forest',
    name: 'Tokai Forest',
    area: 'Tokai',
    kind: 'trail',
    sports: ['CYCLING', 'TRAIL'],
    blurb: 'Mountain-bike trails and forest runs.',
    bestTime: 'Weekend mornings',
    safety: 'Share the trails with bikes; go in a group.',
    firstMeet: false,
  },
  {
    id: 'chapmans-peak',
    name: 'Chapman’s Peak Drive',
    area: 'Hout Bay',
    kind: 'ride',
    sports: ['CYCLING'],
    blurb: 'One of the world’s great coastal climbs. Part of the Cycle Tour route.',
    bestTime: 'Early weekend mornings',
    safety: 'Closes in bad weather and rockfall risk — check it’s open first.',
    firstMeet: false,
  },
  {
    id: 'tafelberg-road',
    name: 'Tafelberg Road',
    area: 'Table Mountain',
    kind: 'ride',
    sports: ['CYCLING', 'RUNNING'],
    blurb: 'Steady climb along the base of the mountain.',
    bestTime: 'Morning',
    safety: 'Busy with tourists near the cableway; ride in groups.',
    firstMeet: false,
  },
  {
    id: 'sea-point-pavilion',
    name: 'Sea Point Pavilion pool',
    area: 'Sea Point',
    kind: 'swim',
    sports: ['SWIMMING', 'TRIATHLON'],
    blurb: 'Saltwater pools on the promenade. Lanes for training.',
    bestTime: 'Weekday mornings',
    safety: 'Lifeguarded pool; check seasonal hours.',
    firstMeet: true,
  },
  {
    id: 'long-street-baths',
    name: 'Long Street Baths',
    area: 'City Bowl',
    kind: 'swim',
    sports: ['SWIMMING'],
    blurb: 'Indoor heated pool in the city — for winter training.',
    bestTime: 'Lunchtime',
    safety: 'Indoor public pool.',
    firstMeet: true,
  },
  {
    id: 'camps-bay-tidal-pool',
    name: 'Camps Bay tidal pool',
    area: 'Camps Bay',
    kind: 'swim',
    sports: ['SWIMMING'],
    blurb: 'Cold, clear tidal pool where cold-water swimmers meet at sunrise.',
    bestTime: 'Sunrise',
    safety: 'The Atlantic is cold — build up slowly and never swim alone.',
    firstMeet: true,
  },
  {
    id: 'clifton-4th',
    name: 'Clifton 4th Beach',
    area: 'Clifton',
    kind: 'swim',
    sports: ['SWIMMING', 'TRIATHLON'],
    blurb: 'Open-water training in the bay with the swim groups.',
    bestTime: 'Early morning, calm days',
    safety: 'Open water: swim with a group and a tow float.',
    firstMeet: false,
  },
  {
    id: 'muizenberg',
    name: 'Muizenberg Beach',
    area: 'Muizenberg',
    kind: 'surf',
    sports: ['SWIMMING'],
    blurb: 'Gentle, warmer False Bay surf — where Cape Town learns to surf.',
    bestTime: 'Morning, before the wind',
    safety: 'Surf on lifeguarded stretches; watch the shark-spotter flags.',
    firstMeet: true,
  },
  {
    id: 'big-bay',
    name: 'Big Bay, Bloubergstrand',
    area: 'Blouberg',
    kind: 'surf',
    sports: ['RUNNING', 'SWIMMING'],
    blurb: 'Beach runs with the postcard view of Table Mountain. Kite central.',
    bestTime: 'Morning, before the south-easter',
    safety: 'Windy in summer afternoons.',
    firstMeet: true,
  },
  {
    id: 'city-rock',
    name: 'City Rock, Observatory',
    area: 'Observatory',
    kind: 'gym',
    sports: ['CLIMBING', 'CROSSFIT'],
    blurb: 'Indoor bouldering and roped climbing.',
    bestTime: 'Weeknight evenings',
    safety: 'Indoor gym with staff.',
    firstMeet: true,
  },
];

export function ctSpotById(id: string | undefined): CtSpot | undefined {
  return CT_SPOTS.find((s) => s.id === id);
}

export function ctSpotByName(name: string): CtSpot | undefined {
  return CT_SPOTS.find((s) => s.name === name);
}

// ── Communities ──────────────────────────────────────────────────────

export interface Community {
  id: string;
  name: string;
  instagram?: string; // handle without @
  website?: string;
  kind: SpotKind;
  sport: Discipline;
  vibe: string;
  when: string;
  where: string;
  spotId?: string;
  forWho: string;
  // True until the club confirms its listing with Pace.
  listed: boolean;
}

export const COMMUNITIES: Community[] = [
  {
    id: 'running-late-club',
    name: 'Running Late Club',
    instagram: 'runninglateclub',
    website: 'https://www.runninglateclub.com',
    kind: 'run',
    sport: 'RUNNING',
    vibe: 'One of Cape Town’s biggest social run crews — music, a big crowd and a party feel.',
    when: 'Wednesday evenings (check Instagram for times)',
    where: 'Saunders Rock parking, Sea Point',
    spotId: 'sea-point-promenade',
    forWho: '5 km and 7 km options · free',
    listed: true,
  },
  {
    id: 'tuesday-trails',
    name: 'Tuesday Trails',
    instagram: 'tuesdaytrails',
    website: 'https://www.tuesdaytrails.com',
    kind: 'trail',
    sport: 'TRAIL',
    vibe: 'Weekly trail runs that never repeat a route, with about a 50/50 gender mix.',
    when: 'Tuesdays 17:45 · about an hour',
    where: 'Varies — Newlands Forest or the town side (posted on Instagram)',
    spotId: 'newlands-forest',
    forWho: 'Four pace groups, from easy to fast',
    listed: true,
  },
  {
    id: 'mustlovehills',
    name: 'MustLoveHills Run Crew',
    instagram: 'mustlovehills_runcrew',
    website: 'https://www.mustlovehillsruncrew.com',
    kind: 'run',
    sport: 'RUNNING',
    vibe: 'A crew built around hills, track and long runs — here to empower and motivate.',
    when: 'Tuesday Hills, Track Thursdays and weekend long runs',
    where: 'Posted on Instagram each week',
    forWho: 'Runners who like a challenge',
    listed: true,
  },
  {
    id: 'notsofast',
    name: 'NotSoFast Running Club',
    instagram: 'notsofast.runningclub.ct',
    kind: 'run',
    sport: 'RUNNING',
    vibe: 'Made for anyone who feels intimidated by fast groups. Everyone deserves to run.',
    when: 'Check Instagram for this week’s runs',
    where: 'Cape Town',
    forWho: '6–9 min/km · all levels',
    listed: true,
  },
  {
    id: 'couch-potato',
    name: 'Couch Potato Run Club',
    instagram: 'couchpotatorunclub',
    website: 'https://www.couchpotatorunclub.co.za',
    kind: 'run',
    sport: 'RUNNING',
    vibe: 'Walk-run sessions that get complete beginners to their first 5 km.',
    when: 'Check Instagram for groups and times',
    where: 'Started in Tokai; more groups across Cape Town',
    forWho: 'Absolute beginners',
    listed: true,
  },
  {
    id: 'social-runners',
    name: 'Social Runners Club',
    instagram: 'social_runners_club',
    website: 'https://www.socialrunners.co.za',
    kind: 'run',
    sport: 'RUNNING',
    vibe: 'A social running club with membership and group runs.',
    when: 'Check Instagram for this week’s runs',
    where: 'Cape Town',
    forWho: 'Social runners of all levels',
    listed: true,
  },
  {
    id: 'atlantic-athletic',
    name: 'Atlantic Athletic Club',
    kind: 'run',
    sport: 'RUNNING',
    vibe: 'One of Cape Town’s oldest running clubs (since 1979), rooted on the Atlantic Seaboard.',
    when: 'Club runs through the week',
    where: 'Sea Point, Camps Bay and Hout Bay',
    spotId: 'sea-point-promenade',
    forWho: 'Club runners and racers',
    listed: true,
  },
  {
    id: 'cold-water-social',
    name: 'Cold Water Social Club',
    instagram: 'coldwatersocialclub',
    kind: 'swim',
    sport: 'SWIMMING',
    vibe: 'Sunrise sea swims and breathwork on the Atlantic side.',
    when: '2–3 times a week around sunrise (tide and weather dependent)',
    where: 'Camps Bay tidal pool, Clifton and nearby beaches',
    spotId: 'camps-bay-tidal-pool',
    forWho: 'Cold-water curious to seasoned dippers',
    listed: true,
  },
  {
    id: 'swim-cape-town',
    name: 'Cape Town Open Water Swim Co.',
    instagram: 'capetownswim',
    website: 'https://capetownswim.com',
    kind: 'swim',
    sport: 'SWIMMING',
    vibe: 'Coached open-water groups — from first sea swims to Robben Island.',
    when: 'Most days except Sunday',
    where: 'Clifton, Simon’s Town and Blouberg',
    spotId: 'clifton-4th',
    forWho: 'Newcomers to experienced swimmers',
    listed: true,
  },
  {
    id: 'pedal-power',
    name: 'Pedal Power Association social rides',
    website: 'https://www.pedalpower.org.za',
    kind: 'ride',
    sport: 'CYCLING',
    vibe: 'Easy social road rides with a free coffee after.',
    when: 'Saturdays 06:30 · 32–36 km',
    where: 'Hill Park Lane, Mowbray',
    forWho: 'Social riders',
    listed: true,
  },
  {
    id: 'cycling-friends',
    name: 'Cycling Friends Cape Town',
    instagram: 'cycling_friends_cape_town',
    kind: 'ride',
    sport: 'CYCLING',
    vibe: 'Group rides and a friendly cycling community.',
    when: 'Check Instagram for rides',
    where: 'Cape Town',
    forWho: 'Road riders',
    listed: true,
  },
];

export function communityById(id: string | undefined): Community | undefined {
  return COMMUNITIES.find((c) => c.id === id);
}

// ── Events ───────────────────────────────────────────────────────────

export type EventKind = 'race' | 'parkrun' | 'club';

export interface CtEvent {
  id: string;
  title: string;
  kind: EventKind;
  sport: Discipline;
  // One-off events carry a date; weekly ones a weekday + time.
  date?: string; // ISO date
  endDate?: string;
  weekly?: { day: number; time: string }; // day: 0 = Monday
  where: string;
  spotId?: string;
  communityId?: string;
  raceId?: string;
  detail: string;
  price: string;
}

export const CT_EVENTS: CtEvent[] = [
  {
    id: 'green-point-parkrun',
    title: 'Green Point parkrun',
    kind: 'parkrun',
    sport: 'RUNNING',
    weekly: { day: 5, time: '08:00' },
    where: 'Green Point Urban Park (start opposite Park Café)',
    spotId: 'green-point-park',
    detail: 'Free, timed 5 km run or walk. Register once and bring your barcode.',
    price: 'Free',
  },
  {
    id: 'rondebosch-parkrun',
    title: 'Rondebosch Common parkrun',
    kind: 'parkrun',
    sport: 'RUNNING',
    weekly: { day: 5, time: '08:00' },
    where: 'Rondebosch Common',
    spotId: 'rondebosch-common',
    detail: 'Free, timed 5 km run or walk. Register once and bring your barcode.',
    price: 'Free',
  },
  {
    id: 'rlc-wednesday',
    title: 'Running Late Club · Wednesday run',
    kind: 'club',
    sport: 'RUNNING',
    weekly: { day: 2, time: '18:00' },
    where: 'Saunders Rock parking, Sea Point',
    spotId: 'sea-point-promenade',
    communityId: 'running-late-club',
    detail: '5 km and 7 km social run. Time shown is approximate — confirm on Instagram.',
    price: 'Free',
  },
  {
    id: 'tuesday-trails-weekly',
    title: 'Tuesday Trails',
    kind: 'club',
    sport: 'TRAIL',
    weekly: { day: 1, time: '17:45' },
    where: 'Meeting point posted on Instagram',
    spotId: 'newlands-forest',
    communityId: 'tuesday-trails',
    detail: 'About an hour on the trails in four pace groups.',
    price: 'Free',
  },
  {
    id: 'ppa-saturday',
    title: 'Pedal Power social ride',
    kind: 'club',
    sport: 'CYCLING',
    weekly: { day: 5, time: '06:30' },
    where: 'Hill Park Lane, Mowbray',
    communityId: 'pedal-power',
    detail: '32–36 km social road ride, coffee after.',
    price: 'Free',
  },
  {
    id: 'utct-2026',
    title: 'Ultra-Trail Cape Town',
    kind: 'race',
    sport: 'TRAIL',
    date: '2026-11-20',
    endDate: '2026-11-22',
    where: 'Table Mountain National Park',
    spotId: 'platteklip',
    raceId: 'utct',
    detail: 'Race weekend with multiple trail distances. Come to run, crew or cheer.',
    price: 'Entry required',
  },
  {
    id: 'cycle-tour-2027',
    title: 'Cape Town Cycle Tour',
    kind: 'race',
    sport: 'CYCLING',
    date: '2027-03-14',
    where: 'Around the peninsula — including Chapman’s Peak',
    spotId: 'chapmans-peak',
    raceId: 'cape-town-cycle-tour',
    detail: 'The world’s biggest timed cycle race. Training rides fill Chapman’s Peak for months.',
    price: 'Entry required',
  },
  {
    id: 'two-oceans-2027',
    title: 'Two Oceans Marathon week',
    kind: 'race',
    sport: 'RUNNING',
    date: '2027-03-31',
    endDate: '2027-04-04',
    where: 'Cape Town',
    raceId: 'two-oceans',
    detail:
      'Night run, trail run and Friendship Run, then the Half Marathon (Sat 3 Apr) and the Ultra (Sun 4 Apr).',
    price: 'Entry required',
  },
];

export function eventById(id: string | undefined): CtEvent | undefined {
  return CT_EVENTS.find((e) => e.id === id);
}

// Next time an event happens, from `now`. One-offs return their date
// (or null once they're over).
export function nextOccurrence(e: CtEvent, now: Date = new Date()): Date | null {
  if (e.weekly) {
    const [h, m] = e.weekly.time.split(':').map(Number);
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
    const today = (now.getDay() + 6) % 7;
    d.setDate(d.getDate() + ((e.weekly.day - today + 7) % 7));
    if (d.getTime() < now.getTime()) d.setDate(d.getDate() + 7);
    return d;
  }
  if (!e.date) return null;
  const end = new Date(`${e.endDate ?? e.date}T23:59:00`);
  if (end.getTime() < now.getTime()) return null;
  return new Date(`${e.date}T00:00:00`);
}

// Upcoming events, soonest first.
export function upcomingEvents(now: Date = new Date()): { event: CtEvent; at: Date }[] {
  return CT_EVENTS.map((event) => ({ event, at: nextOccurrence(event, now) }))
    .filter((x): x is { event: CtEvent; at: Date } => x.at !== null)
    .sort((a, b) => a.at.getTime() - b.at.getTime());
}

// ── Challenges ───────────────────────────────────────────────────────

export interface Challenge {
  id: string;
  title: string;
  detail: string;
  goal: number;
  // What counts: stamps at these spots, or at any spot of these kinds.
  spotIds?: string[];
  kinds?: SpotKind[];
  distinct?: boolean; // count different spots, not visits
  badge: string;
}

export const CHALLENGES: Challenge[] = [
  {
    id: 'lions-head-4',
    title: 'Lion’s Head × 4',
    detail: 'Summit Lion’s Head four times this month.',
    goal: 4,
    spotIds: ['lions-head'],
    badge: 'Lion tamer',
  },
  {
    id: 'spot-hopper',
    title: 'Spot hopper',
    detail: 'Train at 6 different Cape Town spots.',
    goal: 6,
    distinct: true,
    badge: 'Explorer',
  },
  {
    id: 'parkrun-3',
    title: 'Three parkruns',
    detail: 'Run 3 parkruns — Green Point or Rondebosch Common.',
    goal: 3,
    spotIds: ['green-point-park', 'rondebosch-common'],
    badge: 'Saturday regular',
  },
  {
    id: 'cold-water-4',
    title: 'Cold water club',
    detail: 'Four sea or tidal-pool swims this month.',
    goal: 4,
    kinds: ['swim', 'surf'],
    badge: 'Ice in the veins',
  },
  {
    id: 'mountain-3',
    title: 'Mountain month',
    detail: 'Three sessions on Table Mountain trails.',
    goal: 3,
    spotIds: ['platteklip', 'kloof-corner', 'pipe-track', 'lions-head'],
    badge: 'Mountain goat',
  },
];

// ── Conditions ───────────────────────────────────────────────────────

const CT_LAT = -33.92;
const CT_LNG = 18.42;
const SAST = 2; // UTC+2, no daylight saving

// Sunrise/sunset for Cape Town (NOAA approximation — within a few
// minutes), as "HH:MM" local time.
export function sunTimes(date: Date): { sunrise: string; sunset: string } {
  const start = Date.UTC(date.getFullYear(), 0, 0);
  const day = Math.floor(
    (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - start) / 86400000
  );
  const g = ((2 * Math.PI) / 365) * (day - 1);
  const eqTime =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(g) -
      0.032077 * Math.sin(g) -
      0.014615 * Math.cos(2 * g) -
      0.040849 * Math.sin(2 * g));
  const decl =
    0.006918 -
    0.399912 * Math.cos(g) +
    0.070257 * Math.sin(g) -
    0.006758 * Math.cos(2 * g) +
    0.000907 * Math.sin(2 * g) -
    0.002697 * Math.cos(3 * g) +
    0.00148 * Math.sin(3 * g);
  const lat = (CT_LAT * Math.PI) / 180;
  const ha = Math.acos(
    Math.cos((90.833 * Math.PI) / 180) / (Math.cos(lat) * Math.cos(decl)) -
      Math.tan(lat) * Math.tan(decl)
  );
  const haDeg = (ha * 180) / Math.PI;
  const fmt = (minutesUtc: number) => {
    const local = (((minutesUtc + SAST * 60) % 1440) + 1440) % 1440;
    const h = Math.floor(local / 60);
    const m = Math.round(local % 60);
    return `${String(m === 60 ? h + 1 : h).padStart(2, '0')}:${String(m === 60 ? 0 : m).padStart(2, '0')}`;
  };
  return {
    sunrise: fmt(720 - 4 * (CT_LNG + haDeg) - eqTime),
    sunset: fmt(720 - 4 * (CT_LNG - haDeg) - eqTime),
  };
}

// Wind and swell are demo values until a weather API is connected; they
// vary by day so the board looks alive. Summer afternoons bring the
// south-easter ("Cape Doctor").
export interface Conditions {
  sunrise: string;
  sunset: string;
  windKmh: number;
  windDir: string;
  swellM: number;
  waterC: number;
  tableCloth: boolean;
  demo: true;
}

export function conditions(date: Date = new Date()): Conditions {
  const seed = date.getFullYear() * 400 + date.getMonth() * 31 + date.getDate();
  const r = (n: number) => (Math.sin(seed * 9.1 + n) + 1) / 2;
  const summer = [10, 11, 0, 1, 2].includes(date.getMonth());
  const windDir = summer ? 'SE' : r(1) > 0.5 ? 'NW' : 'SE';
  return {
    ...sunTimes(date),
    windKmh: Math.round((summer ? 18 : 10) + r(2) * 30),
    windDir,
    swellM: Math.round((0.8 + r(3) * 2.4) * 10) / 10,
    waterC: Math.round(summer ? 13 + r(4) * 6 : 12 + r(4) * 3),
    tableCloth: windDir === 'SE' && r(5) > 0.5,
    demo: true,
  };
}

// Plain-language advice from the board.
export function conditionsTip(c: Conditions): string {
  if (c.windKmh >= 40)
    return 'Strong south-easter — trails and the promenade will be rough. Try Newlands Forest or an indoor session.';
  if (c.tableCloth)
    return 'Table cloth on the mountain — skip the upper trails, run the Pipe Track or the promenade instead.';
  if (c.windKmh <= 15) return 'Calm day — perfect for a sea swim or Chapman’s Peak.';
  return 'Decent conditions. Get out early before the wind picks up.';
}
