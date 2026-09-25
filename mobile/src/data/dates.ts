// Small date helpers for sessions. Weeks run Monday-first to match the
// rhythm strip.

export function dayIndex(d: Date): number {
  return (d.getDay() + 6) % 7;
}

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
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
  return monday.toISOString().slice(0, 10);
}

const DAY = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
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

export function shortDay(d: Date): string {
  return `${DAY[dayIndex(d)]} ${d.getDate()}`;
}

// Next Sunday 18:00 — when the weekly pacers drop lands.
export function nextDrop(now: Date = new Date()): Date {
  return nextDateFor(6, '18:00', now);
}
