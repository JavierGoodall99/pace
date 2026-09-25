import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, PanResponder, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { ActivityPanel } from '../../src/components/ActivityPanel';
import { Icon } from '../../src/components/Icon';
import { PhotoSlot } from '../../src/components/PhotoSlot';
import { Button, Chip, EmptyState, IconButton } from '../../src/components/ui';
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
import { colors, fonts, formatLabel, shadow } from '../../src/theme/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.28;
const SWIPE_OUT_DURATION = 240;
const CARD_WIDTH = SCREEN_WIDTH - 40;

// The swipe card is driven by RN's Animated API, so its frame styles
// are plain ViewStyle objects (hex colors, not `$` tokens).
const CARD_STYLE: ViewStyle = {
  position: 'absolute',
  width: CARD_WIDTH,
  height: '96%',
  borderRadius: 28,
  overflow: 'hidden',
  backgroundColor: colors.surface,
  ...shadow.raised,
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

  function pressPass() {
    if (current) setExit('pass');
  }

  return (
    <YStack flex={1} bg="$canvas">
      <XStack px={20} pb={4} pt={insets.top + 12} items="center" justify="space-between">
        <YStack>
          <Text fontFamily="$bold" fontSize={28} lineHeight={34} letterSpacing={-0.5} color="$text">
            Discover
          </Text>
          <Text fontFamily="$medium" fontSize={14} color="$muted" mt={2}>
            {queue.length} {queue.length === 1 ? 'person' : 'people'} to meet today
          </Text>
        </YStack>
        <XStack items="center" gap={8}>
          {streak > 0 ? (
            <XStack items="center" gap={4} height={40} px={12} rounded="$full" bg="$accentSoft">
              <Icon name="zap" size={15} color={colors.accent} strokeWidth={2} />
              <Text fontFamily="$semibold" fontSize={14} color="$accent">
                {streak}
              </Text>
            </XStack>
          ) : null}
          <YStack>
            <IconButton
              size={40}
              onPress={() => router.push('/discover-filters')}
              accessibilityLabel="Filters"
            >
              <Icon name="sliders" size={18} color={colors.text} />
            </IconButton>
            {filtersActive ? (
              <YStack
                position="absolute"
                t={2}
                r={2}
                width={10}
                height={10}
                rounded={5}
                bg="$accent"
                borderWidth={2}
                borderColor="$canvas"
              />
            ) : null}
          </YStack>
        </XStack>
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
          <EmptyState
            icon="sparkles"
            title="You're all caught up"
            body="You've seen everyone who trains this way. Widen your filters or check back tomorrow."
            action={<Button onPress={resetDeck}>Start over</Button>}
          />
        ) : (
          <>
            {next2 ? (
              <NextCard athlete={next2} depth={2} onOpenProfile={() => openProfile(next2)} />
            ) : null}
            {next ? (
              <NextCard athlete={next} depth={1} onOpenProfile={() => openProfile(next)} />
            ) : null}
            {current ? (
              <SwipeCard
                key={current.id}
                athlete={current}
                exit={exit}
                onSwiped={(dir) => commitSwipe(current, dir)}
                onLike={pressLike}
                onPass={pressPass}
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
  onPass,
  onOpenProfile,
}: {
  athlete: Athlete;
  exit: SwipeDirection | null;
  onSwiped: (direction: SwipeDirection) => void;
  onLike: () => void;
  onPass: () => void;
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
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > 6 || Math.abs(gesture.dy) > 6,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
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
  const likeOpacity = pan.x.interpolate({
    inputRange: [20, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const passOpacity = pan.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, -20],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
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

      <Animated.View
        pointerEvents="none"
        style={[styles.stamp, styles.likeStamp, { opacity: likeOpacity }]}
      >
        <Text style={[styles.stampText, { color: colors.success, borderColor: colors.success }]}>
          Like
        </Text>
      </Animated.View>
      <Animated.View
        pointerEvents="none"
        style={[styles.stamp, styles.passStamp, { opacity: passOpacity }]}
      >
        <Text style={[styles.stampText, { color: colors.text, borderColor: colors.text }]}>
          Nope
        </Text>
      </Animated.View>

      {/* Bottom scrim so white type stays readable on any photo. */}
      <YStack pointerEvents="none" position="absolute" l={0} r={0} b={0} height={260}>
        <Svg width="100%" height="100%">
          <Defs>
            <LinearGradient id="photoFade" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#1C1917" stopOpacity={0} />
              <Stop offset="0.5" stopColor="#1C1917" stopOpacity={0.45} />
              <Stop offset="1" stopColor="#1C1917" stopOpacity={0.8} />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#photoFade)" />
        </Svg>
      </YStack>

      <YStack position="absolute" l={0} r={0} b={0} px={18} pt={12} pb={18}>
        <YStack mb={14}>
          <XStack items="center" gap={8}>
            <Text
              fontFamily="$bold"
              fontSize={26}
              lineHeight={32}
              letterSpacing={-0.3}
              color="$onPhoto"
            >
              {athlete.name}, {athlete.age}
            </Text>
            {athlete.verified ? (
              <Icon name="shield-check" size={20} color={colors.onPhoto} strokeWidth={2} />
            ) : null}
          </XStack>
          <XStack items="center" gap={5} mt={4}>
            <Icon name="map-pin" size={14} color="rgba(255,255,255,0.85)" />
            <Text fontFamily="$medium" fontSize={14} color="rgba(255,255,255,0.85)">
              {athlete.city} · {formatLabel(athlete.pace)}
            </Text>
          </XStack>
        </YStack>
        <ActivityPanel
          tags={tagsForDiscipline(athlete.discipline)}
          onLike={onLike}
          likeLabel={`Like ${athlete.name}`}
          onPass={onPass}
          passLabel={`Pass on ${athlete.name}`}
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

const styles = {
  stamp: {
    position: 'absolute' as const,
    top: 28,
    padding: 8,
  },
  likeStamp: { left: 20 },
  passStamp: { right: 20 },
  stampText: {
    fontFamily: fonts.extrabold,
    fontSize: 22,
    borderWidth: 3,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 2,
    overflow: 'hidden' as const,
    backgroundColor: 'rgba(255,255,255,0.9)',
    transform: [{ rotate: '-12deg' }],
  },
};
