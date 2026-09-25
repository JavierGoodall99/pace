import React from 'react';
import { Text, XStack, YStack } from 'tamagui';
import { Icon } from './Icon';
import { useColors } from '../theme/appearance';
import { Rhythm, WEEK_DAYS } from '../data/rhythm';

// Pace's signature visual: a week drawn as an equalizer. Each day is a
// bar — tall and accent when you both train, medium when only they do,
// an outline when only you do, a stub when neither does — so how well
// two weeks line up reads at a glance.

type Variant = 'card' | 'photo';

export function RhythmStrip({
  mine,
  theirs,
  variant = 'card',
  height = 34,
}: {
  mine?: Rhythm;
  theirs: Rhythm;
  variant?: Variant;
  height?: number;
}) {
  const c = useColors();
  const onPhoto = variant === 'photo';
  return (
    <XStack gap={6} items="flex-end" accessibilityLabel="Weekly training rhythm">
      {WEEK_DAYS.map((d, i) => {
        const them = theirs[i];
        const me = mine?.[i] ?? false;
        const both = them && me;
        const barH = both
          ? height
          : them
            ? Math.round(height * 0.62)
            : me
              ? Math.round(height * 0.42)
              : 6;
        let bg: string;
        let border = 'transparent';
        if (both) bg = c.accent;
        else if (them) bg = onPhoto ? 'rgba(255,255,255,0.5)' : c.accentBorder;
        else if (me) {
          bg = 'transparent';
          border = onPhoto ? 'rgba(255,255,255,0.6)' : c.borderStrong;
        } else bg = onPhoto ? 'rgba(255,255,255,0.18)' : c.surface;
        return (
          <YStack key={i} flex={1} items="center" gap={6}>
            <YStack
              width="100%"
              maxW={onPhoto ? 20 : 26}
              height={barH}
              rounded={8}
              bg={bg as any}
              borderWidth={me && !them ? 1.5 : 0}
              borderColor={border as any}
              borderStyle="dashed"
              style={
                both
                  ? {
                      shadowColor: c.accent,
                      shadowOpacity: 0.45,
                      shadowRadius: 8,
                      shadowOffset: { width: 0, height: 2 },
                    }
                  : undefined
              }
            />
            <Text
              fontFamily={both ? '$bold' : '$medium'}
              fontSize={11}
              color={
                onPhoto
                  ? both
                    ? '$onPhoto'
                    : 'rgba(255,255,255,0.7)'
                  : both
                    ? '$accentText'
                    : '$muted'
              }
            >
              {d}
            </Text>
          </YStack>
        );
      })}
    </XStack>
  );
}

export function RhythmLegend() {
  const c = useColors();
  const item = (swatch: React.ReactNode, label: string) => (
    <XStack items="center" gap={6}>
      {swatch}
      <Text fontSize={12} color="$muted">
        {label}
      </Text>
    </XStack>
  );
  return (
    <XStack gap={14}>
      {item(<YStack width={10} height={10} rounded={3} bg="$accent" />, 'Both')}
      {item(<YStack width={10} height={10} rounded={3} bg={c.accentBorder as any} />, 'Them')}
      {item(
        <YStack
          width={10}
          height={10}
          rounded={3}
          borderWidth={1.5}
          borderColor="$borderStrong"
          borderStyle="dashed"
        />,
        'You'
      )}
    </XStack>
  );
}

// "92% in sync" pill.
export function SyncBadge({ pct, variant = 'card' }: { pct: number; variant?: Variant }) {
  const c = useColors();
  const onPhoto = variant === 'photo';
  return (
    <XStack
      items="center"
      gap={6}
      height={32}
      px={12}
      rounded="$full"
      bg={onPhoto ? 'rgba(20,16,17,0.45)' : '$accentSoft'}
      borderWidth={onPhoto ? 1 : 0}
      borderColor="rgba(255,255,255,0.25)"
    >
      <Icon
        name="activity"
        size={15}
        color={onPhoto ? c.onPhoto : c.accentText}
        strokeWidth={2.2}
      />
      <Text fontFamily="$bold" fontSize={13} color={onPhoto ? '$onPhoto' : '$accentText'}>
        {pct}% in sync
      </Text>
    </XStack>
  );
}
