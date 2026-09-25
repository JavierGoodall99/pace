import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { ActivityPanel } from '../../src/components/ActivityPanel';
import { PhotoSlot } from '../../src/components/PhotoSlot';
import { athleteById, Discipline, FEED_ITEMS, tagsForDiscipline } from '../../src/data/mockData';
import { ACTIVITY_PHOTO, ATHLETE_PHOTOS, ME_AVATAR } from '../../src/data/photos';
import { formatLabel, shadow } from '../../src/theme/tokens';

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
    <ScrollView flex={1} bg="$canvas" contentContainerStyle={{ pt: insets.top + 12, pb: 32 }}>
      <YStack px={20} pb={16}>
        <Text fontFamily="$bold" fontSize={28} lineHeight={34} letterSpacing={-0.5} color="$text">
          Activity
        </Text>
        <Text fontSize={15} lineHeight={22} color="$muted" mt={4}>
          Your training and your matches&apos;, all in one place.
        </Text>
      </YStack>

      <YStack px={20} gap={16}>
        {FEED_ITEMS.map((f) => {
          const who = f.athleteId === 'me' ? null : athleteById(f.athleteId);
          const avatar = who ? ATHLETE_PHOTOS[who.slotId] : ME_AVATAR;
          const photo = f.hasPhoto ? ACTIVITY_PHOTO : avatar;
          const discipline = TYPE_DISCIPLINE[f.type];

          return (
            <YStack
              key={f.id}
              rounded={24}
              bg="$card"
              borderWidth={1}
              borderColor="$border"
              overflow="hidden"
              style={shadow.card}
            >
              <XStack items="center" gap={10} px={16} pt={14} pb={12}>
                <PhotoSlot
                  label={f.who}
                  shape="circle"
                  source={avatar}
                  style={{ width: 36, height: 36 }}
                />
                <YStack flex={1}>
                  <Text fontFamily="$semibold" fontSize={15} color="$text">
                    {f.who}
                  </Text>
                  <Text fontSize={13} color="$muted">
                    {formatLabel(f.type)} · {formatLabel(f.time)}
                  </Text>
                </YStack>
              </XStack>
              <YStack px={12}>
                <PhotoSlot
                  label={who ? who.name : 'You'}
                  shape="rounded"
                  radius={18}
                  source={photo}
                  style={{ width: '100%', height: 220 }}
                />
              </YStack>
              <YStack px={16} pt={12} pb={14} gap={12}>
                <Text fontFamily="$medium" fontSize={15} color="$text">
                  {f.stat}
                </Text>
                <ActivityPanel
                  tags={discipline ? tagsForDiscipline(discipline) : []}
                  statLabel="kudos"
                  statValue={f.kudos + (liked[f.id] ? 1 : 0)}
                  liked={!!liked[f.id]}
                  onLike={() => toggleLike(f.id)}
                  likeLabel={`Give ${f.who} kudos`}
                />
              </YStack>
            </YStack>
          );
        })}
      </YStack>
    </ScrollView>
  );
}
