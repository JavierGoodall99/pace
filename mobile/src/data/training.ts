import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMemo, useSyncExternalStore } from 'react';
import { dayIndex, localDayKey, startOfDay, weekKey } from './dates';
import type { Discipline } from './mockData';
import { effectiveStatus, Plan, usePlans } from './plans';
import type { Provider, SyncSummary } from './sync';
import { ACTIVE_DAYS } from './trust';

// Your training log: how Pace knows you actually train. Three sources:
//
//   manual   — sessions you log yourself (self-reported)
//   strava / garmin — activities imported from a connected account
//   session  — Pace sessions you completed with a match (from plans.ts)
//
// Only synced and Pace-session entries count as verified. The "trained in
// the last ACTIVE_DAYS days" rule that decides who appears in other
// people's decks is computed from this log. A backend must compute the
// same thing server-side so it can't be faked by editing local storage.

export type TrainingSource = 'manual' | Provider | 'session';

export interface TrainingEntry {
  id: string;
  at: string; // ISO datetime
  sport: Discipline;
  minutes: number;
  km?: number;
  note?: string;
  source: TrainingSource;
}

export const SOURCE_LABEL: Record<TrainingSource, string> = {
  manual: 'Logged',
  strava: 'Strava',
  garmin: 'Garmin',
  apple: 'Apple Health',
  samsung: 'Samsung Health',
  session: 'Pace session',
};

// How far back you can log by hand, and duration bounds.
export const MAX_BACKFILL_DAYS = 6;
export const MIN_MINUTES = 5;
export const MAX_MINUTES = 600;

const STORAGE_KEY = 'pace.training.v1';

let entries: TrainingEntry[] = [];
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function persist() {
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries)).catch((e) =>
    console.warn('Failed to save training log:', e)
  );
}

export const trainingReady: Promise<void> = AsyncStorage.getItem(STORAGE_KEY)
  .then((raw) => {
    const saved = raw ? (JSON.parse(raw) as TrainingEntry[]) : [];
    // Entries added before the load finished win over stored copies.
    const ids = new Set(entries.map((e) => e.id));
    entries = [...saved.filter((e) => !ids.has(e.id)), ...entries];
  })
  .catch(() => {})
  .finally(() => {
    hydrated = true;
    emit();
  });

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useTrainingLog(): TrainingEntry[] {
  return useSyncExternalStore(subscribe, () => entries);
}

export function getTrainingLog(): TrainingEntry[] {
  return entries;
}

export function isTrainingHydrated(): boolean {
  return hydrated;
}

