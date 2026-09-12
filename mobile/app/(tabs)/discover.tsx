import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
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
import { colors, fonts } from '../../src/theme/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.28;
const SWIPE_OUT_DURATION = 240;
const CARD_WIDTH = SCREEN_WIDTH - 40;

type SwipeDirection = 'like' | 'pass';

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

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
        (a) => (filters.length === 0 || filters.includes(a.discipline)) && !(a.id in swiped)
      ),
    [filters, swiped]
  );

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

  const current = queue[0];
  const next = queue[1];
  const next2 = queue[2];
  const exhausted = !current;

  function pressLike() {
    if (current) setExit('like');
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View>
          <Text style={styles.eyebrow}>FOUNDING COHORT · BATCH 01</Text>
          <Text style={styles.title}>Discover</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.streakRow}>
            <Icon name="zap" size={13} color={streak > 0 ? colors.ember : colors.fog} />
            <Text style={[styles.streakText, { color: streak > 0 ? colors.ember : colors.fog }]}>{streak}</Text>
          </View>
          <Text style={styles.queueLabel}>{queue.length} LEFT TODAY</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipScroller}
        contentContainerStyle={styles.chipRow}
      >
        {DISCIPLINES.map((d) => (
          <Chip key={d} label={d} selected={filters.includes(d)} onPress={() => toggleFilter(d)} />
        ))}
      </ScrollView>

      <View style={styles.stack}>
        {exhausted ? (
          <EmptyState onReset={resetDeck} />
        ) : (
          <>
            {next2 ? <NextCard athlete={next2} depth={2} /> : null}
            {next ? <NextCard athlete={next} depth={1} /> : null}
            {current ? (
              <SwipeCard
                key={current.id}
                athlete={current}
                exit={exit}
                onSwiped={(dir) => commitSwipe(current, dir)}
                onLike={pressLike}
              />
            ) : null}
          </>
        )}
      </View>
    </View>
  );
}

function SwipeCard({
  athlete,
  exit,
  onSwiped,
  onLike,
}: {
  athlete: Athlete;
  exit: SwipeDirection | null;
  onSwiped: (direction: SwipeDirection) => void;
  onLike: () => void;
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
        styles.card,
        { transform: [{ translateX: pan.x }, { translateY }, { rotate }, { scale: enterScale }] },
      ]}
      {...panResponder.panHandlers}
    >
      <PhotoSlot
        label={athlete.name}
        shape="rect"
        source={ATHLETE_ACTION_PHOTOS[athlete.slotId]}
        style={styles.cardPhoto}
      />

      <Animated.View style={[styles.stamp, styles.likeStamp, { opacity: likeOpacity }]}>
        <Text style={[styles.stampText, { color: colors.mint, borderColor: colors.mint }]}>LIKE</Text>
      </Animated.View>
      <Animated.View style={[styles.stamp, styles.passStamp, { opacity: passOpacity }]}>
        <Text style={[styles.stampText, { color: colors.ember, borderColor: colors.ember }]}>PASS</Text>
      </Animated.View>

      <View pointerEvents="none" style={styles.fade}>
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
      </View>

      <View style={styles.panel}>
        <View style={styles.identity}>
          <Text style={styles.panelName}>
            {athlete.name}, {athlete.age}
          </Text>
          <Text style={styles.panelMeta}>{athlete.city}</Text>
        </View>
        <ActivityPanel
          tags={tagsForDiscipline(athlete.discipline)}
          onLike={onLike}
          likeLabel={`Like ${athlete.name}`}
        />
      </View>
    </Animated.View>
  );
}

function NextCard({ athlete, depth }: { athlete: Athlete; depth: 1 | 2 }) {
  const style = depth === 1 ? styles.nextCard : styles.nextCard2;
  return (
    <View style={[styles.card, style]}>
      <PhotoSlot
        label={athlete.name}
        shape="rect"
        source={ATHLETE_ACTION_PHOTOS[athlete.slotId]}
        style={styles.cardPhoto}
      />
    </View>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <View style={styles.empty}>
      <Icon name="shield-check" size={28} color={colors.ember} />
      <Text style={styles.emptyTitle}>All caught up</Text>
      <Text style={styles.emptyBody}>
        You&apos;ve seen every athlete training this way. Widen the search or check back tomorrow.
      </Text>
      <Pressable onPress={onReset} style={styles.emptyButton}>
        <Text style={styles.emptyButtonText}>RESET DECK</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 4,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  eyebrow: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 3, color: colors.ember },
  title: {
    fontFamily: fonts.display,
    fontSize: 32,
    color: colors.bone,
    textTransform: 'uppercase',
    lineHeight: 32,
    marginTop: 8,
  },
  headerRight: { alignItems: 'flex-end', gap: 6, paddingTop: 6 },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  streakText: { fontFamily: fonts.mono, fontSize: 13 },
  queueLabel: { fontFamily: fonts.mono, fontSize: 9, letterSpacing: 1, color: colors.fog },
  chipScroller: { flexGrow: 0 },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  stack: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: {
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
  },
  nextCard: { transform: [{ scale: 0.95 }, { translateY: 10 }], opacity: 0.7 },
  nextCard2: { transform: [{ scale: 0.9 }, { translateY: 20 }], opacity: 0.45 },
  cardPhoto: { width: '100%', height: '100%' },
  // Stats panel sits over the photo's lower third — the photo owns
  // the card, the panel owns the data, joined by the fade above.
  panel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.coal,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
  },
  // Photo fades into the panel: a coal gradient sits behind the panel
  // and extends well above its top edge, so there is no hard dividing
  // line between the photo and the stats.
  fade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 220,
  },
  identity: { marginBottom: 10 },
  panelName: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.bone,
    textTransform: 'uppercase',
    lineHeight: 20,
  },
  panelMeta: { fontFamily: fonts.mono, fontSize: 8.5, letterSpacing: 1, color: colors.fog, marginTop: 4 },
  stamp: {
    position: 'absolute',
    top: 28,
    padding: 8,
  },
  likeStamp: { left: 20 },
  passStamp: { right: 20 },
  stampText: {
    fontFamily: fonts.mono,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 2,
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    transform: [{ rotate: '-12deg' }],
  },
  empty: { alignItems: 'center', paddingHorizontal: 40, gap: 10 },
  emptyTitle: { fontFamily: fonts.display, fontSize: 22, color: colors.bone, textTransform: 'uppercase', marginTop: 8 },
  emptyBody: { color: colors.fog, fontSize: 13, textAlign: 'center', lineHeight: 20 },
  emptyButton: {
    marginTop: 14,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: colors.ember,
  },
  emptyButtonText: { fontFamily: fonts.mono, fontSize: 11, letterSpacing: 2, color: colors.ink, fontWeight: '700' },
});