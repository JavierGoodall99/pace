import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, PanResponder, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { ActivityPanel } from '../../src/components/ActivityPanel';
import { Icon } from '../../src/components/Icon';
import { PhotoSlot } from '../../src/components/PhotoSlot';
import { Chip } from '../../src/components/ui';
import {
  ATHLETES,
  Athlete,
  DISCIPLINES,
  Discipline,
  MATCH_IDS,
  tagsForDiscipline,
} from '../../src/data/mockData';
import { ATHLETE_ACTION_PHOTOS } from '../../src/data/photos';
import { cityWithinRadius, useFilters } from '../../src/data/filters';
import { useSocial } from '../../src/data/social';
import { colors } from '../../src/theme/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.28;
const SWIPE_OUT_DURATION = 240;
const CARD_WIDTH = SCREEN_WIDTH - 40;

// The swipe card is driven by RN's Animated API, so its frame styles
// are plain ViewStyle objects (hex colors, not `$` tokens).
const CARD_STYLE: ViewStyle = {
  position: 'absolute',
  width: CARD_WIDTH,
  height: '94%',
  borderRadius: 26,
  overflow: 'hidden',
  borderWidth: 1,
  borderColor: colors.line,
  backgroundColor: colors.ash,
  shadowColor: '#000',
  shadowOpacity: 0.5,
  shadowRadius: 24,
  shadowOffset: { width: 0, height: 12 },
  elevation: 12,
};
const NEXT_CARD_STYLES: Record<1 | 2, ViewStyle> = {
  1: { ...CARD_STYLE, transform: [{ scale: 0.95 }, { translateY: 10 }], opacity: 0.7 },
  2: { ...CARD_STYLE, transform: [{ scale: 0.9 }, { translateY: 20 }], opacity: 0.45 },
};

