import { ATHLETES, Athlete, Discipline } from './mockData';
import { depthFor } from './athleteDepth';

// Races and events — the real-world anchor for "race mode": see who's
// training for the same start line and meet at the expo or finish.

export interface Race {
  id: string;
  name: string;
  city: string;
  date: string; // ISO date
  distance: string;
  sport: Discipline;
  emoji: string;
  meetup: string; // suggested race-weekend meetup spot
}

export const RACES: Race[] = [
  {
    id: 'cape-town-marathon',
    name: 'Cape Town Marathon',
    city: 'Cape Town',
    date: '2026-10-18',
    distance: '42.2 km',
    sport: 'RUNNING',
    emoji: '🏃',
    meetup: 'Expo, Green Point Stadium',
  },
  {
    id: 'soweto-marathon',
    name: 'Soweto Marathon',
    city: 'Johannesburg',
    date: '2026-11-01',
    distance: '42.2 km',
    sport: 'RUNNING',
    emoji: '🏃',
    meetup: 'Finish line, FNB Stadium',
  },
  {
    id: 'cycle-challenge',
    name: '947 Cycle Challenge',
    city: 'Johannesburg',
    date: '2026-11-15',
    distance: '97 km',
    sport: 'CYCLING',
    emoji: '🚴',
    meetup: 'Coffee at the start village',
  },
  {
    id: 'im-703-east-london',
    name: 'IRONMAN 70.3 East London',
    city: 'East London',
    date: '2027-01-24',
    distance: '113 km',
    sport: 'TRIATHLON',
    emoji: '🏅',
    meetup: 'Athlete village, Orient Beach',
  },
  {
    id: 'midmar-mile',
    name: 'Midmar Mile',
    city: 'Pietermaritzburg',
    date: '2027-02-13',
    distance: '1.6 km swim',
    sport: 'SWIMMING',
    emoji: '🏊',
    meetup: 'Registration tent, north shore',
  },
  {
    id: 'two-oceans',
    name: 'Two Oceans Ultra',
    city: 'Cape Town',
    date: '2027-04-03',
    distance: '56 km',
    sport: 'RUNNING',
    emoji: '⛰️',
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
