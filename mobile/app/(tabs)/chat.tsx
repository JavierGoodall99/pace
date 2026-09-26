import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { NotificationBell } from '../../src/components/NotificationBell';
import { Icon, IconName } from '../../src/components/Icon';
import { PhotoSlot } from '../../src/components/PhotoSlot';
import { useTabBarSpace } from '../../src/components/TabBar';
import { useNow } from '../../src/lib/useNow';
import { Button, DisplayTitle, EmptyState } from '../../src/components/ui';
import { depthFor } from '../../src/data/athleteDepth';
import { activeMatches, messagesWith, previewOf, useChat } from '../../src/data/chat';
import { agoShort } from '../../src/data/dates';
import { athleteById, CHAT_THREADS } from '../../src/data/mockData';
import { useMe } from '../../src/data/session';
import { expiryLabel, matchHoursLeft } from '../../src/data/trust';
import { ATHLETE_PHOTOS } from '../../src/data/photos';
import { useSocial } from '../../src/data/social';
import { useColors } from '../../src/theme/appearance';
import { formatLabel } from '../../src/theme/tokens';

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const tabBarSpace = useTabBarSpace();
  const router = useRouter();
  const social = useSocial();
  const { likes, matchedAt } = social;
  const now = useNow();
  const chat = useChat();
  const me = useMe();
  // Every match with messages is a thread; matches without any sit in
  // the "New matches" row until someone says hi.
  const ids = activeMatches(social, chat, now);
  const threads = ids
    .filter((id) => messagesWith(chat, id).length > 0)
    .map((athleteId) => {
      const msgs = messagesWith(chat, athleteId);
      const last = msgs[msgs.length - 1];
      const seeded = CHAT_THREADS.find((t) => t.athleteId === athleteId);
      return {
        id: athleteId,
        athleteId,
        lastMsg: previewOf(last),
        at: last.at ?? '',
        time: last.at ? agoShort(last.at, now) : (seeded?.time ?? ''),
        unread: last.at ? last.from === 'them' : !!seeded?.unread,
        yourTurn: last.from === 'them',
      };
    })
    .sort((a, b) => b.at.localeCompare(a.at));
  // Silent matches expire after MATCH_TTL_DAYS so nobody sits on a pile
  // of matches that never talk.
  const fresh = ids
    .filter((id) => messagesWith(chat, id).length === 0)
    .map((id) => ({ id, hours: matchedAt[id] ? matchHoursLeft(matchedAt[id], now) : null }));

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
        <NotificationBell />
      </XStack>

      <XStack gap={10} px={20} pt={4} pb={12}>
        <QuickLink
          icon="heart"
          label="Liked you"
          count={likes.length}
          highlight={likes.length > 0}
          onPress={() => router.push('/likes')}
        />
        <QuickLink
          icon="users"
          label="Matches"
          count={ids.length}
          onPress={() => router.push('/matches')}
        />
      </XStack>

      {fresh.length ? (
        <YStack pt={6} pb={8} gap={10}>
          <Text fontFamily="$semibold" fontSize={15} color="$text" px={20}>
            New matches
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ px: 20, gap: 14 }}
          >
            {fresh.map(({ id, hours }) => {
              const a = athleteById(id);
              if (!a) return null;
              const herMove = depthFor(a).womenFirst && me.gender === 'man';
              const myMove = me.womenFirst && me.gender === 'woman';
              return (
                <YStack
                  key={id}
                  items="center"
                  gap={6}
                  width={76}
                  onPress={() =>
                    router.push({
                      pathname: '/thread/[athleteId]',
                      params: { athleteId: String(id) },
                    })
                  }
                  accessibilityRole="button"
                >
                  <YStack p={3} rounded={40} borderWidth={2} borderColor="$accent">
                    <PhotoSlot
                      label={a.name}
                      shape="circle"
                      source={ATHLETE_PHOTOS[a.slotId]}
                      style={{ width: 64, height: 64 }}
                    />
                  </YStack>
                  <Text fontFamily="$semibold" fontSize={13} color="$text" numberOfLines={1}>
                    {a.name}
                  </Text>
                  <Text fontSize={11} color="$muted" numberOfLines={1}>
                    {hours !== null
                      ? expiryLabel(hours)
                      : herMove
                        ? 'Her move'
                        : myMove
                          ? 'Your move'
                          : 'Say hi'}
                  </Text>
                </YStack>
              );
            })}
          </ScrollView>
        </YStack>
      ) : null}

      {threads.length === 0 && fresh.length === 0 ? (
        <YStack mt={40}>
          <EmptyState
            mood="happy"
            title="No chats yet"
            body="When you match with someone, your conversation starts here."
            action={
              <Button icon="sparkles" onPress={() => router.push('/(tabs)/discover')}>
                See today’s picks
              </Button>
            }
          />
        </YStack>
      ) : null}

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
                  {t.yourTurn ? (
                    <XStack height={22} px={8} rounded="$full" items="center" bg="$accentSoft">
                      <Text fontFamily="$semibold" fontSize={11} color="$accentText">
                        Your turn
                      </Text>
                    </XStack>
                  ) : t.unread ? (
                    <XStack width={10} height={10} rounded={5} bg="$accent" />
                  ) : null}
                </XStack>
              </YStack>
            </XStack>
          );
        })}
      </YStack>
    </ScrollView>
  );
}

// Likes and matches live here, next to the conversations they lead to.
function QuickLink({
  icon,
  label,
  count,
  highlight = false,
  onPress,
}: {
  icon: IconName;
  label: string;
  count: number;
  highlight?: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <XStack
      flex={1}
      accessibilityRole="button"
      onPress={onPress}
      pressStyle={{ opacity: 0.8 }}
      items="center"
      gap={12}
      p={14}
      rounded={20}
      borderWidth={1}
      borderColor={highlight ? '$accentBorder' : '$border'}
      bg={highlight ? '$accentSoft' : '$card'}
    >
      <XStack
        width={40}
        height={40}
        rounded={12}
        items="center"
        justify="center"
        bg={highlight ? '$card' : '$surface'}
      >
        <Icon
          name={icon}
          size={20}
          color={highlight ? colors.accentText : colors.text}
          filled={highlight && icon === 'heart'}
        />
      </XStack>
      <YStack flex={1}>
        <Text
          fontFamily="$bold"
          fontSize={18}
          lineHeight={22}
          color={highlight ? '$accentText' : '$text'}
        >
          {count}
        </Text>
        <Text fontSize={13} color="$muted">
          {label}
        </Text>
      </YStack>
      <Icon name="chevron-right" size={18} color={colors.muted} />
    </XStack>
  );
}