type SwipeDirection = 'like' | 'pass';

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const disc = useFilters();
  const { blocked } = useSocial();

  const [filters, setFilters] = useState<Discipline[]>([]);
  const [swiped, setSwiped] = useState<Record<number, SwipeDirection>>({});
  const [streak, setStreak] = useState(0);
  // When the card's like button is pressed, signal the top card to
  // animate out the same way a manual swipe does instead of vanishing
  // instantly.
  const [exit, setExit] = useState<SwipeDirection | null>(null);

  const queue = useMemo(
    () =>
      ATHLETES.filter(
        (a) =>
          (filters.length === 0 || filters.includes(a.discipline)) &&
          !(a.id in swiped) &&
          !blocked.includes(a.id) &&
          a.age >= disc.ageMin &&
          a.age <= disc.ageMax &&
          (!disc.verifiedOnly || a.verified) &&
          cityWithinRadius(a.city, disc.radiusKm)
      ),
    [filters, swiped, disc, blocked]
  );

  const filtersActive =
    disc.ageMin > 18 ||
    disc.ageMax < 60 ||
    disc.radiusKm != null ||
    disc.verifiedOnly ||
    disc.times.length > 0;

  function toggleFilter(d: Discipline) {
    setFilters((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  }

  function commitSwipe(athlete: Athlete, direction: SwipeDirection) {
    setExit(null);
    setSwiped((prev) => ({ ...prev, [athlete.id]: direction }));
    if (direction === 'like') {
      setStreak((s) => s + 1);
      if (MATCH_IDS.includes(athlete.id)) {
        router.push({ pathname: '/match/[athleteId]', params: { athleteId: String(athlete.id) } });
      }
    } else {
      setStreak(0);
    }
  }

  function resetDeck() {
    setSwiped({});
    setStreak(0);
  }

  function openProfile(a: Athlete) {
    router.push({ pathname: '/athlete/[id]', params: { id: String(a.id) } });
  }

  const current = queue[0];
  const next = queue[1];
  const next2 = queue[2];
  const exhausted = !current;

  function pressLike() {
    if (current) setExit('like');
  }

  return (
    <YStack flex={1} bg="$ink">
      <XStack px={20} pb={4} pt={insets.top + 12} items="flex-start" justify="space-between">
        <YStack>
          <Text fontFamily="$mono" fontSize={10} letterSpacing={3} color="$ember">
            FOUNDING COHORT · BATCH 01
          </Text>
          <Text fontFamily="$display" fontSize={32} color="$bone" textTransform="uppercase" lineHeight={32} mt={8}>
            Discover
          </Text>
        </YStack>
        <YStack items="flex-end" gap={6} pt={6}>
          <XStack items="center" gap={5}>
            <Icon name="zap" size={13} color={streak > 0 ? colors.ember : colors.fog} />
            <Text fontFamily="$mono" fontSize={13} color={streak > 0 ? '$ember' : '$fog'}>
              {streak}
            </Text>
          </XStack>
          <XStack onPress={() => router.push('/discover-filters')} items="center" gap={5} py={2} px={2}>
            <Icon name="settings" size={12} color={filtersActive ? colors.ember : colors.fog} />
            <Text fontFamily="$mono" fontSize={9} letterSpacing={1} color={filtersActive ? '$ember' : '$fog'}>
              FILTERS
            </Text>
          </XStack>
          <Text fontFamily="$mono" fontSize={9} letterSpacing={1} color="$fog">
            {queue.length} LEFT TODAY
          </Text>
        </YStack>
      </XStack>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        grow={0}
        contentContainerStyle={{ flexDirection: 'row', gap: 8, px: 20, py: 12 }}
      >
        {DISCIPLINES.map((d) => (
          <Chip key={d} label={d} selected={filters.includes(d)} onPress={() => toggleFilter(d)} />
        ))}
      </ScrollView>

      <YStack flex={1} items="center" justify="center">
        {exhausted ? (
          <EmptyState onReset={resetDeck} />
        ) : (
          <>
            {next2 ? <NextCard athlete={next2} depth={2} onOpenProfile={() => openProfile(next2)} /> : null}
            {next ? <NextCard athlete={next} depth={1} onOpenProfile={() => openProfile(next)} /> : null}
            {current ? (
              <SwipeCard
                key={current.id}
                athlete={current}
                exit={exit}
                onSwiped={(dir) => commitSwipe(current, dir)}
                onLike={pressLike}
                onOpenProfile={() => openProfile(current)}
              />
            ) : null}
          </>
        )}
      </YStack>
    </YStack>
  );
}

function SwipeCard({
  athlete,
  exit,
  onSwiped,
  onLike,
  onOpenProfile,
}: {
  athlete: Athlete;
  exit: SwipeDirection | null;
  onSwiped: (direction: SwipeDirection) => void;
  onLike: () => void;
  onOpenProfile: () => void;
}) {
  const pan = useRef(new Animated.ValueXY()).current;
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(enter, { toValue: 1, duration: 210, useNativeDriver: false }).start();
  }, [enter]);

  useEffect(() => {
    if (exit) forceSwipeFromRef(exit);
  }, [exit]);

  function forceSwipeFromRef(direction: SwipeDirection) {
    const x = direction === 'like' ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;
    Animated.timing(pan, {
      toValue: { x, y: 0 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: false,
    }).start(() => onSwiped(direction));
  }

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 6 || Math.abs(gesture.dy) > 6,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          forceSwipeFromRef('like');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          forceSwipeFromRef('pass');
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  function resetPosition() {
    Animated.spring(pan, { toValue: { x: 0, y: 0 }, friction: 6, useNativeDriver: false }).start();
  }

  const rotate = pan.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-14deg', '0deg', '14deg'],
  });
  const likeOpacity = pan.x.interpolate({ inputRange: [20, SWIPE_THRESHOLD], outputRange: [0, 1], extrapolate: 'clamp' });
  const passOpacity = pan.x.interpolate({ inputRange: [-SWIPE_THRESHOLD, -20], outputRange: [1, 0], extrapolate: 'clamp' });
  const enterSlide = enter.interpolate({ inputRange: [0, 1], outputRange: [16, 0] });
  const enterScale = enter.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1] });
  const translateY = Animated.add(pan.y, enterSlide);

  return (
    <Animated.View
      style={[
        CARD_STYLE,
        { transform: [{ translateX: pan.x }, { translateY }, { rotate }, { scale: enterScale }] },
      ]}
      {...panResponder.panHandlers}
    >
      <YStack
        accessibilityRole="button"
        accessibilityLabel={`View ${athlete.name}'s profile`}
        onPress={onOpenProfile}
        pressStyle={{ opacity: 0.9 }}
        width="100%"
        height="100%"
      >
        <PhotoSlot
          label={athlete.name}
          shape="rect"
          source={ATHLETE_ACTION_PHOTOS[athlete.slotId]}
          style={{ width: '100%', height: '100%' }}
        />
      </YStack>

      <Animated.View pointerEvents="none" style={[styles.stamp, styles.likeStamp, { opacity: likeOpacity }]}>
        <Text style={[styles.stampText, { color: colors.mint, borderColor: colors.mint }]}>LIKE</Text>
      </Animated.View>
      <Animated.View pointerEvents="none" style={[styles.stamp, styles.passStamp, { opacity: passOpacity }]}>
        <Text style={[styles.stampText, { color: colors.ember, borderColor: colors.ember }]}>PASS</Text>
      </Animated.View>

      <YStack pointerEvents="none" position="absolute" l={0} r={0} b={0} height={220}>
        <Svg width="100%" height="100%">
          <Defs>
            <LinearGradient id="photoFade" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={colors.coal} stopOpacity={0} />
              <Stop offset="0.45" stopColor={colors.coal} stopOpacity={1} />
              <Stop offset="1" stopColor={colors.coal} stopOpacity={1} />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#photoFade)" />
        </Svg>
      </YStack>

      <YStack position="absolute" l={0} r={0} b={0} bg="$coal" px={16} pt={12} pb={14}>
        <YStack mb={10}>
          <Text fontFamily="$display" fontSize={20} color="$bone" textTransform="uppercase" lineHeight={20}>
            {athlete.name}, {athlete.age}
          </Text>
          <Text fontFamily="$mono" fontSize={8.5} letterSpacing={1} color="$fog" mt={4}>
            {athlete.city}
          </Text>
        </YStack>
        <ActivityPanel
          tags={tagsForDiscipline(athlete.discipline)}
          onLike={onLike}
          likeLabel={`Like ${athlete.name}`}
        />
      </YStack>
    </Animated.View>
  );
}

