import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { Icon } from '../src/components/Icon';
import { PhotoSlot } from '../src/components/PhotoSlot';
import { IconButton } from '../src/components/ui';
import { athleteById, AppNotification, NOTIFICATIONS } from '../src/data/mockData';
import { ATHLETE_PHOTOS } from '../src/data/photos';
import { colors } from '../src/theme/tokens';

const GROUPS: AppNotification['group'][] = ['TODAY', 'EARLIER'];

function routeFor(n: AppNotification): Href {
  switch (n.kind) {
    case 'message':
      return { pathname: '/thread/[athleteId]', params: { athleteId: String(n.athleteId) } };
    case 'match':
      return { pathname: '/match/[athleteId]', params: { athleteId: String(n.athleteId) } };
    default:
      return { pathname: '/athlete/[id]', params: { id: String(n.athleteId) } };
  }
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [unread, setUnread] = useState<Record<number, boolean>>(
    Object.fromEntries(NOTIFICATIONS.filter((n) => n.unread).map((n) => [n.id, true]))
  );

  const unreadCount = Object.keys(unread).length;

  return (
    <ScrollView
      flex={1}
      bg="$ink"
      contentContainerStyle={{ pt: insets.top + 8, pb: insets.bottom + 24 }}
    >
      <XStack items="center" gap={12} px={20} pb={10}>
        <IconButton size={40} onPress={() => router.back()}>
          <Icon name="chevron-left" size={14} color={colors.bone} />
        </IconButton>
        <Text flex={1} fontFamily="$display" fontSize={30} color="$bone" textTransform="uppercase" lineHeight={30}>
          Notifications
        </Text>
        {unreadCount > 0 ? (
          <XStack onPress={() => setUnread({})} hitSlop={8} py={4}>
            <Text fontFamily="$mono" fontSize={9} letterSpacing={1.5} color="$ember">
              MARK ALL READ
            </Text>
          </XStack>
        ) : null}
      </XStack>

      {unreadCount > 0 ? (
        <XStack items="center" gap={8} mx={20} mb={6}>
          <XStack width={7} height={7} rounded={4} bg="$ember" />
          <Text fontFamily="$mono" fontSize={10} letterSpacing={1.5} color="$fog" textTransform="uppercase">
            {unreadCount} new update{unreadCount === 1 ? '' : 's'}
          </Text>
        </XStack>
      ) : null}

      {GROUPS.map((group) => {
        const items = NOTIFICATIONS.filter((n) => n.group === group);
        if (items.length === 0) return null;
        return (
          <YStack key={group}>
            <Text fontFamily="$mono" fontSize={10} letterSpacing={3} color="$ember" mx={20} mt={18} mb={10}>
              {group}
            </Text>
            <YStack mx={20} rounded={20} borderWidth={1} borderColor="$line" bg="$ash" overflow="hidden">
              {items.map((n, i) => {
                const a = athleteById(n.athleteId);
                if (!a) return null;
                const isUnread = !!unread[n.id];
                return (
                  <XStack
                    key={n.id}
                    onPress={() => {
                      if (isUnread) {
                        setUnread((prev) => ({ ...prev, [n.id]: false }));
                      }
                      router.push(routeFor(n));
                    }}
                    pressStyle={{ opacity: 0.7 }}
                    items="center"
                    gap={12}
                    px={14}
                    py={12}
                    borderBottomWidth={i === items.length - 1 ? 0 : 0.5}
                    borderBottomColor="$line"
                  >
                    <PhotoSlot label={a.name} shape="circle" source={ATHLETE_PHOTOS[a.slotId]} style={{ width: 44, height: 44 }} />
                    <YStack flex={1} minW={0}>
                      <Text fontSize={13} lineHeight={18} numberOfLines={2}>
                        <Text fontFamily="$mono" fontWeight="700" fontSize={12} letterSpacing={0.5} color="$bone" textTransform="uppercase">
                          {a.name}
                        </Text>
                        <Text color="$fog"> {n.text}</Text>
                      </Text>
                    </YStack>
                    <YStack items="flex-end" gap={8}>
                      <Text fontFamily="$mono" fontSize={10} color="$fog">
                        {n.time}
                      </Text>
                      {isUnread ? <XStack width={8} height={8} rounded={4} bg="$ember" /> : null}
                    </YStack>
                  </XStack>
                );
              })}
            </YStack>
          </YStack>
        );
      })}
    </ScrollView>
  );
}