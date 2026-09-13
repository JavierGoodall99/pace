import React from 'react';
import { Text, XStack, YStack } from 'tamagui';
import { Icon } from './Icon';
import { colors } from '../theme/tokens';

// The stats cluster from the app's card mockup: a row of activity
// tiles on the left and a round heart button on the right. When a
// stat is provided (kudos on feed cards) it sits between the tiles
// and the heart. Shared by the Discover cards and the Activity feed
// cards.
//
// Tiles follow the app's Badge/Chip neutral-vs-accent language rather
// than per-discipline hues, so the panel reads as one design system
// with the rest of the app: the athlete's primary discipline (first
// tag) gets the ember accent treatment, the rest stay neutral.

const DISCIPLINE_ABBR: Record<string, string> = {
  RUNNING: 'RUN',
  CYCLING: 'RIDE',
  TRAIL: 'TRA',
  SWIMMING: 'SWM',
  CROSSFIT: 'CFX',
  CLIMBING: 'CLB',
  TRIATHLON: 'TRI',
};

interface ActivityPanelProps {
  tags: string[];
  statLabel?: string;
  statValue?: string | number;
  liked?: boolean;
  onLike: () => void;
  likeLabel?: string;
}

export function ActivityPanel({
  tags,
  statLabel,
  statValue,
  liked = false,
  onLike,
  likeLabel = 'Like',
}: ActivityPanelProps) {
  return (
    <XStack items="center" gap={10}>
      {tags.length > 0 ? (
        <XStack gap={6}>
          {tags.slice(0, 3).map((t, i) => {
            const accent = i === 0;
            return (
              <YStack
                key={t}
                height={36}
                px={16}
                rounded="$full"
                borderWidth={1}
                items="center"
                justify="center"
                bg={accent ? '$emberSoft' : '$coal'}
                borderColor={accent ? '$emberBorder' : '$line'}
              >
                <Text fontFamily="$mono" fontWeight="700" fontSize={12} letterSpacing={1} color={accent ? '$ember' : '$bone'}>
                  {DISCIPLINE_ABBR[t] ?? t.slice(0, 3)}
                </Text>
              </YStack>
            );
          })}
        </XStack>
      ) : null}

      {statValue != null ? (
        <YStack items="flex-start" justify="center">
          <Text fontFamily="$mono" fontSize={8} letterSpacing={1.5} color="$fog">
            {statLabel}
          </Text>
          <Text fontFamily="$display" fontSize={34} lineHeight={38} color="$bone" mt={2}>
            {statValue}
          </Text>
        </YStack>
      ) : null}

      <XStack flex={1} />

      <XStack
        accessibilityRole="button"
        accessibilityLabel={likeLabel}
        onPress={onLike}
        pressStyle={{ transform: [{ scale: 0.9 }] }}
        hitSlop={6}
        width={44}
        height={44}
        rounded={22}
        bg={liked ? '$ember' : '$bone'}
        items="center"
        justify="center"
        shadowColor="#000"
        shadowOpacity={0.35}
        shadowRadius={8}
        shadowOffset={{ width: 0, height: 4 }}
        elevation={5}
      >
        <Icon name="heart" size={20} color={colors.ink} />
      </XStack>
    </XStack>
  );
}