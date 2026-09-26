// Small date helpers for sessions. Weeks run Monday-first to match the
// rhythm strip.

export function dayIndex(d: Date): number {
  return (d.getDay() + 6) % 7;
}

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// Calendar day in the device's time zone, "YYYY-MM-DD". Use this for any
// per-day key (like budgets, stamps, streaks): toISOString() is UTC, so in
// SAST it rolls over at 02:00 and a 01:00 action lands on yesterday.
export function localDayKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Next occurrence of a Monday-first weekday (today counts), at `time`.
export function nextDateFor(dayIdx: number, time: string, now: Date = new Date()): Date {
  const ahead = (dayIdx - dayIndex(now) + 7) % 7;
  const [h, m] = time.split(':').map(Number);
  const d = startOfDay(now);
  d.setDate(d.getDate() + ahead);
  d.setHours(h || 0, m || 0, 0, 0);
  if (d.getTime() < now.getTime()) d.setDate(d.getDate() + 7);
  return d;
}

export function daysFrom(now: Date, offset: number, time: string): Date {
  const [h, m] = time.split(':').map(Number);
  const d = startOfDay(now);
  d.setDate(d.getDate() + offset);
  d.setHours(h || 0, m || 0, 0, 0);
  return d;
}

export function weekKey(now: Date = new Date()): string {
  const monday = startOfDay(now);
  monday.setDate(monday.getDate() - dayIndex(now));
  return localDayKey(monday);
}

export const DAY = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export function formatTime(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// "Today · 06:00", "Tomorrow · 17:30", "Sat 27 Sep · 06:00"
export function formatWhen(iso: string, now: Date = new Date()): string {
  const d = new Date(iso);
  const diff = Math.round((startOfDay(d).getTime() - startOfDay(now).getTime()) / 86400000);
  const day =
    diff === 0
      ? 'Today'
      : diff === 1
        ? 'Tomorrow'
        : diff === -1
          ? 'Yesterday'
          : `${DAY[dayIndex(d)]} ${d.getDate()} ${MONTH[d.getMonth()]}`;
  return `${day} · ${formatTime(d)}`;
}

// Parses a chat plan label like "Sun · 07:00" into the next matching
// date. Falls back to tomorrow at the given time (or 07:00).
export function dateFromWhenLabel(label: string, now: Date = new Date()): Date {
  const [dayPart = '', timePart = ''] = label.split('·').map((x) => x.trim());
  const time = /^\d{1,2}:\d{2}$/.test(timePart) ? timePart : '07:00';
  const idx = DAY.findIndex((d) => dayPart.toLowerCase().startsWith(d.toLowerCase()));
  return idx >= 0 ? nextDateFor(idx, time, now) : daysFrom(now, 1, time);
}

export function shortDay(d: Date): string {
  return `${DAY[dayIndex(d)]} ${d.getDate()}`;
}

// Chat-list timestamp: "Now", "5m", "3h", "2d", then "Mon 8".
export function agoShort(iso: string, now: Date = new Date()): string {
  const mins = Math.floor((now.getTime() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'Now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return days < 7 ? `${days}d` : shortDay(new Date(iso));
}

// Pacers drop daily at 07:00. A "drop day" starts at 07:00, so at 02:00
// you're still on yesterday's drop.
export const DROP_HOUR = 7;

export function dropKey(now: Date = new Date()): string {
  const d = new Date(now.getTime() - DROP_HOUR * 3600000);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function nextDrop(now: Date = new Date()): Date {
  const d = startOfDay(now);
  d.setHours(DROP_HOUR, 0, 0, 0);
  if (d.getTime() <= now.getTime()) d.setDate(d.getDate() + 1);
  return d;
}

// "in 9h" / "in 40m" until the next drop.
export function untilLabel(target: Date, now: Date = new Date()): string {
  const mins = Math.max(1, Math.round((target.getTime() - now.getTime()) / 60000));
  if (mins < 60) return `${mins}m`;
  return `${Math.round(mins / 60)}h`;
}
