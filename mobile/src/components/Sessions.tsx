import React from 'react';
import { Share } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';
import { Icon } from './Icon';
import { PhotoSlot } from './PhotoSlot';
import { Badge, Toggle } from './ui';
import { athleteById, Discipline, SPORT_EMOJI } from '../data/mockData';
import { ATHLETE_PHOTOS } from '../data/photos';
import { formatWhen } from '../data/dates';
import { CheckIn, checkInOutcome, Plan, PlanStatus } from '../data/plans';
import { SPOTS } from '../data/places';
import { tapHaptic } from '../lib/haptics';
import { useColors } from '../theme/appearance';
import { formatLabel } from '../theme/tokens';

// Session UI shared by Today, Sessions, the invite composer and profiles.

export function isPublicSpot(place: string): boolean {
  return SPOTS.some((s) => s.name === place);
}

const STATUS_BADGE: Record<PlanStatus, { label: string; tone: 'neutral' | 'accent' | 'success' }> =
  {
    sent: { label: 'Invite sent', tone: 'neutral' },
    received: { label: 'Invite for you', tone: 'accent' },
    confirmed: { label: 'Confirmed', tone: 'success' },
    declined: { label: 'Declined', tone: 'neutral' },
    done: { label: 'Done', tone: 'neutral' },
  };

export function SessionCard({
  title,
  activity,
  date,
  place,
  athleteId,
  status,
  meta,
  onPress,
  children,
}: {
  title: string;
  activity: Discipline;
  date: string;
  place: string;
  athleteId?: number;
  status?: PlanStatus;
  meta?: string;
  onPress?: () => void;
  children?: React.ReactNode;
}) {
  const c = useColors();
  const a = athleteId != null ? athleteById(athleteId) : undefined;
  return (
    <YStack
      onPress={onPress}
      pressStyle={onPress ? { opacity: 0.85 } : undefined}
      p={14}
      gap={12}
      rounded={22}
      bg="$card"
      borderWidth={1}
      borderColor="$border"
    >
      <XStack gap={12} items="center">
        <YStack>
          {a ? (
            <PhotoSlot
              label={a.name}
              shape="circle"
              source={ATHLETE_PHOTOS[a.slotId]}
              style={{ width: 48, height: 48 }}
            />
          ) : (
            <XStack
              width={48}
              height={48}
              rounded={24}
              bg="$accentSoft"
              items="center"
              justify="center"
            >
              <Text fontSize={22}>{SPORT_EMOJI[activity]}</Text>
            </XStack>
          )}
          {a ? (
            <XStack
              position="absolute"
              r={-4}
              b={-4}
              width={22}
              height={22}
              rounded={11}
              bg="$card"
              items="center"
              justify="center"
            >
              <Text fontSize={12}>{SPORT_EMOJI[activity]}</Text>
            </XStack>
          ) : null}
        </YStack>
        <YStack flex={1} minW={0}>
          <Text fontFamily="$semibold" fontSize={16} color="$text" numberOfLines={1}>
            {title}
          </Text>
          <XStack items="center" gap={5} mt={3}>
            <Icon name="clock" size={13} color={c.muted} />
            <Text fontSize={13} color="$muted">
              {formatWhen(date)}
            </Text>
          </XStack>
        </YStack>
      </XStack>
      <XStack items="center" gap={6}>
        <Icon name="map-pin" size={14} color={c.muted} />
        <Text flex={1} fontSize={14} color="$text" numberOfLines={1}>
          {place}
        </Text>
        {isPublicSpot(place) ? (
          <Badge tone="success" icon="shield-check">
            Public spot
          </Badge>
        ) : null}
      </XStack>
      {meta || status ? (
        <XStack items="center" gap={8} flexWrap="wrap">
          {status ? (
            <Badge tone={STATUS_BADGE[status].tone}>{STATUS_BADGE[status].label}</Badge>
          ) : null}
          {meta ? (
            <Text flex={1} fontSize={13} color="$muted">
              {meta}
            </Text>
          ) : null}
        </XStack>
      ) : null}
      {children}
    </YStack>
  );
}

// Safety by design, on every session: share the plan with a friend and
// an automatic "are you OK?" check-in after it starts.
export function SafetyPanel({
  share,
  onShare,
  timer,
  onTimer,
  summary,
}: {
  share: boolean;
  onShare: (v: boolean) => void;
  timer: boolean;
  onTimer: (v: boolean) => void;
  summary: string;
}) {
  const c = useColors();
  return (
    <YStack p={16} gap={4} rounded={20} bg="$card" borderWidth={1} borderColor="$border">
      <XStack items="center" gap={8} mb={4}>
        <Icon name="shield-check" size={18} color={c.success} strokeWidth={2} />
        <Text fontFamily="$semibold" fontSize={15} color="$text">
          Safety
        </Text>
      </XStack>
      <SafetyRow
        label="Share plan with a friend"
        hint="Send the where and when to someone you trust"
        value={share}
        onChange={(v) => {
          onShare(v);
          if (v)
            Share.share({ message: `I'm training with someone from Pace: ${summary}` }).catch(
              () => {}
            );
        }}
      />
      <SafetyRow
        label="Check-in timer"
        hint="We’ll ask if you’re OK 90 minutes after the start"
        value={timer}
        onChange={onTimer}
        last
      />
    </YStack>
  );
}

