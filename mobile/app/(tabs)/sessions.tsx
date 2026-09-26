import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import {
  ChallengeCard,
  ConditionsCard,
  CrewCard,
  EventCard,
  KIND_LABEL,
  SpotCard,
} from '../../src/components/Explore';
import { Icon } from '../../src/components/Icon';
import { PipTip } from '../../src/components/PipKit';
import { PickRow, SessionCard } from '../../src/components/Sessions';
import { useTabBarSpace } from '../../src/components/TabBar';
import { Button, DisplayTitle, SegmentedControl } from '../../src/components/ui';
import { levelLabel } from '../../src/data/athleteDepth';
import {
  CHALLENGES,
  communityById,
  COMMUNITIES,
  CT_SPOTS,
  SpotKind,
  upcomingEvents,
} from '../../src/data/capeTown';
import {
  athletesIn,
  challengeProgress,
  CHALLENGE_MEMBERS,
  CREW_MEMBERS,
  EVENT_ATTENDEES,
  pacersAmong,
  passport,
  stampedToday,
  toggleChallenge,
  toggleGoing,
  useExplore,
} from '../../src/data/explore';
import { athleteById } from '../../src/data/mockData';
import { weekDigest } from '../../src/data/pip';
import { OpenSession, usePlans } from '../../src/data/plans';
import { useMe } from '../../src/data/session';
import { useSocial } from '../../src/data/social';
import { useColors } from '../../src/theme/appearance';

// Explore Cape Town. There's always something to do here, even on a
// day with no new pacers: established events and run crews, the city's
// best spots to train and meet, and monthly challenges. Pace points to
// what Cape Town already loves rather than running its own clubs.

const TABS = ['This week', 'Spots', 'Crews', 'Challenges'];
const KINDS: ('all' | SpotKind)[] = ['all', 'run', 'trail', 'ride', 'swim', 'surf', 'gym'];

