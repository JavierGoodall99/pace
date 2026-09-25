import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { Icon } from '../src/components/Icon';
import { PhotoSlot } from '../src/components/PhotoSlot';
import { Badge, ScreenHeader } from '../src/components/ui';
import { ATHLETE_PHOTOS } from '../src/data/photos';
import { athletesTrainingFor, daysUntil, formatRaceDate, upcomingRaces } from '../src/data/races';
import { useMe } from '../src/data/session';
import { useColors } from '../src/theme/appearance';

// Race mode: start lines people are training for. See who else is on
// the same block and meet at the expo or finish.

export default function RacesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const me = useMe();

  return (
    <ScrollView flex={1} bg="$canvas" contentContainerStyle={{ pb: insets.bottom + 24 }}>
      <ScreenHeader
        title="Race *mode*"
        subtitle="Find people training for the same start line."
        onBack={() => router.back()}
      />
      <YStack px={20} gap={12} mt={16}>
        {upcomingRaces().map((r) => {
          const runners = athletesTrainingFor(r.id);
          const mine = me.goalRaceId === r.id;
          return (
            <XStack
              key={r.id}
              onPress={() => router.push({ pathname: '/race/[id]', params: { id: r.id } })}
              pressStyle={{ opacity: 0.85 }}
              items="center"
              gap={14}
              p={16}
              rounded={22}
              bg={mine ? '$accentSoft' : '$card'}
              borderWidth={1}
              borderColor={mine ? '$accentBorder' : '$border'}
            >
              <YStack items="center" width={58}>
                <Text fontFamily="$display" fontSize={34} lineHeight={36} color="$accentText">
                  {daysUntil(r.date)}
                </Text>
                <Text fontFamily="$semibold" fontSize={10} color="$accentText">
                  DAYS
                </Text>
              </YStack>
              <YStack flex={1} gap={3}>
                <XStack items="center" gap={6}>
                  <Text fontFamily="$bold" fontSize={16} color="$text" numberOfLines={1} flex={1}>
                    {r.emoji} {r.name}
                  </Text>
                  {mine ? <Badge tone="accent">Your race</Badge> : null}
                </XStack>
                <Text fontSize={13} color="$muted">
                  {formatRaceDate(r.date)} · {r.city} · {r.distance}
                </Text>
                {runners.length ? (
                  <XStack items="center" gap={6} mt={4}>
                    <XStack>
                      {runners.slice(0, 3).map((a, i) => (
                        <YStack
                          key={a.id}
                          ml={i ? -8 : 0}
                          rounded={14}
                          borderWidth={2}
                          borderColor={mine ? '$accentSoft' : '$card'}
                        >
                          <PhotoSlot
                            label={a.name}
                            shape="circle"
                            source={ATHLETE_PHOTOS[a.slotId]}
                            style={{ width: 24, height: 24 }}
                          />
                        </YStack>
                      ))}
                    </XStack>
                    <Text fontSize={12} color="$muted">
                      {runners.length} pacer{runners.length === 1 ? '' : 's'} training for it
                    </Text>
                  </XStack>
                ) : null}
              </YStack>
              <Icon name="chevron-right" size={18} color={colors.muted} />
            </XStack>
          );
        })}
      </YStack>
    </ScrollView>
  );
}
