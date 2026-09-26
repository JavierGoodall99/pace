import { ATHLETES, Athlete, Discipline } from './mockData';
import { depthFor } from './athleteDepth';
import type { IlloName } from '../components/Illustrations';

// Races and events — the real-world anchor for "race mode": see who's
// training for the same start line and meet at the expo or finish.

export interface Race {
  id: string;
  name: string;
  city: string;
  date: string; // ISO date
  distance: string;
  sport: Discipline;
  illo: IlloName;
  meetup: string; // suggested race-weekend meetup spot
}

export const RACES: Race[] = [
  {
    id: 'utct',
    name: 'Ultra-Trail Cape Town',
    city: 'Cape Town',
    date: '2026-11-20',
    distance: 'Multiple trail distances',
    sport: 'TRAIL',
    illo: 'trail',
    meetup: 'Race village — cheer on the finishers',
  },
  {
    id: 'cape-town-cycle-tour',
    name: 'Cape Town Cycle Tour',
    city: 'Cape Town',
    date: '2027-03-14',
    distance: '109 km',
    sport: 'CYCLING',
    illo: 'cycle',
    meetup: 'Coffee after the finish',
  },
  {
    id: 'two-oceans-half',
    name: 'Two Oceans Half Marathon',
    city: 'Cape Town',
    date: '2027-04-03',
    distance: '21.1 km',
    sport: 'RUNNING',
    illo: 'run',
    meetup: 'Expo, CTICC',
  },
  {
    id: 'soweto-marathon',
    name: 'Soweto Marathon',
    city: 'Johannesburg',
    date: '2026-11-01',
    distance: '42.2 km',
    sport: 'RUNNING',
    illo: 'run',
    meetup: 'Finish line, FNB Stadium',
  },
  {
    id: 'cycle-challenge',
    name: '947 Cycle Challenge',
    city: 'Johannesburg',
    date: '2026-11-15',
    distance: '97 km',
    sport: 'CYCLING',
    illo: 'cycle',
    meetup: 'Coffee at the start village',
  },
  {
    id: 'im-703-east-london',
    name: 'IRONMAN 70.3 East London',
    city: 'East London',
    date: '2027-01-24',
    distance: '113 km',
    sport: 'TRIATHLON',
    illo: 'medal',
    meetup: 'Athlete village, Orient Beach',
  },
  {
    id: 'midmar-mile',
    name: 'Midmar Mile',
    city: 'Pietermaritzburg',
    date: '2027-02-13',
    distance: '1.6 km swim',
    sport: 'SWIMMING',
    illo: 'swim',
    meetup: 'Registration tent, north shore',
  },
  {
    id: 'two-oceans',
    name: 'Two Oceans Ultra',
    city: 'Cape Town',
    date: '2027-04-04',
    distance: '56 km',
    sport: 'RUNNING',
    illo: 'trail',
    meetup: 'Expo, CTICC',
  },
];

export function raceById(id: string | null | undefined): Race | undefined {
  return RACES.find((r) => r.id === id);
}

export function daysUntil(isoDate: string, now: Date = new Date()): number {
  const target = new Date(`${isoDate}T00:00:00`);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

export function formatRaceDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function athletesTrainingFor(raceId: string): Athlete[] {
  return ATHLETES.filter((a) => depthFor(a).goalRaceId === raceId);
}

export function upcomingRaces(now: Date = new Date()): Race[] {
  return RACES.filter((r) => daysUntil(r.date, now) >= 0).sort((a, b) =>
    a.date.localeCompare(b.date)
  );
}

export const BUILD_UP_WEEKS = 4;

// Weekly group long runs in the build-up: the next few Saturdays before
// race day (race week itself gets the shake-out meetup instead).
export function buildUpRuns(
  race: Pick<Race, 'date'>,
  now: Date = new Date(),
  n: number = BUILD_UP_WEEKS
): { date: Date; weeksToGo: number }[] {
  const raceDay = new Date(`${race.date}T00:00:00`);
  const sat = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7, 0, 0, 0);
  sat.setDate(sat.getDate() + ((6 - sat.getDay() + 7) % 7));
  if (sat.getTime() <= now.getTime()) sat.setDate(sat.getDate() + 7);
  const runs: { date: Date; weeksToGo: number }[] = [];
  while (runs.length < n) {
    const daysLeft = (raceDay.getTime() - sat.getTime()) / 86400000;
    if (daysLeft < 7) break;
    runs.push({ date: new Date(sat), weeksToGo: Math.ceil(daysLeft / 7) });
    sat.setDate(sat.getDate() + 7);
  }
  return runs;
}
