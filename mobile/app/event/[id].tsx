import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { AvatarStack, openInstagram } from '../../src/components/Explore';
import { Icon } from '../../src/components/Icon';
import { Illo } from '../../src/components/Illustrations';
import { PhotoSlot } from '../../src/components/PhotoSlot';
import { showPip } from '../../src/components/PipKit';
import { Badge, Button, Callout, DisplayTitle, ScreenHeader } from '../../src/components/ui';
import { communityById, ctSpotById, eventById, nextOccurrence } from '../../src/data/capeTown';
import { formatWhen } from '../../src/data/dates';
import {
  athletesIn,
  EVENT_ATTENDEES,
  pacersAmong,
  toggleGoing,
  useExplore,
} from '../../src/data/explore';
import { SPORT_ILLO } from '../../src/data/mockData';
import { ATHLETE_PHOTOS } from '../../src/data/photos';
import { useMe } from '../../src/data/session';
import { useSocial } from '../../src/data/social';
import { successHaptic } from '../../src/lib/haptics';
import { useColors } from '../../src/theme/appearance';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function EventScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const me = useMe();
  const { blocked, matches } = useSocial();
  const explore = useExplore();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [now] = useState(() => new Date());
  const event = eventById(id);

  if (!event) {
    return (
      <YStack flex={1} bg="$canvas">
        <ScreenHeader title="Event" onBack={() => router.back()} />
        <Text color="$muted" text="center" mt={40}>
          This event isn’t listed any more.
        </Text>
      </YStack>
    );
  }

  const at = nextOccurrence(event, now);
  const crew = communityById(event.communityId);
  const spot = ctSpotById(event.spotId);
  const going = explore.going.includes(event.id);
  const attendees = athletesIn(EVENT_ATTENDEES[event.id]).filter((a) => !blocked.includes(a.id));
  const pacers = pacersAmong(me, EVENT_ATTENDEES[event.id], blocked);
  const when = event.weekly
    ? `Every ${DAYS[event.weekly.day]} · ${event.weekly.time}`
    : new Date(`${event.date}T00:00:00`).toLocaleDateString('en-ZA', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }) +
      (event.endDate
        ? ` – ${new Date(`${event.endDate}T00:00:00`).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long' })}`
        : '');

  return (
    <YStack flex={1} bg="$canvas">
      <ScrollView flex={1} contentContainerStyle={{ pb: 24 }}>
        <ScreenHeader title={event.title} onBack={() => router.back()} />
        <YStack px={20} gap={16} mt={8}>
          <XStack gap={8} flexWrap="wrap">
            <Badge tone="accent" illo={SPORT_ILLO[event.sport]}>
              {event.sport}
            </Badge>
            <Badge>{event.price}</Badge>
            {crew ? <Badge>{crew.name}</Badge> : null}
          </XStack>

          <YStack p={16} gap={12} rounded={22} bg="$card" borderWidth={1} borderColor="$border">
            <Row icon="calendar" text={when} />
            {event.weekly && at ? (
              <Row icon="clock" text={`Next: ${formatWhen(at.toISOString(), now)}`} />
            ) : null}
            <Row
              icon="map-pin"
              text={event.where}
              onPress={
                spot
                  ? () => router.push({ pathname: '/spot/[id]', params: { id: spot.id } })
                  : undefined
              }
            />
          </YStack>

          <Text fontSize={16} lineHeight={24} color="$text">
            {event.detail}
          </Text>

          {pacers.length ? (
            <YStack gap={10}>
              <DisplayTitle size={26}>{`Pacers you might *like*`}</DisplayTitle>
              <Text fontSize={14} color="$muted">
                Going too. Say you’re going and they’ll see you on the list. Matched with one?
                Invite them to warm up together.
              </Text>
              {pacers.map((a) => (
                <XStack
                  key={a.id}
                  items="center"
                  gap={12}
                  p={10}
                  rounded={18}
                  bg="$card"
                  borderWidth={1}
                  borderColor="$border"
                >
                  <XStack
                    flex={1}
                    items="center"
                    gap={12}
                    onPress={() =>
                      router.push({ pathname: '/athlete/[id]', params: { id: String(a.id) } })
                    }
                  >
                    <PhotoSlot
                      label={a.name}
                      shape="circle"
                      source={ATHLETE_PHOTOS[a.slotId]}
                      style={{ width: 48, height: 48 }}
                    />
                    <Text fontFamily="$semibold" fontSize={15} color="$text">
                      {a.name}, {a.age}
                    </Text>
                  </XStack>
                  {matches.includes(a.id) ? (
                    <XStack
                      accessibilityRole="button"
                      aria-label={`Invite ${a.name}`}
                      onPress={() =>
                        router.push({
                          pathname: '/invite/[athleteId]',
                          params: {
                            athleteId: String(a.id),
                            date: at?.toISOString(),
                            place: spot?.name ?? event.where,
                            activity: event.sport,
                          },
                        })
                      }
                      height={34}
                      px={12}
                      gap={6}
                      rounded="$full"
                      items="center"
                      bg="$accentSoft"
                    >
                      <Icon name="send" size={13} color={colors.accentText} />
                      <Text fontFamily="$semibold" fontSize={13} color="$accentText">
                        Go together
                      </Text>
                    </XStack>
                  ) : (
                    <XStack
                      accessibilityRole="button"
                      aria-label={`View ${a.name}`}
                      onPress={() =>
                        router.push({ pathname: '/athlete/[id]', params: { id: String(a.id) } })
                      }
                      height={34}
                      px={12}
                      gap={6}
                      rounded="$full"
                      items="center"
                      bg="$surface"
                    >
                      <Icon name="heart" size={13} color={colors.text} />
                      <Text fontFamily="$semibold" fontSize={13} color="$text">
                        View
                      </Text>
                    </XStack>
                  )}
                </XStack>
              ))}
            </YStack>
          ) : null}

          {attendees.length ? (
            <XStack items="center" gap={10}>
              <AvatarStack people={attendees} />
              <Text fontSize={13} color="$muted">
                {attendees.length + (going ? 1 : 0)} from Pace going
              </Text>
            </XStack>
          ) : null}

          {crew ? (
            <XStack
              p={14}
              gap={12}
              rounded={20}
              bg="$card"
              borderWidth={1}
              borderColor="$border"
              items="center"
              onPress={() => router.push({ pathname: '/crew/[id]', params: { id: crew.id } })}
              accessibilityRole="button"
            >
              <Illo name="buddies" size={36} />
              <YStack flex={1}>
                <Text fontFamily="$semibold" fontSize={15} color="$text">
                  Hosted by {crew.name}
                </Text>
                <Text fontSize={13} color="$muted">
                  {crew.instagram ? `@${crew.instagram} · ` : ''}check for last-minute changes
                </Text>
              </YStack>
              <Icon name="chevron-right" size={18} />
            </XStack>
          ) : null}

          {crew?.instagram ? (
            <Button
              variant="ghost"
              icon="arrow-right"
              onPress={() => openInstagram(crew.instagram!)}
              style={{ width: '100%' }}
            >
              Open on Instagram
            </Button>
          ) : null}
          {event.raceId ? (
            <Button
              variant="ghost"
              icon="users"
              onPress={() => router.push({ pathname: '/race/[id]', params: { id: event.raceId! } })}
              style={{ width: '100%' }}
            >
              Race mode: who’s training for it
            </Button>
          ) : null}

          <Callout icon="shield-check" title="Not a Pace event">
            Check details with the organiser before you go.
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
          icon={going ? 'check' : 'plus'}
          variant={going ? 'secondary' : 'primary'}
          onPress={() => {
            toggleGoing(event.id);
            if (!going) {
              successHaptic();
              showPip(
                pacers.length
                  ? `You’re on the list! ${pacers.length} pacer${pacers.length === 1 ? '' : 's'} you might like will see you’re going.`
                  : 'You’re on the list! Pace members going will see you there.',
                'excited'
              );
            }
          }}
          style={{ width: '100%' }}
        >
          {going ? 'You’re going · tap to undo' : 'I’m going'}
        </Button>
      </YStack>
    </YStack>
  );
}

function Row({
  icon,
  text,
  onPress,
}: {
  icon: 'calendar' | 'clock' | 'map-pin';
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
