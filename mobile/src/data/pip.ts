import type { Mood } from '../components/Mascot';
import { formatWhen } from './dates';
import { athleteById } from './mockData';
import { checkInOutcome, effectiveStatus, Plan } from './plans';
import { daysUntil, raceById } from './races';
import type { MeProfile } from './session';
import { upcomingEvents } from './capeTown';
import { EVENT_ATTENDEES, ExploreState, pacersAmong } from './explore';

// What Pip says around the app. Pip is Pace's voice — onboarding
// introduces it, and it keeps showing up at the moments that matter:
// your day, your wins, your next best step. Pure functions so the lines
// are easy to test and tune.

export interface PipLine {
  key: string; // stable id — lets a card be dismissed for the day
  text: string;
  mood: Mood;
  cta?: { label: string; href: string };
}

// The one thing worth saying on Today, most urgent first.
export function todayLine(
  me: MeProfile,
  plans: Plan[],
  pacersLeft: number,
  now: Date = new Date()
): PipLine {
  const first = me.name.trim().split(' ')[0] || 'there';

  const pendingCheckIn = plans.find(
    (p) => effectiveStatus(p, now) === 'done' && checkInOutcome(p) === null
  );
  if (pendingCheckIn) {
    const who = athleteById(pendingCheckIn.athleteId)?.name ?? 'them';
    return {
      key: `checkin-${pendingCheckIn.id}`,
      text: `How did it go with ${who}? Your answer stays private unless it’s mutual.`,
      mood: 'wink',
    };
  }

  const invite = plans.find((p) => p.status === 'received');
  if (invite) {
    const who = athleteById(invite.athleteId)?.name ?? 'Someone';
    return {
      key: `invite-${invite.id}`,
      text: `${who} wants to train with you! Say “I’m in” below.`,
      mood: 'excited',
    };
  }

  const next = plans
    .filter((p) => p.status === 'confirmed' && effectiveStatus(p, now) !== 'done')
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  if (next) {
    const who = athleteById(next.athleteId)?.name ?? 'your partner';
    return {
      key: `next-${next.id}`,
      text: `Next up: ${who}, ${formatWhen(next.date, now)
        .replace(' · ', ' at ')
        .replace(/^(Today|Tomorrow)/, (d) => d.toLowerCase())}. Don’t forget water!`,
      mood: 'happy',
    };
  }

  if (pacersLeft > 0) {
    return {
      key: 'pacers',
      text: `${pacersLeft} pacer${pacersLeft === 1 ? ' is' : 's are'} waiting for you today, ${first}.`,
      mood: 'excited',
      cta: { label: 'See pacers', href: '/(tabs)/discover' },
    };
  }

  return {
    key: 'quiet',
    text: 'Quiet day? Cape Town’s run crews are the easiest way to meet someone new.',
    mood: 'thinking',
    cta: { label: 'Explore Cape Town', href: '/(tabs)/sessions' },
  };
}

// The next best thing to improve on your profile.
export function profileTip(me: MeProfile, now: Date = new Date()): PipLine {
  if (!me.gender) {
    return {
      key: 'tip-basics',
      text: 'Tell me whether you’re a man or a woman so I can show you the right people.',
      mood: 'thinking',
      cta: { label: 'Edit profile', href: '/edit-profile' },
    };
  }
  if (me.photos.length > 0 && !me.photoLabels.includes('offclock')) {
    return {
      key: 'tip-offclock',
      text: 'Add an Off the clock photo. People want to see you dressed up, not just mid-rep.',
      mood: 'wink',
      cta: { label: 'Edit photos', href: '/edit-profile' },
    };
  }
  if (me.photos.length < 3) {
    return {
      key: 'tip-photos',
      text: 'Action shots get 3× more invites. Add another training photo?',
      mood: 'happy',
      cta: { label: 'Edit profile', href: '/edit-profile' },
    };
  }
  if (!me.verified) {
    return {
      key: 'tip-verify',
      text: 'Verified athletes get twice the matches. It takes 10 seconds!',
      mood: 'excited',
      cta: { label: 'Get verified', href: '/verify' },
    };
  }
  if (!me.stravaConnected && !me.garminConnected) {
    return {
      key: 'tip-sync',
      text: 'Sync Strava or Garmin. Pace hides profiles that haven’t trained in two weeks — this keeps you visible.',
      mood: 'thinking',
      cta: { label: 'Connect', href: '/connect/strava' },
    };
  }
  const race = raceById(me.goalRaceId);
  if (!race) {
    return {
      key: 'tip-race',
      text: 'Training for a race? Add it and meet people on the same start line.',
      mood: 'happy',
      cta: { label: 'Race mode', href: '/races' },
    };
  }
  const days = daysUntil(race.date, now);
  return {
    key: 'tip-race-countdown',
    text: `${days} days to ${race.name}. Find a pacer for your long runs!`,
    mood: 'excited',
    cta: { label: 'See race', href: `/race/${race.id}` },
  };
}

// "This week in Cape Town" — Pip's digest at the top of Explore.
export function weekDigest(
  me: MeProfile,
  explore: ExploreState,
  blocked: number[] = [],
  now: Date = new Date()
): PipLine {
  const week = upcomingEvents(now).filter((e) => e.at.getTime() - now.getTime() < 7 * 86400000);
  const pacers = new Set(
    week.flatMap(({ event }) =>
      pacersAmong(me, EVENT_ATTENDEES[event.id], blocked).map((a) => a.id)
    )
  );
  const crewRuns = week.filter(
    ({ event }) => event.communityId && explore.crews.includes(event.communityId)
  ).length;
  const parts = [`${week.length} things on in Cape Town this week`];
  if (crewRuns) parts.push(`${crewRuns} with your crews`);
  const text =
    pacers.size > 0
      ? `${parts.join(', ')} — and ${pacers.size} pacer${pacers.size === 1 ? '' : 's'} you might like ${pacers.size === 1 ? 'is' : 'are'} going to some of them.`
      : `${parts.join(', ')}. Pick one and say you’re going.`;
  return { key: `digest-${now.toISOString().slice(0, 10)}`, text, mood: 'excited' };
}
