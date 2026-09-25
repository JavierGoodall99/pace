import React from 'react';
import { Text, XStack, YStack } from 'tamagui';
import { Icon, IconName } from './Icon';
import { DisplayTitle } from './ui';
import { Compat, FactorKey } from '../data/compat';
import { Rhythm } from '../data/rhythm';
import { Race, daysUntil, formatRaceDate } from '../data/races';
import { Stage, STAGES } from '../data/plans';
import type { Prompt } from '../data/athleteDepth';
import { useColors } from '../theme/appearance';

// "Proof of effort" building blocks: why two people match, what their
// last month of training looked like, what they're training for, and
// how far along you are together.

const FACTOR_ICON: Record<FactorKey, IconName> = {
  days: 'calendar',
  time: 'clock',
  pace: 'zap',
  distance: 'map-pin',
};

// The explainable sync score — each factor with a plain-English reason
// and a bar, so "87% in sync" is something you can trust.
export function WhyMatch({ compat, name }: { compat: Compat; name: string }) {
  const c = useColors();
  return (
    <YStack gap={14}>
      <XStack items="baseline" justify="space-between">
        <DisplayTitle size={28}>{`Why you *match*`}</DisplayTitle>
        <Text fontFamily="$display" fontSize={34} lineHeight={38} color="$accentText">
          {compat.score}%
        </Text>
      </XStack>
      {compat.factors.map((f) => (
        <XStack key={f.key} gap={12} items="center">
          <XStack
            width={36}
            height={36}
            rounded={12}
            bg="$accentSoft"
            items="center"
            justify="center"
          >
            <Icon name={FACTOR_ICON[f.key]} size={17} color={c.accentText} strokeWidth={2} />
          </XStack>
          <YStack flex={1} gap={5}>
            <XStack justify="space-between" gap={8}>
              <Text fontFamily="$semibold" fontSize={14} color="$text">
                {f.label}
              </Text>
              <Text fontFamily="$medium" fontSize={12} color="$muted">
                {Math.round(f.score * 100)}%
              </Text>
            </XStack>
            <YStack height={6} rounded={3} bg="$surface" overflow="hidden">
              <YStack
                height="100%"
                width={`${Math.max(6, f.score * 100)}%`}
                bg="$accent"
                rounded={3}
              />
            </YStack>
            <Text fontSize={13} lineHeight={18} color="$muted">
              {f.detail}
            </Text>
          </YStack>
        </XStack>
      ))}
      <Text fontSize={12} color="$muted">
        Based on your week, {name}’s week, effort level and distance.
      </Text>
    </YStack>
  );
}

// Compact chips of the two strongest reasons — for cards.
export function WhyChips({ compat, onPhoto = false }: { compat: Compat; onPhoto?: boolean }) {
  const c = useColors();
  const top = [...compat.factors].sort((x, y) => y.score - x.score).slice(0, 2);
  return (
    <XStack gap={6} flexWrap="wrap">
      {top.map((f) => (
        <XStack
          key={f.key}
          items="center"
          gap={5}
          height={28}
          px={10}
          rounded="$full"
          bg={onPhoto ? 'rgba(255,255,255,0.16)' : '$surface'}
        >
          <Icon
            name={FACTOR_ICON[f.key]}
            size={13}
            color={onPhoto ? c.onPhoto : c.accentText}
            strokeWidth={2.2}
          />
          <Text
            fontFamily="$semibold"
            fontSize={12}
            color={onPhoto ? '$onPhoto' : '$text'}
            numberOfLines={1}
          >
            {f.detail}
          </Text>
        </XStack>
      ))}
    </XStack>
  );
}

// Last 4 weeks of training as a heatmap — proof they actually show up.
// Mock: derived from their weekly rhythm with a little variation.
export function Heatmap({ rhythm, seed = 1 }: { rhythm: Rhythm; seed?: number }) {
  const c = useColors();
  const weeks = [0, 1, 2, 3].map((w) =>
    rhythm.map((on, d) => {
      if (!on) return (seed + w + d) % 11 === 0 ? 1 : 0; // the odd bonus session
      return (seed * 3 + w * 5 + d) % 7 === 0 ? 0 : 1 + ((seed + w + d) % 3); // the odd rest day
    })
  );
  const total = weeks.flat().filter((v) => v > 0).length;
  const shade = (v: number) =>
    v === 0 ? c.surface : v === 1 ? c.accentBorder : v === 2 ? `${c.accent}B3` : c.accent;
  return (
    <YStack gap={10}>
      <XStack justify="space-between" items="baseline">
        <Text fontFamily="$semibold" fontSize={15} color="$text">
          Last 4 weeks
        </Text>
        <Text fontFamily="$medium" fontSize={13} color="$muted">
          {total} sessions
        </Text>
      </XStack>
      <YStack gap={5}>
        {weeks.map((week, w) => (
          <XStack key={w} gap={5}>
            {week.map((v, d) => (
              <YStack key={d} flex={1} height={22} rounded={6} bg={shade(v) as any} />
            ))}
          </XStack>
        ))}
      </YStack>
      <XStack justify="space-between">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <Text key={i} flex={1} text="center" fontSize={11} color="$muted">
            {d}
          </Text>
        ))}
      </XStack>
    </YStack>
  );
}

