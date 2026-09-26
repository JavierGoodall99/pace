import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { Image, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { Text, XStack, YStack } from 'tamagui';
import { Icon } from '../../src/components/Icon';
import { Illo } from '../../src/components/Illustrations';
import { athleteById, SPORT_ILLO } from '../../src/data/mockData';
import {
  deleteMoment,
  kudosCount,
  liveMoments,
  markSeen,
  postedAgo,
  timeLeft,
  toggleKudos,
  useMoments,
} from '../../src/data/moments';
import { ATHLETE_PHOTOS, ME_AVATAR } from '../../src/data/photos';
import { useMe } from '../../src/data/session';
import { useSocial } from '../../src/data/social';
import { confirmAction } from '../../src/lib/dialogs';
import { successHaptic } from '../../src/lib/haptics';
import { useColors } from '../../src/theme/appearance';
import { formatLabel } from '../../src/theme/tokens';
import { FEATURES } from '../../src/config';

// Full-screen session moment. Tap right for the next one; kudos is the
// one-tap reaction, and Reply drops a line into your chat.
// Moments are parked for v1 (config FEATURES.moments): the route stays
// but sends anyone who lands here back to Today.
export default function MomentScreenRoute() {
  return FEATURES.moments ? <MomentScreen /> : <Redirect href="/(tabs)/today" />;
}

function MomentScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const me = useMe();
  const { id } = useLocalSearchParams<{ id: string }>();
  const state = useMoments();
  const { matches } = useSocial();
  const now = useMemo(() => new Date(), []);
  const live = liveMoments(state, matches, now);
  const index = live.findIndex((m) => m.id === id);
  const m = live[index];

  useEffect(() => {
    if (m) markSeen(m.id);
  }, [m]);

  if (!m) {
    return (
      <YStack flex={1} bg="#000" items="center" justify="center">
        <Text color="#FFFFFF" onPress={() => router.back()}>
          This moment has ended.
        </Text>
      </YStack>
    );
  }

  const a = typeof m.author === 'number' ? athleteById(m.author) : null;
  const mine = m.author === 'me';
  const name = mine ? 'You' : (a?.name ?? '');
  const face = mine
    ? me.photos[0]
      ? { uri: me.photos[0] }
      : ME_AVATAR
    : a
      ? ATHLETE_PHOTOS[a.slotId]
      : ME_AVATAR;
  const gave = state.myKudos.includes(m.id);

  async function remove() {
    const ok = await confirmAction({
      title: 'Delete moment',
      message: 'Your matches will no longer see this moment. This cannot be undone.',
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!ok) return;
    deleteMoment(m.id);
    router.back();
  }

  function go(delta: number) {
    const next = live[index + delta];
    if (next) router.replace({ pathname: '/moment/[id]', params: { id: next.id } });
    else router.back();
  }

  return (
    <YStack flex={1} bg="#000">
      <Image
        source={m.source}
        resizeMode="cover"
        style={{ position: 'absolute', width: '100%', height: '100%' }}
      />
      <YStack pointerEvents="none" position="absolute" l={0} r={0} t={0} height={180}>
        <Svg width="100%" height="100%">
          <Defs>
            <LinearGradient id="mTop" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#000" stopOpacity={0.55} />
              <Stop offset="1" stopColor="#000" stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#mTop)" />
        </Svg>
      </YStack>
      <YStack pointerEvents="none" position="absolute" l={0} r={0} b={0} height={320}>
        <Svg width="100%" height="100%">
          <Defs>
            <LinearGradient id="mBottom" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#000" stopOpacity={0} />
              <Stop offset="1" stopColor="#000" stopOpacity={0.8} />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#mBottom)" />
        </Svg>
      </YStack>

      <XStack position="absolute" t={0} l={0} r={0} b={0}>
        <Pressable
          accessibilityLabel="Previous"
          onPress={() => go(-1)}
          style={{ width: '35%', height: '100%' }}
        />
        <Pressable
          accessibilityLabel="Next"
          onPress={() => go(1)}
          style={{ flex: 1, height: '100%' }}
        />
      </XStack>

      <YStack
        position="absolute"
        l={16}
        r={16}
        t={insets.top + 10}
        gap={12}
        pointerEvents="box-none"
      >
        <XStack gap={4} pointerEvents="none">
          {live.map((x, k) => (
            <YStack
              key={x.id}
              flex={1}
              height={3}
              rounded={2}
              style={{ backgroundColor: k <= index ? '#FFFFFF' : 'rgba(255,255,255,0.35)' }}
            />
          ))}
        </XStack>
        <XStack items="center" gap={10} pointerEvents="box-none">
          <Image source={face} style={{ width: 36, height: 36, borderRadius: 18 }} />
          <YStack flex={1} pointerEvents="none">
            <Text fontFamily="$semibold" fontSize={15} color="#FFFFFF">
              {name}
            </Text>
            <Text fontSize={12} color="rgba(255,255,255,0.8)">
              {postedAgo(m, now)} · {timeLeft(m, now)}
            </Text>
          </YStack>
          {mine ? (
            <XStack
              accessibilityRole="button"
              accessibilityLabel="Delete moment"
              aria-label="Delete moment"
              onPress={remove}
              width={36}
              height={36}
              rounded={18}
              items="center"
              justify="center"
              bg="rgba(255,255,255,0.18)"
            >
              <Icon name="trash" size={17} color="#FFFFFF" strokeWidth={2.2} />
            </XStack>
          ) : null}
          <XStack
            accessibilityRole="button"
            accessibilityLabel="Close"
            aria-label="Close"
            onPress={() => router.back()}
            width={36}
            height={36}
            rounded={18}
            items="center"
            justify="center"
            bg="rgba(255,255,255,0.18)"
          >
            <Icon name="x" size={18} color="#FFFFFF" strokeWidth={2.2} />
          </XStack>
        </XStack>
      </YStack>

      <YStack
        position="absolute"
        l={20}
        r={20}
        b={insets.bottom + 20}
        gap={14}
        pointerEvents="box-none"
      >
        <XStack items="center" gap={8} pointerEvents="none">
          <XStack
            items="center"
            gap={6}
            height={30}
            px={10}
            rounded="$full"
            bg="rgba(255,255,255,0.9)"
          >
            <Illo name={SPORT_ILLO[m.activity]} size={20} />
            <Text fontFamily="$semibold" fontSize={13} color="#1C1917">
              {formatLabel(m.activity)}
              {m.stat ? ` · ${m.stat}` : ''}
            </Text>
          </XStack>
        </XStack>
        {m.caption ? (
          <Text
            fontFamily="$display"
            fontSize={28}
            lineHeight={33}
            color="#FFFFFF"
            pointerEvents="none"
          >
            {m.caption}
          </Text>
        ) : null}
        <XStack gap={10}>
          <XStack
            accessibilityRole="button"
            accessibilityLabel={gave ? 'Remove kudos' : 'Give kudos'}
            aria-label={gave ? 'Remove kudos' : 'Give kudos'}
            onPress={() => {
              if (mine) return;
              if (!gave) successHaptic();
              toggleKudos(m.id);
            }}
            height={48}
            px={18}
            gap={8}
            rounded="$full"
            items="center"
            style={{ backgroundColor: gave ? c.accent : 'rgba(255,255,255,0.18)' }}
          >
            <Icon name="zap" size={18} color="#FFFFFF" filled={gave} strokeWidth={2} />
            <Text fontFamily="$semibold" fontSize={15} color="#FFFFFF">
              {mine
                ? `${kudosCount(state, m)} kudos`
                : gave
                  ? `Kudos · ${kudosCount(state, m)}`
                  : 'Give kudos'}
            </Text>
          </XStack>
          {!mine && a ? (
            <XStack
              flex={1}
              accessibilityRole="button"
              onPress={() =>
                router.replace({
                  pathname: '/thread/[athleteId]',
                  params: {
                    athleteId: String(a.id),
                    draft: `Saw your moment: “${m.caption}” — `,
                  },
                })
              }
              height={48}
              gap={8}
              rounded="$full"
              items="center"
              justify="center"
              bg="rgba(255,255,255,0.9)"
            >
              <Icon name="message-circle" size={18} color="#1C1917" />
              <Text fontFamily="$semibold" fontSize={15} color="#1C1917">
                Reply
              </Text>
            </XStack>
          ) : null}
        </XStack>
      </YStack>
    </YStack>
  );
}
