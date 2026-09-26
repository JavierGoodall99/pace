import type { AthleteDepth } from './athleteDepth';

// Trust rules — the things that make other fitness dating apps feel dead
// or scammy, handled on purpose:
//
//   · Only selfie-verified people who've actually trained recently are
//     shown. Abandoned profiles quietly drop out.
//   · Nearby by default, with mutual age ranges, so nobody gets a feed of
//     people two hours away or twice their age.
//   · A daily like budget so likes mean something, and matches that
//     expire if nobody says hi.
//   · Money / off-app requests in chat are flagged with a report button.
//   · Messages and who liked you are never behind a paywall.

// Hidden from drops once they haven't trained (synced activity or a
// Pace session) in this many days.
export const ACTIVE_DAYS = 14;
export const DEFAULT_RADIUS_KM = 80;
export const LIKES_PER_DAY = 10;
export const MATCH_TTL_DAYS = 3;

export function isActive(d: Pick<AthleteDepth, 'lastTrainedDays'>): boolean {
  return d.lastTrainedDays <= ACTIVE_DAYS;
}

const SOURCE_LABEL: Record<AthleteDepth['activitySource'], string> = {
  strava: 'Strava',
  garmin: 'Garmin',
  sessions: 'Pace sessions',
};

// "Trained today · Strava" / "Trained 3 days ago · Garmin"
export function activityLabel(d: Pick<AthleteDepth, 'lastTrainedDays' | 'activitySource'>): string {
  const when =
    d.lastTrainedDays === 0
      ? 'Trained today'
      : d.lastTrainedDays === 1
        ? 'Trained yesterday'
        : `Trained ${d.lastTrainedDays} days ago`;
  return `${when} · ${SOURCE_LABEL[d.activitySource]}`;
}

export function repliesLabel(r: AthleteDepth['replies']): string {
  return r === 'fast' ? 'Usually replies within hours' : 'Usually replies within a day';
}

// Default age window around your own age — people can widen it, but the
// starting point keeps feeds age-appropriate.
export function defaultAgeRange(age: number | null): [number, number] {
  if (!age || age < 18) return [18, 60];
  return [Math.max(18, age - 8), age + 8];
}

export function inRange(age: number, [min, max]: [number, number]): boolean {
  return age >= min && age <= max;
}

// ── Chat safety ─────────────────────────────────────────────────────

const MONEY =
  /\b(send|lend|loan|borrow|transfer|pay|invest(ment)?|crypto|bitcoin|btc|usdt|forex|gift ?cards?|airtime|e-?wallet|cash ?send|paypal|western union|bank (details|account)|R ?\d{3,})\b/i;
const OFF_APP = /\b(whats ?app|telegram|signal|snap(chat)?|kik|wechat|text me on|my number is)\b/i;
const PHONE = /(\+?\d[\d\s-]{8,}\d)/;

export type ScamSignal = 'money' | 'off-app' | null;

// Incoming message check. Money beats off-app — it's the bigger risk.
export function scamSignal(text: string): ScamSignal {
  if (!text) return null;
  if (MONEY.test(text)) return 'money';
  if (OFF_APP.test(text) || PHONE.test(text)) return 'off-app';
  return null;
}

// Outgoing: sharing a number or moving to another app before you've met.
export function sharesContact(text: string): boolean {
  return OFF_APP.test(text) || PHONE.test(text);
}

// ── Budgets & expiry ────────────────────────────────────────────────

export function dayKeyOf(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function likesLeft(
  used: { day: string; count: number } | undefined,
  now: Date = new Date()
): number {
  if (!used || used.day !== dayKeyOf(now)) return LIKES_PER_DAY;
  return Math.max(0, LIKES_PER_DAY - used.count);
}

// Hours until a silent match expires; <= 0 means expired.
export function matchHoursLeft(matchedAt: string, now: Date = new Date()): number {
  const end = new Date(matchedAt).getTime() + MATCH_TTL_DAYS * 86400000;
  return Math.floor((end - now.getTime()) / 3600000);
}

export function expiryLabel(hours: number): string {
  if (hours <= 0) return 'Expired';
  if (hours < 24) return `${hours}h left`;
  return `${Math.ceil(hours / 24)}d left`;
}
