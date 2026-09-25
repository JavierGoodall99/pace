import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { Icon } from '../../src/components/Icon';
import { PhotoSlot } from '../../src/components/PhotoSlot';
import { useTabBarSpace } from '../../src/components/TabBar';
import { DisplayTitle, IconButton } from '../../src/components/ui';
import { athleteById, CHAT_THREADS } from '../../src/data/mockData';
import { ATHLETE_PHOTOS } from '../../src/data/photos';
import { useSocial } from '../../src/data/social';
import { useColors } from '../../src/theme/appearance';
import { formatLabel } from '../../src/theme/tokens';

export default function ChatScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const tabBarSpace = useTabBarSpace();
  const router = useRouter();
  const { blocked } = useSocial();
  const threads = CHAT_THREADS.filter((t) => !blocked.includes(t.athleteId));

  return (
    <ScrollView
      flex={1}
      bg="$canvas"
      contentContainerStyle={{ pt: insets.top + 8, pb: tabBarSpace + 16 }}
    >
      <XStack items="center" gap={12} px={20} pb={8}>
        <YStack flex={1}>
          <DisplayTitle size={42}>Your *chats*</DisplayTitle>
        </YStack>
        <IconButton
          size={40}
          onPress={() => router.push('/notifications')}
          accessibilityLabel="Notifications"
        >
          <Icon name="bell" size={18} color={colors.text} />
        </IconButton>
      </XStack>

      <YStack px={12} pt={4}>
        {threads.map((t) => {
          const a = athleteById(t.athleteId);
          if (!a) return null;
          return (
            <XStack
              key={t.id}
              onPress={() =>
                router.push({
                  pathname: '/thread/[athleteId]',
                  params: { athleteId: String(a.id) },
                })
              }
              pressStyle={{ bg: '$surface' }}
              items="center"
              gap={14}
              px={8}
              py={10}
              rounded={16}
            >
              <PhotoSlot
                label={a.name}
                shape="circle"
                source={ATHLETE_PHOTOS[a.slotId]}
                style={{ width: 56, height: 56 }}
              />
              <YStack flex={1} minW={0}>
                <XStack items="center" justify="space-between" gap={8}>
                  <Text fontFamily="$semibold" fontSize={16} color="$text" numberOfLines={1}>
                    {a.name}
                  </Text>
                  <Text
                    fontFamily="$medium"
                    fontSize={13}
                    color={t.unread ? '$accentText' : '$muted'}
                  >
                    {formatLabel(t.time)}
                  </Text>
                </XStack>
                <XStack items="center" gap={8} mt={2}>
                  <Text
                    flex={1}
                    fontFamily={t.unread ? '$semibold' : '$body'}
                    fontSize={14}
                    color={t.unread ? '$text' : '$muted'}
                    numberOfLines={1}
                  >
                    {t.lastMsg}
                  </Text>
                  {t.unread ? <XStack width={10} height={10} rounded={5} bg="$accent" /> : null}
                </XStack>
              </YStack>
            </XStack>
          );
        })}
      </YStack>
    </ScrollView>
  );
}