export function GoalCard({
  race,
  others,
  onPress,
  mine = false,
}: {
  race: Race;
  others: number;
  onPress?: () => void;
  mine?: boolean;
}) {
  const c = useColors();
  const days = daysUntil(race.date);
  return (
    <XStack
      onPress={onPress}
      pressStyle={onPress ? { opacity: 0.85 } : undefined}
      items="center"
      gap={14}
      p={16}
      rounded={22}
      bg="$accentSoft"
      borderWidth={1}
      borderColor="$accentBorder"
    >
      <YStack items="center" minW={64}>
        <Text fontFamily="$display" fontSize={42} lineHeight={44} color="$accentText">
          {Math.max(days, 0)}
        </Text>
        <Text fontFamily="$semibold" fontSize={11} color="$accentText">
          {days === 1 ? 'DAY' : 'DAYS'}
        </Text>
      </YStack>
      <YStack flex={1} gap={2}>
        <Text fontFamily="$medium" fontSize={12} color="$muted">
          {mine ? 'You’re training for' : 'Training for'}
        </Text>
        <Text fontFamily="$bold" fontSize={16} color="$text">
          {race.emoji} {race.name}
        </Text>
        <Text fontSize={13} color="$muted">
          {formatRaceDate(race.date)} · {race.distance}
          {others > 0 ? ` · ${others} pacer${others === 1 ? '' : 's'} too` : ''}
        </Text>
      </YStack>
      {onPress ? <Icon name="chevron-right" size={18} color={c.accentText} /> : null}
    </XStack>
  );
}

export function PromptCard({ prompt }: { prompt: Prompt }) {
  return (
    <YStack p={16} gap={6} rounded={20} bg="$card" borderWidth={1} borderColor="$border">
      <Text fontFamily="$semibold" fontSize={13} color="$muted">
        {prompt.q}
      </Text>
      <Text fontFamily="$display" fontSize={24} lineHeight={29} color="$text">
        {prompt.a}
      </Text>
    </YStack>
  );
}

export function PersonalBests({ pbs }: { pbs: { label: string; value: string }[] }) {
  if (!pbs.length) return null;
  return (
    <XStack gap={10} flexWrap="wrap">
      {pbs.map((pb) => (
        <YStack
          key={pb.label}
          flex={1}
          minW={130}
          p={14}
          rounded={18}
          bg="$card"
          borderWidth={1}
          borderColor="$border"
        >
          <Text fontFamily="$display" fontSize={28} lineHeight={32} color="$text">
            {pb.value}
          </Text>
          <Text fontSize={13} color="$muted" mt={2}>
            PB · {pb.label}
          </Text>
        </YStack>
      ))}
    </XStack>
  );
}

// Match → Train → Coffee → Date. The relationship moves forward through
// sessions, and each step only happens when you both want it.
export function JourneyLadder({
  stage,
  sessions,
  compact = false,
}: {
  stage: Stage | null;
  sessions: number;
  compact?: boolean;
}) {
  const c = useColors();
  const reached = stage ? STAGES.findIndex((s) => s.id === stage) : -1;
  const next = STAGES[reached + 1];
  return (
    <YStack gap={compact ? 8 : 12}>
      <XStack items="center">
        {STAGES.map((s, i) => {
          const done = i <= reached;
          return (
            <React.Fragment key={s.id}>
              {i > 0 ? (
                <YStack
                  flex={1}
                  height={3}
                  mx={4}
                  rounded={2}
                  bg={i <= reached ? '$accent' : '$border'}
                />
              ) : null}
              <YStack items="center" gap={4}>
                <XStack
                  width={compact ? 30 : 38}
                  height={compact ? 30 : 38}
                  rounded={compact ? 15 : 19}
                  items="center"
                  justify="center"
                  bg={done ? '$accent' : '$surface'}
                  borderWidth={i === reached + 1 ? 2 : 0}
                  borderColor="$accentBorder"
                  borderStyle="dashed"
                >
                  <Text fontSize={compact ? 14 : 17}>{s.emoji}</Text>
                </XStack>
                {compact ? null : (
                  <Text
                    fontFamily={done ? '$bold' : '$medium'}
                    fontSize={12}
                    color={done ? '$accentText' : '$muted'}
                  >
                    {s.label}
                  </Text>
                )}
              </YStack>
            </React.Fragment>
          );
        })}
      </XStack>
      <XStack items="center" gap={6}>
        <Icon name="activity" size={14} color={c.accentText} strokeWidth={2} />
        <Text fontSize={13} color="$muted" flex={1}>
          {sessions > 0
            ? `${sessions} session${sessions === 1 ? '' : 's'} together`
            : 'No sessions yet'}
          {next ? ` · next: ${next.label.toLowerCase()}` : ''}
        </Text>
      </XStack>
    </YStack>
  );
}
