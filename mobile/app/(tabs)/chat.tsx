import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { Icon } from '../../src/components/Icon';
import { PhotoSlot } from '../../src/components/PhotoSlot';
import { IconButton } from '../../src/components/ui';
import { athleteById, CHAT_THREADS } from '../../src/data/mockData';
import { ATHLETE_PHOTOS } from '../../src/data/photos';
import { colors } from '../../src/theme/tokens';

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <ScrollView flex={1} bg="$ink" contentContainerStyle={{ pt: insets.top + 12, pb: 24 }}>
      <XStack items="center" gap={12} px={20} pb={12}>
        <Text fontFamily="$display" fontSize={32} color="$bone" textTransform="uppercase" lineHeight={32}>
          Chat
        </Text>
        <XStack flex={1} />
        <IconButton size={40} onPress={() => router.push('/notifications')}>
          <Icon name="bell" size={16} color={colors.bone} />
        </IconButton>
      </XStack>

      <YStack px={20} pt={8}>
        {CHAT_THREADS.map((t) => {
          const a = athleteById(t.athleteId);
          if (!a) return null;
          return (
            <XStack
              key={t.id}
              onPress={() =>
                router.push({ pathname: '/thread/[athleteId]', params: { athleteId: String(a.id) } })
              }
              items="center"
              gap={12}
              py={12}
              borderBottomWidth={1}
              borderBottomColor="$line"
            >
              <PhotoSlot label={a.name} shape="circle" source={ATHLETE_PHOTOS[a.slotId]} style={{ width: 52, height: 52 }} />
              <YStack flex={1} minW={0}>
                <Text fontFamily="$mono" fontSize={12} color="$bone" letterSpacing={0.5} textTransform="uppercase">
                  {a.name}
                </Text>
                <Text fontSize={12} color="$fog" mt={4} numberOfLines={1}>
                  {t.lastMsg}
                </Text>
              </YStack>
              <YStack items="flex-end">
                <Text fontFamily="$mono" fontSize={10} color="$fog">
                  {t.time}
                </Text>
                {t.unread ? <XStack width={8} height={8} rounded={4} bg="$ember" mt={6} /> : null}
              </YStack>
            </XStack>
          );
        })}
      </YStack>
    </ScrollView>
  );
}