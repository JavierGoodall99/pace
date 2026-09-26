import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { AvatarStack, KIND_ILLO, openInstagram, PacersGoing } from '../../src/components/Explore';
import { Icon } from '../../src/components/Icon';
import { Illo } from '../../src/components/Illustrations';
import { showPip } from '../../src/components/PipKit';
import { Badge, Button, Callout, DisplayTitle, ScreenHeader } from '../../src/components/ui';
import { communityById, CT_EVENTS, ctSpotById, nextOccurrence } from '../../src/data/capeTown';
import { formatWhen } from '../../src/data/dates';
import {
  athletesIn,
  CREW_MEMBERS,
  pacersAmong,
  toggleCrew,
  useExplore,
} from '../../src/data/explore';
import { useMe } from '../../src/data/session';
import { useSocial } from '../../src/data/social';
import { tapHaptic } from '../../src/lib/haptics';
import { useColors } from '../../src/theme/appearance';

// An established Cape Town club or crew. Pace doesn't run it — it helps
// you find it, shows who from Pace runs with them, and links out.
export default function CrewScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const me = useMe();
  const { blocked } = useSocial();
  const explore = useExplore();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [now] = useState(() => new Date());
  const crew = communityById(id);

  if (!crew) {
    return (
      <YStack flex={1} bg="$canvas">
        <ScreenHeader title="Crew" onBack={() => router.back()} />
      </YStack>
    );
  }

  const following = explore.crews.includes(crew.id);
  const members = athletesIn(CREW_MEMBERS[crew.id]).filter((a) => !blocked.includes(a.id));
  const pacers = pacersAmong(me, CREW_MEMBERS[crew.id], blocked);
  const spot = ctSpotById(crew.spotId);
  const runs = CT_EVENTS.filter((e) => e.communityId === crew.id)
    .map((e) => ({ e, at: nextOccurrence(e, now) }))
    .filter((x) => x.at);

  return (
    <YStack flex={1} bg="$canvas">
      <ScrollView flex={1} contentContainerStyle={{ pb: 24 }}>
        <ScreenHeader
          title={crew.name}
          subtitle={crew.instagram ? `@${crew.instagram}` : undefined}
          onBack={() => router.back()}
        />
        <YStack px={20} gap={16} mt={8}>
          <XStack items="center" gap={14}>
            <YStack
              width={72}
              height={72}
              rounded={36}
              bg="$accentSoft"
              items="center"
              justify="center"
            >
              <Illo name={KIND_ILLO[crew.kind]} size={48} />
            </YStack>
            <YStack flex={1} gap={6}>
              <Text fontSize={15} lineHeight={22} color="$text">
                {crew.vibe}
              </Text>
            </YStack>
          </XStack>

          <YStack p={16} gap={12} rounded={22} bg="$card" borderWidth={1} borderColor="$border">
            <Info icon="clock" text={crew.when} />
            <Info
              icon="map-pin"
              text={crew.where}
              onPress={
                spot
                  ? () => router.push({ pathname: '/spot/[id]', params: { id: spot.id } })
                  : undefined
              }
            />
            <Info icon="users" text={crew.forWho} />
          </YStack>

          {pacers.length ? (
            <YStack gap={8}>
              <DisplayTitle size={24}>{`From Pace`}</DisplayTitle>
              <PacersGoing people={pacers} verb={['runs with them', 'run with them']} />
            </YStack>
          ) : members.length ? (
            <XStack items="center" gap={10}>
              <AvatarStack people={members} />
              <Text fontSize={13} color="$muted">
                {members.length} Pace member{members.length === 1 ? '' : 's'} run with them
              </Text>
            </XStack>
          ) : null}

          {runs.length ? (
            <YStack gap={8}>
              <DisplayTitle size={24}>{`Next *runs*`}</DisplayTitle>
              {runs.map(({ e, at }) => (
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
                  <Text flex={1} fontFamily="$semibold" fontSize={15} color="$text">
                    {formatWhen(at!.toISOString(), now)}
                  </Text>
                  {explore.going.includes(e.id) ? <Badge tone="success">Going</Badge> : null}
                  <Icon name="chevron-right" size={16} />
                </XStack>
              ))}
            </YStack>
          ) : null}

          <XStack gap={10}>
            {crew.instagram ? (
              <Button
                variant="secondary"
                icon="arrow-right"
                onPress={() => openInstagram(crew.instagram!)}
                style={{ flex: 1 }}
              >
                Instagram
              </Button>
            ) : null}
            {crew.website ? (
              <Button
                variant="secondary"
                icon="arrow-right"
                onPress={() => Linking.openURL(crew.website!).catch(() => {})}
                style={{ flex: 1 }}
              >
                Website
              </Button>
            ) : null}
          </XStack>

          <Callout icon="users" title="Not affiliated with Pace">
            Check times with the club before you go.
          </Callout>
        </YStack>
      </ScrollView>

      <YStack
        px={20}
        pt={12}
        bg="$card"
        borderTopWidth={1}
        borderTopColor="$border"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <Button
          icon={following ? 'check' : 'plus'}
          variant={following ? 'secondary' : 'primary'}
          onPress={() => {
            tapHaptic();
            toggleCrew(crew.id);
            if (!following)
              showPip(`Following ${crew.name}. Their runs now show first in Explore.`, 'happy');
          }}
          style={{ width: '100%' }}
        >
          {following ? 'Following · tap to unfollow' : 'I run with this crew'}
        </Button>
      </YStack>
    </YStack>
  );
}

function Info({
  icon,
  text,
  onPress,
}: {
  icon: 'clock' | 'map-pin' | 'users';
  text: string;
  onPress?: () => void;
}) {
  const colors = useColors();
  return (
    <XStack items="center" gap={10} onPress={onPress}>
      <Icon name={icon} size={17} color={colors.muted} />
      <Text flex={1} fontSize={15} color="$text">
        {text}
      </Text>
      {onPress ? <Icon name="chevron-right" size={16} color={colors.muted} /> : null}
    </XStack>
  );
}
