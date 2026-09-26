import { useMemo } from 'react';
import { depthFor } from './athleteDepth';
import { useChat } from './chat';
import { ageWindow, DiscoverFilterState, useFilters } from './filters';
import { ATHLETES } from './mockData';
import { Pacer, pacerDeck } from './pacers';
import { distanceTo } from './places';
import { activeCity, MeProfile, useMe } from './session';
import { recentlyPassed, useSocial } from './social';

// Who's left in your swipe deck. Shared by the Pacers tab and Today so
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

export function usePacerDeck(now: Date): { deck: Pacer[]; passedCount: number } {
  const me = useMe();
  const filters = useFilters();
  const social = useSocial();
  const chat = useChat();
  const day = now.toDateString();

  return useMemo(() => {
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
}
