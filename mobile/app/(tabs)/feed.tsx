import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { ActivityPanel } from '../../src/components/ActivityPanel';
import { PhotoSlot } from '../../src/components/PhotoSlot';
import { athleteById, Discipline, FEED_ITEMS, tagsForDiscipline } from '../../src/data/mockData';
import { ACTIVITY_PHOTO, ATHLETE_PHOTOS, ME_AVATAR } from '../../src/data/photos';
import { colors } from '../../src/theme/tokens';

// Feed post types map onto the discipline vocabulary so the stats
// panel's activity tiles stay consistent with the Discover cards.
const TYPE_DISCIPLINE: Record<string, Discipline> = {
  RUN: 'RUNNING',
  CROSSFIT: 'CROSSFIT',
  CLIMB: 'CLIMBING',
  'TRI BRICK': 'TRIATHLON',
};

export default function FeedScreen() {
  const insets = useSafeAreaInsets();
  const [liked, setLiked] = useState<Record<number, boolean>>({});

  function toggleLike(id: number) {
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <ScrollView flex={1} bg="$ink" contentContainerStyle={{ pt: insets.top + 12, pb: 24 }}>
      <YStack px={20} pb={4}>
        <Text fontFamily="$display" fontSize={32} color="$bone" textTransform="uppercase" lineHeight={32}>
          Activity
        </Text>
        <Text color="$fog" fontSize={12} mt={8} mb={16}>
          Your training log and your matches&apos;, together.
        </Text>
      </YStack>

      <YStack px={20} gap={14}>
        {FEED_ITEMS.map((f) => {
          const who = f.athleteId === 'me' ? null : athleteById(f.athleteId);
          const photo = f.hasPhoto ? ACTIVITY_PHOTO : who ? ATHLETE_PHOTOS[who.slotId] : ME_AVATAR;
          const discipline = TYPE_DISCIPLINE[f.type];

          return (
            <YStack key={f.id} borderWidth={1} borderColor="$line" rounded={24} bg="$ash" overflow="hidden">
              <PhotoSlot label={who ? who.name : 'You'} shape="rect" source={photo} style={{ width: '100%', height: 230, borderRadius: 0 }} />
              <YStack
                pointerEvents="none"
                position="absolute"
                l={0}
                r={0}
                t={-90}
                b={0}
              >
                <Svg width="100%" height="100%">
                  <Defs>
                    <LinearGradient id="photoFadeFeed" x1="0" y1="0" x2="0" y2="1">
                      <Stop offset="0" stopColor={colors.coal} stopOpacity={0} />
                      <Stop offset="0.45" stopColor={colors.coal} stopOpacity={1} />
                      <Stop offset="1" stopColor={colors.coal} stopOpacity={1} />
                    </LinearGradient>
                  </Defs>
                  <Rect width="100%" height="100%" fill="url(#photoFadeFeed)" />
                </Svg>
              </YStack>
              <YStack bg="$coal" px={16} pt={12} pb={14}>
                <XStack items="center" justify="space-between">
                  <Text fontFamily="$display" fontSize={18} color="$bone" textTransform="uppercase" lineHeight={18}>
                    {f.who}
                  </Text>
                  <Text fontFamily="$mono" fontSize={8.5} letterSpacing={1} color="$fog">
                    {f.time}
                  </Text>
                </XStack>
                <Text fontFamily="$mono" fontSize={10} letterSpacing={0.5} color="$fog" mt={6} mb={10}>
                  {f.stat}
                </Text>
                <ActivityPanel
                  tags={discipline ? tagsForDiscipline(discipline) : []}
                  statLabel="KUDOS"
                  statValue={f.kudos + (liked[f.id] ? 1 : 0)}
                  liked={!!liked[f.id]}
                  onLike={() => toggleLike(f.id)}
                  likeLabel={`Kudos ${f.who}`}
                />
              </YStack>
            </YStack>
          );
        })}
      </YStack>
    </ScrollView>
  );
}