import React from 'react';
import { Text, XStack, YStack } from 'tamagui';
import { Icon } from './Icon';
import { useColors } from '../theme/appearance';
import { formatLabel } from '../theme/tokens';

// The footer row shared by Discover cards and Activity feed cards:
// sport tags on the left, a like control on the right. On feed cards
// the like control is a pill carrying the kudos count; on Discover it's
// a round accent button, the card's primary action.
//
// The athlete's primary sport (first tag) gets the accent treatment;
// the rest stay neutral.

interface ActivityPanelProps {
  tags: string[];
  statLabel?: string;
  statValue?: string | number;
  liked?: boolean;
  onLike: () => void;
  likeLabel?: string;
  // Discover only: a secondary "pass" button beside the like button.
  onPass?: () => void;
  passLabel?: string;
  // 'photo' when the panel sits on a photo scrim: controls stay light
  // whatever the app theme.
  variant?: 'card' | 'photo';
}

export function ActivityPanel({
  tags,
  statLabel,
  statValue,
  liked = false,
  onLike,
  likeLabel = 'Like',
  onPass,
  passLabel = 'Pass',
  variant = 'card',
}: ActivityPanelProps) {
  const onPhoto = variant === 'photo';
  const colors = useColors();
  const hasStat = statValue != null;
  return (
    <XStack items="center" gap={10}>
      <XStack flex={1} flexWrap="wrap" gap={6}>
        {tags.slice(0, 2).map((t, i) => {
          const accent = i === 0;
          return (
            <YStack
              key={t}
              height={30}
              px={12}
              rounded="$full"
              items="center"
              justify="center"
              bg={
                onPhoto
                  ? accent
                    ? '$accent'
                    : 'rgba(255,255,255,0.18)'
                  : accent
                    ? '$accentSoft'
                    : '$surface'
              }
            >
              <Text
                fontFamily="$semibold"
                fontSize={13}
                color={onPhoto ? '$onPhoto' : accent ? '$accentText' : '$text'}
              >
                {formatLabel(t)}
              </Text>
            </YStack>
          );
        })}
      </XStack>

      {hasStat ? (
        <XStack
          accessibilityRole="button"
          accessibilityLabel={likeLabel}
          accessibilityState={{ selected: liked }}
          onPress={onLike}
          pressStyle={{ scale: 0.95 }}
          hitSlop={6}
          items="center"
          gap={6}
          height={36}
          px={14}
          rounded="$full"
          bg={liked ? '$accentSoft' : '$surface'}
        >
          <Icon
            name="heart"
            size={16}
            color={liked ? colors.accentText : colors.text}
            filled={liked}
            strokeWidth={2}
          />
          <Text fontFamily="$semibold" fontSize={14} color={liked ? '$accentText' : '$text'}>
            {statValue}
          </Text>
          {statLabel ? (
            <Text fontSize={13} color="$muted">
              {statLabel}
            </Text>
          ) : null}
        </XStack>
      ) : (
        <XStack items="center" gap={10}>
          {onPass ? (
            <XStack
              accessibilityRole="button"
              accessibilityLabel={passLabel}
              onPress={onPass}
              pressStyle={{ scale: 0.92 }}
              hitSlop={6}
              width={44}
              height={44}
              rounded={22}
              bg={onPhoto ? 'rgba(255,255,255,0.94)' : '$card'}
              items="center"
              justify="center"
            >
              <Icon
                name="x"
                size={20}
                color={onPhoto ? '#1C1917' : colors.text}
                strokeWidth={2.2}
              />
            </XStack>
          ) : null}
          <XStack
            accessibilityRole="button"
            accessibilityLabel={likeLabel}
            onPress={onLike}
            pressStyle={{ scale: 0.92 }}
            hitSlop={6}
            width={52}
            height={52}
            rounded={26}
            bg="$accent"
            items="center"
            justify="center"
            shadowColor="$accent"
            shadowOpacity={0.35}
            shadowRadius={12}
            shadowOffset={{ width: 0, height: 6 }}
            elevation={5}
          >
            <Icon name="heart" size={22} color={colors.onAccent} filled />
          </XStack>
        </XStack>
      )}
    </XStack>
  );
}
