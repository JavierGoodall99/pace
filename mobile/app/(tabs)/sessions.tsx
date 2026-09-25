import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { PickRow, SessionCard } from '../../src/components/Sessions';
import { useTabBarSpace } from '../../src/components/TabBar';
import { Button, DisplayTitle, EmptyState } from '../../src/components/ui';
import { levelLabel } from '../../src/data/athleteDepth';
import { athleteById } from '../../src/data/mockData';
import { cityDistanceKm } from '../../src/data/places';
import { OpenSession, usePlans } from '../../src/data/plans';
import { useMe } from '../../src/data/session';
import { useSocial } from '../../src/data/social';

// Open sessions: training plans anyone can ask to join. Group sessions
// double as low-pressure first meets — you're never alone with a
// stranger, and you were going to train anyway.

type Filter = 'All' | 'Near me' | 'Group' | '1-on-1';
const FILTERS: Filter[] = ['All', 'Near me', 'Group', '1-on-1'];

export function sessionMeta(o: OpenSession): string {
  const host = o.hostId === 'me' ? 'You' : (athleteById(o.hostId)?.name ?? 'Someone');
  const left = Math.max(0, o.spots - o.joined.length);
  const size =
    o.spots > 1
      ? `Group · ${left} of ${o.spots} spots left`
      : left
        ? '1-on-1 · open'
        : '1-on-1 · taken';
  return `Hosted by ${host} · ${size} · ${o.distance} · ${levelLabel(o.level)}`;
}

export default function SessionsScreen() {
  const insets = useSafeAreaInsets();
  const tabBarSpace = useTabBarSpace();
  const router = useRouter();
  const me = useMe();
  const { blocked } = useSocial();
  const { open } = usePlans();
  const [filter, setFilter] = useState<Filter>('All');
  const [now] = useState(() => Date.now());

  const list = useMemo(() => {
    return open
      .filter((o) => new Date(o.date).getTime() > now - 3600000)
      .filter((o) => o.hostId === 'me' || !blocked.includes(o.hostId as number))
      .filter((o) =>
        filter === 'Near me'
          ? cityDistanceKm(me.city, o.city) <= 60
          : filter === 'Group'
            ? o.spots > 1
            : filter === '1-on-1'
              ? o.spots === 1
              : true
      )
      .sort(
        (a, b) =>
          cityDistanceKm(me.city, a.city) - cityDistanceKm(me.city, b.city) ||
          a.date.localeCompare(b.date)
      );
  }, [open, filter, me.city, blocked, now]);

  return (
    <ScrollView
      flex={1}
      bg="$canvas"
      contentContainerStyle={{ pt: insets.top + 8, pb: tabBarSpace + 16 }}
    >
      <YStack px={20} gap={4}>
        <DisplayTitle size={42}>Open *sessions*</DisplayTitle>
        <Text fontSize={15} lineHeight={22} color="$muted">
          Join a run, ride or climb. Group sessions make easy first meets.
        </Text>
      </YStack>

      <YStack px={20} mt={16} gap={14}>
        <Button icon="plus" onPress={() => router.push('/session-new')} style={{ width: '100%' }}>
          Host a session
        </Button>
        <PickRow options={FILTERS} value={filter} onChange={setFilter} />

        {list.length === 0 ? (
          <YStack mt={30}>
            <EmptyState
              icon="map"
              title="Nothing here yet"
              body="Try another filter, or host your own — people nearby will see it."
            />
          </YStack>
        ) : null}

        {list.map((o) => {
          const km = cityDistanceKm(me.city, o.city);
          return (
            <SessionCard
              key={o.id}
              title={o.title}
              activity={o.activity}
              date={o.date}
              place={o.place}
              athleteId={o.hostId === 'me' ? undefined : o.hostId}
              meta={`${sessionMeta(o)}${km > 0 ? ` · ${o.city}` : ''}`}
              onPress={() => router.push({ pathname: '/session/[id]', params: { id: o.id } })}
            >
              {o.joined.includes('me') || o.hostId === 'me' ? (
                <XStack items="center" gap={6}>
                  <YStack width={8} height={8} rounded={4} bg="$success" />
                  <Text fontFamily="$semibold" fontSize={13} color="$success">
                    {o.hostId === 'me' ? 'You’re hosting' : 'You’re going'}
                  </Text>
                </XStack>
              ) : null}
            </SessionCard>
          );
        })}
      </YStack>
    </ScrollView>
  );
}
