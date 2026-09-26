import { useRouter } from 'expo-router';
import React from 'react';
import { Image } from 'react-native';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { Icon } from './Icon';
import { athleteById } from '../data/mockData';
import { liveMoments, useMoments } from '../data/moments';
import { ATHLETE_PHOTOS, ME_AVATAR } from '../data/photos';
import { useMe } from '../data/session';
import { useSocial } from '../data/social';
import { useColors } from '../theme/appearance';

// Stories-style row of session moments from you and your matches. A
// ring means there's something you haven't seen yet.
export function MomentsRow() {
  const c = useColors();
  const router = useRouter();
  const me = useMe();
  const state = useMoments();
  const { matches, blocked } = useSocial();
  const live = liveMoments(
    state,
    matches.filter((id) => !blocked.includes(id))
  );
  const mine = live.find((m) => m.author === 'me');
  const others = live.filter((m) => m.author !== 'me');
  const myFace = me.photos[0] ? { uri: me.photos[0] } : ME_AVATAR;

  return (
    <YStack gap={8}>
      <XStack px={20} items="baseline" justify="space-between">
        <Text fontFamily="$semibold" fontSize={15} color="$text">
          Session moments
        </Text>
        <Text fontSize={12} color="$muted">
          Matches only · gone in 24h
        </Text>
      </XStack>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ px: 20, gap: 14 }}
      >
        <Circle
          label={mine ? 'Your moment' : 'Post yours'}
          source={mine ? mine.source : myFace}
          ring={mine ? 'seen' : 'none'}
          badge={!mine}
          onPress={() =>
            mine
              ? router.push({ pathname: '/moment/[id]', params: { id: mine.id } })
              : router.push('/moment-new')
          }
          accent={c.accent}
          onAccent={c.onAccent}
        />
        {others.map((m) => {
          const a = typeof m.author === 'number' ? athleteById(m.author) : null;
          if (!a) return null;
          return (
            <Circle
              key={m.id}
              label={a.name}
              source={ATHLETE_PHOTOS[a.slotId]}
              ring={state.seen.includes(m.id) ? 'seen' : 'new'}
              onPress={() => router.push({ pathname: '/moment/[id]', params: { id: m.id } })}
              accent={c.accent}
              onAccent={c.onAccent}
            />
          );
        })}
      </ScrollView>
    </YStack>
  );
}

function Circle({
  label,
  source,
  ring,
  badge,
  onPress,
  accent,
  onAccent,
}: {
  label: string;
  source: number | { uri: string };
  ring: 'new' | 'seen' | 'none';
  badge?: boolean;
  onPress: () => void;
  accent: string;
  onAccent: string;
}) {
  return (
    <YStack
      items="center"
      gap={6}
      width={70}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <YStack
        p={3}
        rounded={40}
        borderWidth={ring === 'none' ? 0 : 2.5}
        borderColor={ring === 'new' ? '$accent' : '$borderStrong'}
      >
        <Image
          source={source}
          style={{ width: 60, height: 60, borderRadius: 30 }}
          resizeMode="cover"
        />
        {badge ? (
          <XStack
            position="absolute"
            r={0}
            b={0}
            width={24}
            height={24}
            rounded={12}
            items="center"
            justify="center"
            borderWidth={2}
            borderColor="$canvas"
            style={{ backgroundColor: accent }}
          >
            <Icon name="plus" size={13} color={onAccent} strokeWidth={3} />
          </XStack>
        ) : null}
      </YStack>
      <Text fontFamily="$medium" fontSize={12} color="$text" numberOfLines={1}>
        {label}
      </Text>
    </YStack>
  );
}