function newId() {
  return `t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export type LogResult = { ok: true; entry: TrainingEntry } | { ok: false; error: string };

export function logTraining(
  input: { at: Date; sport: Discipline; minutes: number; km?: number; note?: string },
  now: Date = new Date()
): LogResult {
  if (input.at.getTime() > now.getTime()) return { ok: false, error: 'That’s in the future.' };
  const oldest = startOfDay(now);
  oldest.setDate(oldest.getDate() - MAX_BACKFILL_DAYS);
  if (input.at.getTime() < oldest.getTime())
    return { ok: false, error: `You can log up to ${MAX_BACKFILL_DAYS} days back.` };
  if (!Number.isFinite(input.minutes) || input.minutes < MIN_MINUTES || input.minutes > MAX_MINUTES)
    return { ok: false, error: `Duration must be ${MIN_MINUTES}–${MAX_MINUTES} minutes.` };
  if (input.km !== undefined && (!Number.isFinite(input.km) || input.km <= 0 || input.km > 400))
    return { ok: false, error: 'Distance looks off.' };
  const entry: TrainingEntry = {
    id: newId(),
    at: input.at.toISOString(),
    sport: input.sport,
    minutes: Math.round(input.minutes),
    km: input.km,
    note: input.note?.trim() || undefined,
    source: 'manual',
  };
  entries = [entry, ...entries];
  emit();
  persist();
  return { ok: true, entry };
}

// Only your own manual entries can be removed; synced ones come back on
// the next sync anyway.
export function removeTraining(id: string) {
  const next = entries.filter((e) => !(e.id === id && e.source === 'manual'));
  if (next.length === entries.length) return;
  entries = next;
  emit();
  persist();
}

// Mock import: turns a sync summary's 4-week heatmap into dated entries.
// Week 3 is the current week (Monday first); future days are skipped. A
// real build maps the provider's activity list instead.
export function importSynced(
  summary: SyncSummary,
  sport: Discipline,
  now: Date = new Date()
): TrainingEntry[] {
  const monday = startOfDay(now);
  monday.setDate(monday.getDate() - dayIndex(now) - 21);
  const imported: TrainingEntry[] = [];
  summary.weeks.forEach((week, w) =>
    week.forEach((effort, d) => {
      if (!effort) return;
      const at = new Date(monday);
      at.setDate(monday.getDate() + w * 7 + d);
      at.setHours(6, 30, 0, 0);
      if (at.getTime() > now.getTime()) return;
      imported.push({
        id: `${summary.provider}-${localDayKey(at)}`,
        at: at.toISOString(),
        sport,
        minutes: 30 + effort * 20,
        km: Math.round(effort * 4.5 * 10) / 10,
        source: summary.provider,
      });
    })
  );
  entries = [...entries.filter((e) => e.source !== summary.provider), ...imported];
  emit();
  persist();
  return imported;
}

// Completed Pace sessions count as training too.
export function sessionEntries(plans: Plan[], now: Date = new Date()): TrainingEntry[] {
  return plans
    .filter(
      (p) => effectiveStatus(p, now) === 'done' && new Date(p.date).getTime() <= now.getTime()
    )
    .map((p) => ({
      id: `session-${p.id}`,
      at: p.date,
      sport: p.activity,
      minutes: 60,
      source: 'session' as const,
    }));
}

export function allTraining(
  log: TrainingEntry[],
  plans: Plan[],
  now: Date = new Date()
): TrainingEntry[] {
  return [...log, ...sessionEntries(plans, now)]
    .filter((e) => new Date(e.at).getTime() <= now.getTime())
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}

export interface Activity {
  // Whole days since your last session (0 = today); null if never.
  lastTrainedDays: number | null;
  source: TrainingSource | null;
  // Trained within ACTIVE_DAYS: you show up in other people's decks.
  active: boolean;
  trainedToday: boolean;
  // Sessions in the last 7 days.
  thisWeek: number;
  streak: Streak;
}

// Weekly streak: consecutive Monday-first weeks with at least one session
// (logged, synced or a Pace session). Weeks, not days, so rest days never
// break it. This week only counts once you've trained; until then the
// streak carries over from last week and is at risk.
export interface Streak {
  weeks: number;
  // Streak is alive but nothing logged yet this week.
  atRisk: boolean;
  best: number;
}

export function weeklyStreak(all: TrainingEntry[], now: Date = new Date()): Streak {
  const trained = new Set(all.map((e) => weekKey(new Date(e.at))));
  const weekBefore = (d: Date) => {
    const prev = new Date(d);
    prev.setDate(prev.getDate() - 7);
    return prev;
  };

  const thisWeekDone = trained.has(weekKey(now));
  let cursor = thisWeekDone ? now : weekBefore(now);
  let weeks = 0;
  while (trained.has(weekKey(cursor))) {
    weeks++;
    cursor = weekBefore(cursor);
  }

  // Longest run anywhere in the log.
  let best = 0;
  trained.forEach((key) => {
    const [y, m, d] = key.split('-').map(Number);
    const monday = new Date(y, m - 1, d);
    if (trained.has(weekKey(weekBefore(monday)))) return; // not the start of a run
    let run = 0;
    let c = monday;
    while (trained.has(weekKey(c))) {
      run++;
      c = new Date(c.getFullYear(), c.getMonth(), c.getDate() + 7);
    }
    best = Math.max(best, run);
  });

  return { weeks, atRisk: weeks > 0 && !thisWeekDone, best };
}

// "3-week streak" / "3-week streak · log a session this week to keep it"
export function streakText(s: Streak): string {
  if (s.weeks === 0) return 'Log a session to start a streak';
  const base = `${s.weeks}-week streak`;
  return s.atRisk ? `${base} · train this week to keep it` : base;
}

export function activityOf(all: TrainingEntry[], now: Date = new Date()): Activity {
  const latest = all[0];
  const today = startOfDay(now).getTime();
  const days = latest
    ? Math.round((today - startOfDay(new Date(latest.at)).getTime()) / 86400000)
    : null;
  const weekAgo = today - 6 * 86400000;
  return {
    lastTrainedDays: days,
    source: latest?.source ?? null,
    active: days !== null && days <= ACTIVE_DAYS,
    trainedToday: days === 0,
    thisWeek: all.filter((e) => startOfDay(new Date(e.at)).getTime() >= weekAgo).length,
    streak: weeklyStreak(all, now),
  };
}

// "Trained today · Strava" / "No training logged yet"
export function activityText(a: Activity): string {
  if (a.lastTrainedDays === null) return 'No training logged yet';
  const when =
    a.lastTrainedDays === 0
      ? 'Trained today'
      : a.lastTrainedDays === 1
        ? 'Trained yesterday'
        : `Trained ${a.lastTrainedDays} days ago`;
  return a.source ? `${when} · ${SOURCE_LABEL[a.source]}` : when;
}

// Last 4 weeks, Monday first, 0 = rest, 1–3 = effort by total minutes.
export function trainingHeatmap(all: TrainingEntry[], now: Date = new Date()): number[][] {
  const monday = startOfDay(now);
  monday.setDate(monday.getDate() - dayIndex(now) - 21);
  const minutesByDay = new Map<string, number>();
  all.forEach((e) => {
    const k = localDayKey(new Date(e.at));
    minutesByDay.set(k, (minutesByDay.get(k) ?? 0) + e.minutes);
  });
  return [0, 1, 2, 3].map((w) =>
    [0, 1, 2, 3, 4, 5, 6].map((d) => {
      const day = new Date(monday);
      day.setDate(monday.getDate() + w * 7 + d);
      const m = minutesByDay.get(localDayKey(day)) ?? 0;
      return m === 0 ? 0 : m < 45 ? 1 : m < 90 ? 2 : 3;
    })
  );
}

// Everything you've done plus the derived activity, for screens.
export function useMyTraining(now: Date): {
  all: TrainingEntry[];
  activity: Activity;
  heatmap: number[][];
} {
  const log = useTrainingLog();
  const { plans } = usePlans();
  const day = localDayKey(now);
  return useMemo(() => {
    const all = allTraining(log, plans, now);
    return { all, activity: activityOf(all, now), heatmap: trainingHeatmap(all, now) };
  }, [log, plans, day]); // eslint-disable-line react-hooks/exhaustive-deps
}

// For tests.
export function resetTraining(list: TrainingEntry[] = []) {
  entries = list;
  emit();
}
