import React from 'react';
import { Image, Linking } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';
import { Icon } from './Icon';
import { Illo, IlloName } from './Illustrations';
import { Badge, ProgressBar } from './ui';
import {
  Challenge,
  Community,
  conditions,
  conditionsTip,
  CtEvent,
  CtSpot,
  SpotKind,
} from '../data/capeTown';
import { formatWhen } from '../data/dates';
import type { Athlete } from '../data/mockData';
import { SPORT_ILLO } from '../data/mockData';
import { ATHLETE_PHOTOS } from '../data/photos';
import { tapHaptic } from '../lib/haptics';
import { useColors } from '../theme/appearance';

export const KIND_ILLO: Record<SpotKind, IlloName> = {
  run: 'run',
  trail: 'trail',
  ride: 'cycle',
  swim: 'swim',
  surf: 'swim',
  gym: 'climb',
};

export const KIND_LABEL: Record<SpotKind, string> = {
  run: 'Run',
  trail: 'Trail',
  ride: 'Ride',
  swim: 'Swim',
  surf: 'Surf',
  gym: 'Indoor',
};

export function openInstagram(handle: string) {
  Linking.openURL(`https://www.instagram.com/${handle}/`).catch(() => {});
}

// Overlapping face pile.
export function AvatarStack({ people, size = 28 }: { people: Athlete[]; size?: number }) {
  if (!people.length) return null;
  return (
    <XStack>
      {people.slice(0, 4).map((a, i) => (
        <YStack
          key={a.id}
          ml={i ? -size * 0.3 : 0}
          rounded={size}
          borderWidth={2}
          borderColor="$card"
          overflow="hidden"
        >
          <Image source={ATHLETE_PHOTOS[a.slotId]} style={{ width: size, height: size }} />
        </YStack>
      ))}
    </XStack>
  );
}

// The line that turns browsing into dating.
export function PacersGoing({
  people,
  verb = ['is going', 'are going'],
}: {
  people: Athlete[];
  // [singular, plural]
  verb?: [string, string];
}) {
  const c = useColors();
  if (!people.length) return null;
  const names = people.slice(0, 2).map((a) => a.name);
  const more = people.length - names.length;
  return (
    <XStack items="center" gap={8}>
      <AvatarStack people={people} size={24} />
      <Icon name="heart" size={13} color={c.accentText} filled />
      <Text flex={1} fontFamily="$semibold" fontSize={13} color="$accentText" numberOfLines={1}>
        {names.join(' & ')}
        {more > 0 ? ` +${more}` : ''} {people.length === 1 ? verb[0] : verb[1]}
      </Text>
    </XStack>
  );
}

// ── Conditions board ────────────────────────────────────────────────

export function ConditionsCard({ compact = false }: { compact?: boolean }) {
  const c = useColors();
  const k = conditions(new Date());
  const cell = (label: string, value: string) => (
    <YStack flex={1} items="center" gap={2}>
      <Text fontFamily="$bold" fontSize={16} color="$text">
        {value}
      </Text>
      <Text fontSize={11} color="$muted">
        {label}
      </Text>
    </YStack>
  );
  return (
    <YStack p={14} gap={12} rounded={22} bg="$card" borderWidth={1} borderColor="$border">
      <XStack items="center" justify="space-between">
        <XStack items="center" gap={8}>
          <Illo name="sunrise" size={26} />
          <Text fontFamily="$semibold" fontSize={15} color="$text">
            Cape Town today
          </Text>
        </XStack>
        <Text fontSize={11} color="$muted">
          Wind & swell: demo data
        </Text>
      </XStack>
      <XStack>
        {cell('Sunrise', k.sunrise)}
        {cell('Sunset', k.sunset)}
        {cell(`Wind ${k.windDir}`, `${k.windKmh} km/h`)}
        {cell('Swell', `${k.swellM} m`)}
        {compact ? null : cell('Sea', `${k.waterC}°C`)}
      </XStack>
      <XStack items="flex-start" gap={8} p={10} rounded={14} bg="$surface">
        <Icon name="sparkles" size={14} color={c.accentText} />
        <Text flex={1} fontSize={13} lineHeight={18} color="$text">
          {conditionsTip(k)}
        </Text>
      </XStack>
    </YStack>
  );
}

// ── Cards ───────────────────────────────────────────────────────────