function NextCard({
  athlete,
  depth,
  onOpenProfile,
}: {
  athlete: Athlete;
  depth: 1 | 2;
  onOpenProfile: () => void;
}) {
  return (
    <YStack style={NEXT_CARD_STYLES[depth]}>
      <YStack
        accessibilityRole="button"
        accessibilityLabel={`View ${athlete.name}'s profile`}
        onPress={onOpenProfile}
        pressStyle={{ opacity: 0.9 }}
        width="100%"
        height="100%"
      >
        <PhotoSlot
          label={athlete.name}
          shape="rect"
          source={ATHLETE_ACTION_PHOTOS[athlete.slotId]}
          style={{ width: '100%', height: '100%' }}
        />
      </YStack>
    </YStack>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <YStack items="center" px={40} gap={10}>
      <Icon name="shield-check" size={28} color={colors.ember} />
      <Text fontFamily="$display" fontSize={22} color="$bone" textTransform="uppercase" mt={8}>
        All caught up
      </Text>
      <Text color="$fog" fontSize={13} text="center" lineHeight={20}>
        You&apos;ve seen every athlete training this way. Widen the search or check back tomorrow.
      </Text>
      <XStack onPress={onReset} mt={14} px={24} py={12} rounded={999} bg="$ember">
        <Text fontFamily="$mono" fontSize={11} letterSpacing={2} color="$ink" fontWeight="700">
          RESET DECK
        </Text>
      </XStack>
    </YStack>
  );
}

const styles = {
  stamp: {
    position: 'absolute' as const,
    top: 28,
    padding: 8,
  },
  likeStamp: { left: 20 },
  passStamp: { right: 20 },
  stampText: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 16,
    fontWeight: '700' as const,
    letterSpacing: 2,
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    transform: [{ rotate: '-12deg' }],
  },
};