import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { Icon } from '../src/components/Icon';
import { PhotoSlot } from '../src/components/PhotoSlot';
import { IconButton } from '../src/components/ui';
import { athleteById } from '../src/data/mockData';
import { ATHLETE_PHOTOS } from '../src/data/photos';
import { useSocial } from '../src/data/social';
import { colors } from '../src/theme/tokens';

export default function MatchesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { matches } = useSocial();

  return (
    <YStack flex={1} bg="$ink">
      <XStack items="center" gap={12} px={20} pb={12} pt={insets.top + 8} borderBottomWidth={1} borderBottomColor="$line">
        <IconButton size={40} onPress={() => router.back()}>
          <Icon name="chevron-left" size={14} color={colors.bone} />
        </IconButton>
        <Text flex={1} fontFamily="$display" fontSize={30} color="$bone" textTransform="uppercase" lineHeight={30}>
          Matches
        </Text>
        <Text fontFamily="$mono" fontSize={10} letterSpacing={1} color="$fog">
          {matches.length} TOTAL
        </Text>
      </XStack>

      <ScrollView flex={1} contentContainerStyle={{ p: 20, gap: 10, pb: insets.bottom + 24 }}>
        {matches.length === 0 ? (
          <YStack items="center" px={40} gap={10} mt={80}>
            <Icon name="heart" size={28} color={colors.ember} />
            <Text fontFamily="$display" fontSize={22} color="$bone" textTransform="uppercase" mt={8} text="center">
              No matches yet
            </Text>
            <Text color="$fog" fontSize={13} lineHeight={20} text="center">
              Swipe right on athletes who train like you. When they like you back, they land here.
            </Text>
          </YStack>
        ) : null}

        {matches.map((id) => {
          const a = athleteById(id);
          if (!a) return null;
          return (
            <XStack
              key={id}
              onPress={() => router.push({ pathname: '/thread/[athleteId]', params: { athleteId: String(id) } })}
              pressStyle={{ opacity: 0.7 }}
              items="center"
              gap={12}
              p={12}
              rounded={16}
              borderWidth={1}
              borderColor="$line"
              bg="$ash"
            >
              <PhotoSlot label={a.name} shape="circle" source={ATHLETE_PHOTOS[a.slotId]} style={{ width: 52, height: 52 }} />
              <YStack flex={1} minW={0}>
                <Text fontFamily="$mono" fontSize={12} letterSpacing={0.5} color="$bone" textTransform="uppercase">
                  {a.name}
                </Text>
                <Text fontFamily="$mono" fontSize={9} letterSpacing={1} color="$fog" mt={3}>
                  {a.discipline} · {a.pace}
                </Text>
              </YStack>
              <Icon name="arrow-right" size={16} color={colors.ember} />
            </XStack>
          );
        })}
      </ScrollView>
    </YStack>
  );
}