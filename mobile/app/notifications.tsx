import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { Icon, IconName } from '../src/components/Icon';
import { PhotoSlot } from '../src/components/PhotoSlot';
import { Card, ScreenHeader, SectionTitle, TextAction } from '../src/components/ui';
import { athleteById, AppNotification, NOTIFICATIONS } from '../src/data/mockData';
import { ATHLETE_PHOTOS } from '../src/data/photos';
import { colors, formatLabel } from '../src/theme/tokens';

const GROUPS: AppNotification['group'][] = ['TODAY', 'EARLIER'];

const KIND_ICON: Record<AppNotification['kind'], IconName> = {
  kudos: 'heart',
  message: 'message-circle',
  match: 'sparkles',
  invite: 'calendar',
  comment: 'message-circle',
};

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
    <ScrollView flex={1} bg="$canvas" contentContainerStyle={{ pb: insets.bottom + 32 }}>
      <ScreenHeader
        title="Notifications"
        subtitle={
          unreadCount > 0
            ? `${unreadCount} new update${unreadCount === 1 ? '' : 's'}`
            : 'You’re all caught up'
        }
        onBack={() => router.back()}
        action={
          unreadCount > 0 ? (
            <TextAction onPress={() => setUnread({})}>Mark all read</TextAction>
          ) : null
        }
      />

      {GROUPS.map((group) => {
        const items = NOTIFICATIONS.filter((n) => n.group === group);
        if (items.length === 0) return null;
        return (
          <YStack key={group} px={20} mt={24}>
            <SectionTitle>{formatLabel(group)}</SectionTitle>
            <Card px={0}>
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
                    pressStyle={{ bg: '$surface' }}
                    items="center"
                    gap={12}
                    px={16}
                    py={14}
                    bg={isUnread ? '$accentSoft' : 'transparent'}
                    borderBottomWidth={i === items.length - 1 ? 0 : 1}
                    borderBottomColor="$border"
                  >
                    <YStack>
                      <PhotoSlot
                        label={a.name}
                        shape="circle"
                        source={ATHLETE_PHOTOS[a.slotId]}
                        style={{ width: 48, height: 48 }}
                      />
                      <XStack
                        position="absolute"
                        r={-4}
                        b={-4}
                        width={24}
                        height={24}
                        rounded={12}
                        bg="$accent"
                        borderWidth={2}
                        borderColor="$card"
                        items="center"
                        justify="center"
                      >
                        <Icon
                          name={KIND_ICON[n.kind]}
                          size={12}
                          color={colors.onAccent}
                          strokeWidth={2.4}
                        />
                      </XStack>
                    </YStack>
                    <YStack flex={1} minW={0}>
                      <Text fontSize={15} lineHeight={21} color="$text" numberOfLines={2}>
                        <Text fontFamily="$semibold" color="$text">
                          {a.name}
                        </Text>{' '}
                        {n.text}
                      </Text>
                      <Text fontSize={13} color="$muted" mt={2}>
                        {formatLabel(n.time)}
                      </Text>
                    </YStack>
                    {isUnread ? <XStack width={10} height={10} rounded={5} bg="$accent" /> : null}
                  </XStack>
                );
              })}
            </Card>
          </YStack>
        );
      })}
    </ScrollView>
  );
}
