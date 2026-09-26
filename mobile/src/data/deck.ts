import { useEffect, useMemo } from 'react';
import { depthFor } from './athleteDepth';
import { dropKey } from './dates';
import { useChat } from './chat';
import { ageWindow, DiscoverFilterState, useFilters } from './filters';
import { ATHLETES } from './mockData';
import { Pacer, pacerDeck } from './pacers';
import { choosePicks, savePicks, usePicksState } from './picks';
import { picksPerDay, useIsPro } from './pro';
import { distanceTo } from './places';
import { activeCity, MeProfile, useMe } from './session';
import { recentlyPassed, useSocial } from './social';

// Who's left in today's picks. Shared by the Pacers tab and Today so
// they always agree on the count.

// Outside your Discover filters (age, radius, availability).
export function filteredOut(
  me: MeProfile,
  filters: DiscoverFilterState,
  now: Date = new Date()
): number[] {
  const [ageMin, ageMax] = ageWindow(filters, me.age);
  const here = activeCity(me);
  return ATHLETES.filter((a) => {
    const d = depthFor(a);
    return (
      a.age < ageMin ||
      a.age > ageMax ||
      (filters.times.length > 0 && !d.times.some((t) => filters.times.includes(t))) ||
      (filters.radiusKm != null && distanceTo(here, a.city, d.nearKm) > filters.radiusKm)
    );
  }).map((a) => a.id);
}

export function usePacerDeck(now: Date): {
  deck: Pacer[];
  passedCount: number;
  // Everyone who'd qualify today, picked or not: 0 means nobody nearby.
  poolSize: number;
} {
  const me = useMe();
  const filters = useFilters();
  const social = useSocial();
  const chat = useChat();
  const picks = usePicksState();
  const perDay = picksPerDay(useIsPro());
  const day = now.toDateString();
  const today = dropKey(now);

  const ranked = useMemo(() => {
    const passed = recentlyPassed(social, now);
    const excluded = [
      ...social.blocked,
      ...social.matches,
      ...chat.sentLikes,
      ...passed,
      ...filteredOut(me, filters, now),
    ];
    return { deck: pacerDeck(me, excluded, now), passedCount: passed.length };
    // Recompute per day, not per minute tick.
  }, [me, filters, social, chat.sentLikes, day]); // eslint-disable-line react-hooks/exhaustive-deps

  // Today's picks, chosen once per drop from the ranked deck (see picks.ts).
  const ids = picks.ready
    ? choosePicks(
        ranked.deck.map((p) => p.athlete.id),
        picks,
        today,
        perDay
      )
    : [];
  useEffect(() => {
    if (picks.ready && (picks.day !== today || picks.size < perDay)) {
      savePicks(today, ids, perDay);
    }
  }, [picks.ready, picks.day, picks.size, today, perDay]); // eslint-disable-line react-hooks/exhaustive-deps

  const idsKey = ids.join();
  return useMemo(
    () => ({
      deck: ranked.deck.filter((p) => ids.includes(p.athlete.id)),
      passedCount: ranked.passedCount,
      poolSize: ranked.deck.length,
    }),
    [ranked, idsKey] // eslint-disable-line react-hooks/exhaustive-deps
  );
}