const EVENT_BADGE: Record<CtEvent['kind'], string> = {
  race: 'Race',
  parkrun: 'parkrun',
  club: 'Club run',
};

export function EventCard({
  event,
  at,
  hostName,
  goingCount,
  pacers,
  going,
  onPress,
  onToggle,
}: {
  event: CtEvent;
  at: Date;
  hostName?: string;
  goingCount: number;
  pacers: Athlete[];
  going: boolean;
  onPress: () => void;
  onToggle: () => void;
}) {
  const c = useColors();
  const when = event.weekly
    ? formatWhen(at.toISOString())
    : at.toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' }) +
      (event.endDate ? ' · race weekend' : '');
  return (
    <YStack
      onPress={onPress}
      accessibilityRole="button"
      p={14}
      gap={10}
      rounded={22}
      bg="$card"
      borderWidth={1}
      borderColor="$border"
    >
      <XStack gap={12} items="center">
        <YStack width={52} height={52} rounded={16} bg="$surface" items="center" justify="center">
          <Illo name={SPORT_ILLO[event.sport]} size={36} />
        </YStack>
        <YStack flex={1} minW={0}>
          <Text fontFamily="$semibold" fontSize={13} color="$accentText">
            {when}
          </Text>
          <Text fontFamily="$bold" fontSize={16} color="$text" numberOfLines={1}>
            {event.title}
          </Text>
          <Text fontSize={13} color="$muted" numberOfLines={1}>
            {hostName && !event.title.includes(hostName) ? `${hostName} · ` : ''}
            {event.where}
          </Text>
        </YStack>
      </XStack>
      <PacersGoing people={pacers} />
      <XStack items="center" justify="space-between">
        <XStack gap={6} items="center">
          <Badge>{EVENT_BADGE[event.kind]}</Badge>
          <Text fontSize={12} color="$muted">
            {goingCount} from Pace going
          </Text>
        </XStack>
        <XStack
          accessibilityRole="button"
          aria-label={going ? 'Not going' : 'I’m going'}
          onPress={(e) => {
            e.stopPropagation();
            tapHaptic();
            onToggle();
          }}
          height={34}
          px={14}
          gap={6}
          rounded="$full"
          items="center"
          bg={going ? '$accent' : '$accentSoft'}
        >
          <Icon
            name={going ? 'check' : 'plus'}
            size={14}
            color={going ? c.onAccent : c.accentText}
            strokeWidth={2.6}
          />
          <Text fontFamily="$semibold" fontSize={13} color={going ? '$onAccent' : '$accentText'}>
            {going ? 'Going' : 'I’m going'}
          </Text>
        </XStack>
      </XStack>
    </YStack>
  );
}

export function SpotCard({
  spot,
  crews,
  stamped,
  onPress,
}: {
  spot: CtSpot;
  crews: number;
  stamped: boolean;
  onPress: () => void;
}) {
  const c = useColors();
  return (
    <XStack
      onPress={onPress}
      accessibilityRole="button"
      gap={12}
      p={14}
      rounded={22}
      bg="$card"
      borderWidth={1}
      borderColor="$border"
      items="center"
    >
      <YStack width={52} height={52} rounded={16} bg="$surface" items="center" justify="center">
        <Illo name={KIND_ILLO[spot.kind]} size={36} />
      </YStack>
      <YStack flex={1} minW={0} gap={2}>
        <XStack items="center" gap={6}>
          <Text flex={1} fontFamily="$bold" fontSize={16} color="$text" numberOfLines={1}>
            {spot.label ?? spot.name}
          </Text>
          {stamped ? <Icon name="check" size={16} color={c.success} strokeWidth={2.8} /> : null}
        </XStack>
        <Text fontSize={13} color="$muted" numberOfLines={2}>
          {spot.blurb}
        </Text>
        <XStack gap={6} mt={4} flexWrap="wrap">
          <Badge>{`${KIND_LABEL[spot.kind]} · ${spot.area}`}</Badge>
          {spot.firstMeet ? (
            <Badge tone="success" icon="shield-check">
              Good first meet
            </Badge>
          ) : null}
          {crews ? <Badge tone="accent">{`${crews} crew${crews === 1 ? '' : 's'}`}</Badge> : null}
        </XStack>
      </YStack>
    </XStack>
  );
}

