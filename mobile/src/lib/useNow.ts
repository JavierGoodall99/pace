import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

// The current time, kept fresh for screens that stay mounted (tabs).
// Ticks on the minute and refreshes whenever the app returns to the
// foreground, so the 07:00 drop, "Good morning" and per-day budgets roll
// over without a remount.
export function useNow(intervalMs = 60_000): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const tick = () => setNow(new Date());
    // Align to the next minute boundary, then tick every interval.
    let interval: ReturnType<typeof setInterval> | undefined;
    const align = setTimeout(
      () => {
        tick();
        interval = setInterval(tick, intervalMs);
      },
      intervalMs - (Date.now() % intervalMs)
    );
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') tick();
    });
    return () => {
      clearTimeout(align);
      if (interval) clearInterval(interval);
      sub.remove();
    };
  }, [intervalMs]);

  return now;
}