function SafetyRow({
  label,
  hint,
  value,
  onChange,
  last = false,
}: {
  label: string;
  hint: string;
  value: boolean;
  onChange: (v: boolean) => void;
  last?: boolean;
}) {
  return (
    <XStack
      items="center"
      gap={12}
      py={10}
      borderBottomWidth={last ? 0 : 1}
      borderBottomColor="$border"
    >
      <YStack flex={1}>
        <Text fontFamily="$medium" fontSize={14} color="$text">
          {label}
        </Text>
        <Text fontSize={12} color="$muted" mt={1}>
          {hint}
        </Text>
      </YStack>
      <Toggle value={value} onChange={onChange} label={label} />
    </XStack>
  );
}

const CHECKIN_OPTIONS: { id: CheckIn; emoji: string; label: string }[] = [
  { id: 'again', emoji: '🔁', label: 'Train again' },
  { id: 'coffee', emoji: '☕', label: 'Grab coffee next time' },
  { id: 'buddies', emoji: '🤝', label: 'Just training buddies' },
];

const OUTCOME_COPY: Record<CheckIn | 'waiting', { title: string; body: string }> = {
  coffee: {
    title: 'You both said coffee ☕',
    body: 'It’s mutual. Plan a coffee after your next session?',
  },
  again: {
    title: 'Training partners 🔁',
    body: 'You both want to go again — pick another session.',
  },
  buddies: {
    title: 'Training buddies 🤝',
    body: 'Great sessions, no pressure. Keep each other honest.',
  },
  waiting: {
    title: 'Answer saved',
    body: 'You’ll see the result once they check in too. Only mutual answers are shown.',
  },
};

// Private post-session check-in. Answers are only revealed when mutual,
// so nobody is left hanging on a one-sided "coffee?".
export function CheckInCard({ plan, onAnswer }: { plan: Plan; onAnswer: (c: CheckIn) => void }) {
  const a = athleteById(plan.athleteId);
  const outcome = checkInOutcome(plan);
  if (!a) return null;
  return (
    <YStack
      p={16}
      gap={12}
      rounded={22}
      bg="$accentSoft"
      borderWidth={1}
      borderColor="$accentBorder"
    >
      <XStack gap={12} items="center">
        <PhotoSlot
          label={a.name}
          shape="circle"
          source={ATHLETE_PHOTOS[a.slotId]}
          style={{ width: 44, height: 44 }}
        />
        <YStack flex={1}>
          <Text fontFamily="$bold" fontSize={16} color="$text">
            {outcome
              ? OUTCOME_COPY[outcome].title
              : `How was ${formatLabel(plan.activity).toLowerCase()} with ${a.name}?`}
          </Text>
          <Text fontSize={13} color="$muted" mt={2}>
            {outcome
              ? OUTCOME_COPY[outcome].body
              : `${formatWhen(plan.date)} · private — ${a.name} only sees it if it’s mutual`}
          </Text>
        </YStack>
      </XStack>
      {outcome ? null : (
        <YStack gap={8}>
          {CHECKIN_OPTIONS.map((o) => (
            <XStack
              key={o.id}
              accessibilityRole="button"
              onPress={() => {
                tapHaptic();
                onAnswer(o.id);
              }}
              pressStyle={{ scale: 0.98 }}
              items="center"
              gap={10}
              px={14}
              height={46}
              rounded={14}
              bg="$card"
              borderWidth={1}
              borderColor="$border"
            >
              <Text fontSize={18}>{o.emoji}</Text>
              <Text fontFamily="$semibold" fontSize={15} color="$text">
                {o.label}
              </Text>
            </XStack>
          ))}
        </YStack>
      )}
    </YStack>
  );
}

// Tap-to-pick chips row used by the composers.
export function PickRow<T extends string>({
  options,
  value,
  onChange,
  render,
}: {
  options: T[];
  value: T | null;
  onChange: (v: T) => void;
  render?: (v: T) => string;
}) {
  return (
    <XStack flexWrap="wrap" gap={8}>
      {options.map((o) => {
        const active = o === value;
        return (
          <XStack
            key={o}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => {
              tapHaptic();
              onChange(o);
            }}
            height={40}
            px={14}
            rounded="$full"
            items="center"
            borderWidth={1}
            bg={active ? '$accent' : '$card'}
            borderColor={active ? '$accent' : '$border'}
          >
            <Text fontFamily="$semibold" fontSize={14} color={active ? '$onAccent' : '$text'}>
              {render ? render(o) : o}
            </Text>
          </XStack>
        );
      })}
    </XStack>
  );
}