export function CrewCard({
  crew,
  members,
  pacers,
  following,
  onPress,
}: {
  crew: Community;
  members: Athlete[];
  pacers: Athlete[];
  following: boolean;
  onPress: () => void;
}) {
  return (
    <YStack
      onPress={onPress}
      accessibilityRole="button"
      p={14}
      gap={10}
      rounded={22}
      bg="$card"
      borderWidth={1}
      borderColor="$border"
    >
      <XStack gap={12} items="center">
        <YStack
          width={52}
          height={52}
          rounded={26}
          bg="$accentSoft"
          items="center"
          justify="center"
        >
          <Illo name={KIND_ILLO[crew.kind]} size={34} />
        </YStack>
        <YStack flex={1} minW={0}>
          <Text fontFamily="$bold" fontSize={16} color="$text" numberOfLines={1}>
            {crew.name}
          </Text>
          <Text fontSize={13} color="$muted" numberOfLines={1}>
            {crew.instagram ? `@${crew.instagram}` : crew.where}
          </Text>
        </YStack>
        {following ? (
          <Badge tone="success" icon="check">
            Following
          </Badge>
        ) : null}
      </XStack>
      <Text fontSize={14} lineHeight={20} color="$text">
        {crew.vibe}
      </Text>
      <XStack items="center" gap={6}>
        <Icon name="clock" size={14} />
        <Text flex={1} fontSize={13} color="$muted" numberOfLines={1}>
          {crew.when}
        </Text>
      </XStack>
      {pacers.length ? (
        <PacersGoing people={pacers} verb={['is in this crew', 'are in this crew']} />
      ) : members.length ? (
        <XStack items="center" gap={8}>
          <AvatarStack people={members} size={22} />
          <Text fontSize={12} color="$muted">
            {members.length} Pace member{members.length === 1 ? '' : 's'} run with them
          </Text>
        </XStack>
      ) : null}
    </YStack>
  );
}

export function ChallengeCard({
  challenge,
  progress,
  joined,
  others,
  onToggle,
}: {
  challenge: Challenge;
  progress: number;
  joined: boolean;
  others: Athlete[];
  onToggle: () => void;
}) {
  const done = progress >= challenge.goal;
  return (
    <YStack
      p={14}
      gap={10}
      rounded={22}
      bg={done ? '$accentSoft' : '$card'}
      borderWidth={1}
      borderColor={done ? '$accentBorder' : '$border'}
    >
      <XStack items="center" gap={12}>
        <YStack
          width={48}
          height={48}
          rounded={24}
          bg={done ? '$card' : '$surface'}
          items="center"
          justify="center"
        >
          <Illo name={done ? 'medal' : 'flag'} size={32} />
        </YStack>
        <YStack flex={1}>
          <Text fontFamily="$bold" fontSize={16} color="$text">
            {challenge.title}
          </Text>
          <Text fontSize={13} color="$muted">
            {challenge.detail}
          </Text>
        </YStack>
      </XStack>
      {joined ? (
        <YStack gap={6}>
          <ProgressBar pct={(progress / challenge.goal) * 100} />
          <Text fontFamily="$semibold" fontSize={12} color={done ? '$accentText' : '$muted'}>
            {done
              ? `Done! “${challenge.badge}” badge unlocked`
              : `${progress} of ${challenge.goal} this month · stamp spots to count`}
          </Text>
        </YStack>
      ) : null}
      <XStack items="center" justify="space-between">
        {others.length ? (
          <XStack items="center" gap={8}>
            <AvatarStack people={others} size={22} />
            <Text fontSize={12} color="$muted">
              {others.length} doing it
            </Text>
          </XStack>
        ) : (
          <YStack />
        )}
        <XStack
          accessibilityRole="button"
          aria-label={joined ? `Leave ${challenge.title}` : `Join ${challenge.title}`}
          onPress={() => {
            tapHaptic();
            onToggle();
          }}
          height={34}
          px={14}
          rounded="$full"
          items="center"
          bg={joined ? '$surface' : '$accent'}
        >
          <Text fontFamily="$semibold" fontSize={13} color={joined ? '$text' : '$onAccent'}>
            {joined ? 'Leave' : 'Join'}
          </Text>
        </XStack>
      </XStack>
    </YStack>
  );
}
