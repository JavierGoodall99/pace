import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { KIND_ILLO, KIND_LABEL, PacersGoing } from '../../src/components/Explore';
import { Icon } from '../../src/components/Icon';
import { Illo } from '../../src/components/Illustrations';
import { showPip } from '../../src/components/PipKit';
import { Badge, Button, Callout, DisplayTitle, ScreenHeader } from '../../src/components/ui';
import {
  CHALLENGES,
  COMMUNITIES,
  CT_EVENTS,
  ctSpotById,
  nextOccurrence,
} from '../../src/data/capeTown';
import { formatWhen } from '../../src/data/dates';
import {
  challengeProgress,
  CREW_MEMBERS,
  EVENT_ATTENDEES,
  getExploreState,
  pacersAmong,
  passport,
  stampedToday,
  stampSpot,
  useExplore,
} from '../../src/data/explore';
import { useMe } from '../../src/data/session';
import { useSocial } from '../../src/data/social';
import { successHaptic } from '../../src/lib/haptics';
import { useColors } from '../../src/theme/appearance';
import { FEATURES } from '../../src/config';

// One Cape Town spot: why it's good, when to go, how to stay safe, which
// crews meet here — and a passport stamp when you've trained here.
export default function SpotScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const me = useMe();
  const { blocked, matches } = useSocial();
  const explore = useExplore();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [now] = useState(() => new Date());
  const spot = ctSpotById(id);

  if (!spot) {
    return (
      <YStack flex={1} bg="$canvas">
        <ScreenHeader title="Spot" onBack={() => router.back()} />
      </YStack>
    );
  }

  const crews = COMMUNITIES.filter((c) => c.spotId === spot.id);
  const events = CT_EVENTS.filter((e) => e.spotId === spot.id)
    .map((e) => ({ e, at: nextOccurrence(e, now) }))
    .filter((x) => x.at);
  const regulars = pacersAmong(
    me,
    [
      ...new Set([
        ...events.flatMap(({ e }) => EVENT_ATTENDEES[e.id] ?? []),
        ...crews.flatMap((c) => CREW_MEMBERS[c.id] ?? []),
      ]),
    ],
    blocked
  );
  const stamped = stampedToday(explore, spot.id, now);

  function checkIn() {
    if (!spot) return;
    const before = CHALLENGES.filter(
      (c) => explore.challenges.includes(c.id) && challengeProgress(c, explore, now) < c.goal
    );
    if (!stampSpot(spot.id, now)) return;
    successHaptic();
    const after = getExploreState();
    const finished = before.find((c) => challengeProgress(c, after, now) >= c.goal);
    const pp = passport(after);
    showPip(
      finished
        ? `Challenge complete: ${finished.title}! “${finished.badge}” is on your profile.`
        : `Stamped! ${pp.visited} of ${pp.total} Cape Town spots in your passport.`,
      'excited'
    );
  }

  return (
    <YStack flex={1} bg="$canvas">
      <ScrollView flex={1} contentContainerStyle={{ pb: 24 }}>
        <ScreenHeader
          title={spot.label ?? spot.name}
          subtitle={spot.area}
          onBack={() => router.back()}
        />
        <YStack px={20} gap={16} mt={8}>
          <XStack items="center" gap={14}>
            <YStack
              width={72}
              height={72}
              rounded={22}
              bg="$accentSoft"
              items="center"
              justify="center"
            >
              <Illo name={KIND_ILLO[spot.kind]} size={50} />
            </YStack>
            <YStack flex={1} gap={6}>
              <XStack gap={6} flexWrap="wrap">
                <Badge tone="accent">{KIND_LABEL[spot.kind]}</Badge>
                {spot.firstMeet ? (
                  <Badge tone="success" icon="shield-check">
                    Good first meet
                  </Badge>
                ) : null}
              </XStack>
              <Text fontSize={13} color="$muted">
                Best: {spot.bestTime}
              </Text>
            </YStack>
          </XStack>

          <Text fontSize={16} lineHeight={24} color="$text">
            {spot.blurb}
          </Text>

          <Callout icon="shield-check" title="Safety">
            {spot.safety}
          </Callout>

          {regulars.length ? (
            <YStack gap={8}>
              <DisplayTitle size={24}>{`Who trains *here*`}</DisplayTitle>
              <PacersGoing
                people={regulars}
                verb={['trains here', 'train here']}
                nameOnly={matches}
              />
            </YStack>
          ) : null}

          {events.length ? (
            <YStack gap={8}>
              <DisplayTitle size={24}>{`Happening *here*`}</DisplayTitle>
              {events.map(({ e, at }) => (
                <XStack
                  key={e.id}
                  p={12}
                  gap={10}
                  rounded={16}
                  bg="$card"
                  borderWidth={1}
                  borderColor="$border"
                  items="center"
                  onPress={() => router.push({ pathname: '/event/[id]', params: { id: e.id } })}
                  accessibilityRole="button"
                >
                  <Icon name="calendar" size={16} color={colors.accentText} />
                  <YStack flex={1}>
                    <Text fontFamily="$semibold" fontSize={15} color="$text">
                      {e.title}
                    </Text>
                    <Text fontSize={12} color="$muted">
                      {formatWhen(at!.toISOString(), now)}
                    </Text>
                  </YStack>
                  <Icon name="chevron-right" size={16} />
                </XStack>
              ))}
            </YStack>
          ) : null}

          {crews.length ? (
            <YStack gap={8}>
              <DisplayTitle size={24}>{`Crews that *meet here*`}</DisplayTitle>
              {crews.map((c) => (
                <XStack
                  key={c.id}
                  p={12}
                  gap={10}
                  rounded={16}
                  bg="$card"
                  borderWidth={1}
                  borderColor="$border"
                  items="center"
                  onPress={() => router.push({ pathname: '/crew/[id]', params: { id: c.id } })}
                  accessibilityRole="button"
                >
                  <Illo name="buddies" size={28} />
                  <YStack flex={1}>
                    <Text fontFamily="$semibold" fontSize={15} color="$text">
                      {c.name}
                    </Text>
                    <Text fontSize={12} color="$muted" numberOfLines={1}>
                      {c.when}
                    </Text>
                  </YStack>
                  <Icon name="chevron-right" size={16} />
                </XStack>
              ))}
            </YStack>
          ) : null}
        </YStack>
      </ScrollView>

      <XStack
        px={20}
        pt={12}
        gap={10}
        bg="$card"
        borderTopWidth={1}
        borderTopColor="$border"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        {FEATURES.passport ? (
          <Button
            variant="secondary"
            icon={stamped ? 'check' : 'map-pin'}
            disabled={stamped}
            onPress={checkIn}
            style={{ flex: 1 }}
          >
            {stamped ? 'Checked in' : 'Check in'}
          </Button>
        ) : null}
        <Button
          icon="plus"
          onPress={() => router.push({ pathname: '/session-new', params: { place: spot.name } })}
          style={{ flex: 1 }}
        >
          Host here
        </Button>
      </XStack>
    </YStack>
  );
}
