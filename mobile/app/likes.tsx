import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { Icon } from '../src/components/Icon';
import { PhotoSlot } from '../src/components/PhotoSlot';
import { IconButton } from '../src/components/ui';
import { athleteById } from '../src/data/mockData';
import { ATHLETE_PHOTOS } from '../src/data/photos';
import { likeBack, passOn, useSocial } from '../src/data/social';
import { colors } from '../src/theme/tokens';

export default function LikesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { likes } = useSocial();

  function respond(id: number, like: boolean) {
    if (like) {
      likeBack(id);
      // They already liked you — liking back is an instant match.
      setTimeout(() => {
        router.push({ pathname: '/match/[athleteId]', params: { athleteId: String(id) } });
      }, 250);
    } else {
      passOn(id);
    }
  }

  return (
    <YStack flex={1} bg="$ink">
      <XStack items="center" gap={12} px={20} pb={12} pt={insets.top + 8} borderBottomWidth={1} borderBottomColor="$line">
        <IconButton size={40} onPress={() => router.back()}>
          <Icon name="chevron-left" size={14} color={colors.bone} />
        </IconButton>
        <Text flex={1} fontFamily="$display" fontSize={30} color="$bone" textTransform="uppercase" lineHeight={30}>
          Likes
        </Text>
        <Text fontFamily="$mono" fontSize={10} letterSpacing={1} color="$fog">
          {likes.length} PENDING
        </Text>
      </XStack>

      <ScrollView flex={1} contentContainerStyle={{ p: 20, gap: 10, pb: insets.bottom + 24 }}>
        {likes.length === 0 ? (
          <YStack items="center" px={40} gap={10} mt={80}>
            <Icon name="bell" size={28} color={colors.ember} />
            <Text fontFamily="$display" fontSize={22} color="$bone" textTransform="uppercase" mt={8} text="center">
              All caught up
            </Text>
            <Text color="$fog" fontSize={13} lineHeight={20} text="center">
              Nobody new has liked you. Keep training — your next admirer is one session away.
            </Text>
          </YStack>
        ) : null}

        {likes.map((id) => {
          const a = athleteById(id);
          if (!a) return null;
          return (
            <YStack
              key={id}
              p={14}
              rounded={16}
              borderWidth={1}
              borderColor="$line"
              bg="$ash"
              gap={12}
            >
              <XStack items="center" gap={12}>
                <PhotoSlot label={a.name} shape="circle" source={ATHLETE_PHOTOS[a.slotId]} style={{ width: 56, height: 56 }} />
                <YStack flex={1} minW={0}>
                  <Text fontFamily="$mono" fontSize={12} letterSpacing={0.5} color="$bone" textTransform="uppercase">
                    {a.name}, {a.age}
                  </Text>
                  <Text fontFamily="$mono" fontSize={9} letterSpacing={1} color="$fog" mt={3}>
                    {a.discipline} · {a.city}
                  </Text>
                </YStack>
              </XStack>
              <XStack gap={8}>
                <XStack
                  flex={1}
                  height={40}
                  rounded="$full"
                  borderWidth={1}
                  items="center"
                  justify="center"
                  bg="$coal"
                  borderColor="$line"
                  onPress={() => respond(a.id, false)}
                >
                  <Text fontFamily="$mono" fontSize={10} letterSpacing={1.5} fontWeight="700" color="$fog">
                    PASS
                  </Text>
                </XStack>
                <XStack
                  flex={1}
                  height={40}
                  rounded="$full"
                  items="center"
                  justify="center"
                  bg="$ember"
                  onPress={() => respond(a.id, true)}
                >
                  <Text fontFamily="$mono" fontSize={10} letterSpacing={1.5} fontWeight="700" color="$ink">
                    LIKE BACK
                  </Text>
                </XStack>
              </XStack>
            </YStack>
          );
        })}
      </ScrollView>
    </YStack>
  );
}