export function sessionMeta(o: OpenSession): string {
  const host = o.hostId === 'me' ? 'You' : (athleteById(o.hostId)?.name ?? 'Someone');
  const left = Math.max(0, o.spots - o.joined.length);
  if (o.singles && o.balance) {
    return `Hosted by ${host} · Singles · ${o.balance.women} women + ${o.balance.men} men · ${left} spots left · ${o.distance}`;
  }
  const size =
    o.spots > 1
      ? `Group · ${left} of ${o.spots} spots left`
      : left
        ? '1-on-1 · open'
        : '1-on-1 · taken';
  return `Hosted by ${host} · ${size} · ${o.distance} · ${levelLabel(o.level)}`;
}

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const tabBarSpace = useTabBarSpace();
  const router = useRouter();
  const colors = useColors();
  const me = useMe();
  const { blocked } = useSocial();
  const { open } = usePlans();
  const explore = useExplore();
  const [tab, setTab] = useState(TABS[0]);
  const [kind, setKind] = useState<'all' | SpotKind>('all');
  const [now] = useState(() => new Date());

  const events = useMemo(
    () => upcomingEvents(now).filter((e) => e.at.getTime() - now.getTime() < 200 * 86400000),
    [now]
  );
  // Your crews' runs first, then everything else by time.
  const mine = (e: (typeof events)[number]) =>
    e.event.communityId && explore.crews.includes(e.event.communityId) ? 0 : 1;
  const thisWeek = events
    .filter((e) => e.at.getTime() - now.getTime() < 7 * 86400000)
    .sort((a, b) => mine(a) - mine(b));
  const later = events.filter((e) => e.at.getTime() - now.getTime() >= 7 * 86400000);

  const memberSessions = useMemo(
    () =>
      open
        .filter((o) => new Date(o.date).getTime() > now.getTime() - 3600000)
        .filter((o) => o.hostId === 'me' || !blocked.includes(o.hostId as number))
        .filter((o) => o.city === 'Cape Town')
        .sort((a, b) => a.date.localeCompare(b.date)),
    [open, blocked, now]
  );

  const spots = CT_SPOTS.filter((s) => kind === 'all' || s.kind === kind);
  const crewsAt = (spotId: string) => COMMUNITIES.filter((c) => c.spotId === spotId).length;
  const pp = passport(explore);
  const digest = weekDigest(me, explore, blocked, now);

  const renderEvent = ({ event, at }: (typeof events)[number]) => {
    const ids = [...(EVENT_ATTENDEES[event.id] ?? [])];
    const going = explore.going.includes(event.id);
    return (
      <EventCard
        key={event.id}
        event={event}
        at={at}
        hostName={communityById(event.communityId)?.name}
        goingCount={ids.length + (going ? 1 : 0)}
        pacers={pacersAmong(me, ids, blocked)}
        going={going}
        onPress={() => router.push({ pathname: '/event/[id]', params: { id: event.id } })}
        onToggle={() => toggleGoing(event.id)}
      />
    );
  };

  return (
    <ScrollView
      flex={1}
      bg="$canvas"
      contentContainerStyle={{ pt: insets.top + 8, pb: tabBarSpace + 16 }}
    >
      <YStack px={20} gap={4}>
        <DisplayTitle size={42}>Explore *Cape Town*</DisplayTitle>
        <Text fontSize={15} lineHeight={22} color="$muted">
          Run crews, events and the best spots to train — and who from Pace is going.
        </Text>
      </YStack>

      <YStack px={20} mt={16} gap={14}>
        <SegmentedControl options={TABS} value={tab} onChange={setTab} />

        {tab === 'This week' ? (
          <>
            <ConditionsCard compact />
            <PipTip line={digest} />
            <Text fontFamily="$semibold" fontSize={17} color="$text" mt={4}>
              This week
            </Text>
            {thisWeek.map(renderEvent)}
            {later.length ? (
              <Text fontFamily="$semibold" fontSize={17} color="$text" mt={8}>
                Coming up
              </Text>
            ) : null}
            {later.map(renderEvent)}

            <XStack items="center" justify="space-between" mt={8}>
              <Text fontFamily="$semibold" fontSize={17} color="$text">
                Sessions from Pace members
              </Text>
            </XStack>
            <Button
              icon="plus"
              variant="secondary"
              onPress={() => router.push('/session-new')}
              style={{ width: '100%' }}
            >
              Host a session
            </Button>
            {memberSessions.map((o) => (
              <SessionCard
                key={o.id}
                title={o.title}
                activity={o.activity}
                date={o.date}
                place={o.place}
                athleteId={o.hostId === 'me' ? undefined : o.hostId}
                meta={sessionMeta(o)}
                onPress={() => router.push({ pathname: '/session/[id]', params: { id: o.id } })}
              >
                {o.joined.includes('me') || o.hostId === 'me' ? (
                  <XStack items="center" gap={6}>
                    <YStack width={8} height={8} rounded={4} bg="$success" />
                    <Text fontFamily="$semibold" fontSize={13} color="$success">
                      {o.hostId === 'me' ? 'You’re hosting' : 'You’re going'}
                    </Text>
                  </XStack>
                ) : null}
              </SessionCard>
            ))}
          </>
        ) : null}

        {tab === 'Spots' ? (
          <>
            <PickRow
              options={KINDS}
              value={kind}
              onChange={setKind}
              render={(k) => (k === 'all' ? 'All' : KIND_LABEL[k])}
            />
            <Text fontSize={13} color="$muted">
              Tap a spot to see who trains there, check in for your Pace passport or post a session.
            </Text>
            {spots.map((s) => (
              <SpotCard
                key={s.id}
                spot={s}
                crews={crewsAt(s.id)}
                stamped={stampedToday(explore, s.id, now)}
                onPress={() => router.push({ pathname: '/spot/[id]', params: { id: s.id } })}
              />
            ))}
          </>
        ) : null}

        {tab === 'Crews' ? (
          <>
            <Text fontSize={13} lineHeight={19} color="$muted">
              Cape Town’s established clubs and crews. Follow the ones you run with — we’ll show you
              who from Pace runs with them too.
            </Text>
            {COMMUNITIES.map((c) => (
              <CrewCard
                key={c.id}
                crew={c}
                members={athletesIn(CREW_MEMBERS[c.id])}
                pacers={pacersAmong(me, CREW_MEMBERS[c.id], blocked)}
                following={explore.crews.includes(c.id)}
                onPress={() => router.push({ pathname: '/crew/[id]', params: { id: c.id } })}
              />
            ))}
            <XStack gap={8} p={12} rounded={16} bg="$surface" items="flex-start">
              <Icon name="users" size={16} color={colors.muted} />
              <Text flex={1} fontSize={12} lineHeight={17} color="$muted">
                Listings come from each club’s public pages and aren’t affiliated with Pace. Run a
                club? Get in touch to claim or update your page.
              </Text>
            </XStack>
          </>
        ) : null}

        {tab === 'Challenges' ? (
          <>
            <YStack
              p={16}
              gap={10}
              rounded={22}
              bg="$accentSoft"
              borderWidth={1}
              borderColor="$accentBorder"
            >
              <XStack items="center" justify="space-between">
                <Text fontFamily="$bold" fontSize={17} color="$text">
                  Your Pace passport
                </Text>
                <Text fontFamily="$bold" fontSize={17} color="$accentText">
                  {pp.visited}/{pp.total}
                </Text>
              </XStack>
              <Text fontSize={13} lineHeight={18} color="$muted">
                Check in at a spot after you train there to collect a stamp. Stamps count toward
                challenges and show on your profile.
              </Text>
              <Button
                variant="secondary"
                icon="map-pin"
                onPress={() => setTab('Spots')}
                style={{ width: '100%' }}
              >
                Find a spot
              </Button>
            </YStack>
            {CHALLENGES.map((c) => (
              <ChallengeCard
                key={c.id}
                challenge={c}
                progress={challengeProgress(c, explore, now)}
                joined={explore.challenges.includes(c.id)}
                others={athletesIn(CHALLENGE_MEMBERS[c.id])}
                onToggle={() => toggleChallenge(c.id)}
              />
            ))}
          </>
        ) : null}
      </YStack>
    </ScrollView>
  );
}
