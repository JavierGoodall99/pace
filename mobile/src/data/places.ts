import { CT_SPOTS } from './capeTown';
import type { Discipline } from './mockData';

// Public, busy meeting spots per city and sport. Sessions default to
// these so a first meet is somewhere visible — part of Pace's
// safety-by-design. Mock data until a places API exists.

export interface Spot {
  name: string;
  city: string;
  sports: Discipline[];
}

// Cape Town (launch city) comes from the curated guide; the rest are for
// travel mode.
export const SPOTS: Spot[] = [
  ...CT_SPOTS.filter((s) => s.firstMeet).map((s) => ({
    name: s.name,
    city: 'Cape Town',
    sports: s.sports,
  })),
  { name: 'Groenkloof Athletics Track', city: 'Pretoria', sports: ['RUNNING', 'TRIATHLON'] },
  { name: 'Moreleta Kloof Nature Reserve', city: 'Pretoria', sports: ['TRAIL', 'RUNNING'] },
  { name: 'CrossFit Box, Pretoria East', city: 'Pretoria', sports: ['CROSSFIT', 'CLIMBING'] },
  { name: 'LC de Villiers pool', city: 'Pretoria', sports: ['SWIMMING', 'TRIATHLON'] },
  { name: 'Zoo Lake', city: 'Johannesburg', sports: ['RUNNING', 'TRIATHLON', 'TRAIL'] },
  { name: 'Parkview coffee stop', city: 'Johannesburg', sports: ['CYCLING'] },
  { name: 'Ellis Park pool', city: 'Johannesburg', sports: ['SWIMMING'] },
  { name: 'North Beach, uShaka', city: 'Durban', sports: ['SWIMMING', 'RUNNING', 'TRIATHLON'] },
];

export function spotsFor(city: string, sport?: Discipline): Spot[] {
  const want = canonicalCity(city);
  const inCity = SPOTS.filter((s) => s.city === want);
  const pool = inCity.length ? inCity : SPOTS;
  if (!sport) return pool;
  const matching = pool.filter((s) => s.sports.includes(sport));
  return matching.length ? [...matching, ...pool.filter((s) => !matching.includes(s))] : pool;
}

// Cities Pace matches in. Profiles pick from this list rather than typing
// free text, so matching never depends on how someone spelled their city.
export const CITIES = ['Cape Town', 'Johannesburg', 'Pretoria', 'Durban'] as const;
export type City = (typeof CITIES)[number];

// Common spellings people typed before the picker existed.
const CITY_ALIASES: Record<string, City> = {
  'cape town': 'Cape Town',
  capetown: 'Cape Town',
  cpt: 'Cape Town',
  kaapstad: 'Cape Town',
  johannesburg: 'Johannesburg',
  joburg: 'Johannesburg',
  jozi: 'Johannesburg',
  jhb: 'Johannesburg',
  pretoria: 'Pretoria',
  tshwane: 'Pretoria',
  pta: 'Pretoria',
  durban: 'Durban',
  dbn: 'Durban',
  ethekwini: 'Durban',
};

// Maps "cape town", " Cape Town, WC", "Cape Town, South Africa" etc. to
// the canonical name. Unknown cities come back trimmed and unchanged.
export function canonicalCity(input: string | null | undefined): string {
  const trimmed = (input ?? '').trim();
  if (!trimmed) return '';
  const head = trimmed.split(',')[0].trim().toLowerCase().replace(/\s+/g, ' ');
  return CITY_ALIASES[head] ?? CITY_ALIASES[head.replace(/ /g, '')] ?? trimmed;
}

// Road distance between city centres, km. Mock until real coordinates.
const CITY_KM: Record<string, number> = {
  'Pretoria|Johannesburg': 55,
  'Pretoria|Durban': 600,
  'Pretoria|Cape Town': 1460,
  'Johannesburg|Durban': 570,
  'Johannesburg|Cape Town': 1400,
  'Durban|Cape Town': 1640,
};

export function cityDistanceKm(a: string, b: string): number {
  const ca = canonicalCity(a);
  const cb = canonicalCity(b);
  if (!ca || !cb || ca === cb) return 0;
  return CITY_KM[`${ca}|${cb}`] ?? CITY_KM[`${cb}|${ca}`] ?? 500;
}

// Your approximate distance to an athlete: same city → their offset
// from the centre, otherwise city-to-city.
export function distanceTo(myCity: string, theirCity: string, nearKm: number): number {
  const between = cityDistanceKm(myCity, theirCity);
  return between === 0 ? nearKm : between;
}

export function formatKm(km: number): string {
  return km < 1 ? '<1 km away' : `${km >= 100 ? km.toLocaleString('en-ZA') : km} km away`;
}
