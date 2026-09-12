import { useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../../src/components/Icon';
import { PhotoSlot } from '../../src/components/PhotoSlot';
import { Badge, Chip, IconButton } from '../../src/components/ui';
import { ATHLETES, Athlete, DISCIPLINES, Discipline, MATCH_IDS } from '../../src/data/mockData';
import { colors, fonts } from '../../src/theme/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.28;
const SWIPE_OUT_DURATION = 240;
const CARD_WIDTH = SCREEN_WIDTH - 40;
const CARD_HEIGHT = CARD_WIDTH * 1.3;

type SwipeDirection = 'like' | 'pass';

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [filters, setFilters] = useState<Discipline[]>([]);
  const [swiped, setSwiped] = useState<Record<number, SwipeDirection>>({});
  const [history, setHistory] = useState<number[]>([]);
  const [streak, setStreak] = useState(0);

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
    setSwiped((prev) => ({ ...prev, [athlete.id]: direction }));
    setHistory((prev) => [...prev, athlete.id]);
    if (direction === 'like') {
      setStreak((s) => s + 1);
      if (MATCH_IDS.includes(athlete.id)) {
        router.push({ pathname: '/match/[athleteId]', params: { athleteId: String(athlete.id) } });
      }
    } else {
      setStreak(0);
    }
  }

  function undo() {
    setHistory((prev) => {
      if (!prev.length) return prev;
      const lastId = prev[prev.length - 1];
      setSwiped((s) => {
        const next = { ...s };
        delete next[lastId];
        return next;
      });
      return prev.slice(0, -1);
    });
  }

  function resetDeck() {
    setSwiped({});
    setHistory([]);
    setStreak(0);
  }

  const current = queue[0];
  const next = queue[1];
  const exhausted = !current;

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

      <View style={styles.chipRow}>
        {DISCIPLINES.map((d) => (
          <Chip key={d} label={d} selected={filters.includes(d)} onPress={() => toggleFilter(d)} />
        ))}
      </View>

      <View style={styles.stack}>
        {exhausted ? (
          <EmptyState onReset={resetDeck} />
        ) : (
          <>
            {next ? <NextCard athlete={next} /> : null}
            {current ? (
              <SwipeCard
                key={current.id}
                athlete={current}
                onSwiped={(dir) => commitSwipe(current, dir)}
                onViewProfile={() =>
                  router.push({ pathname: '/athlete/[id]', params: { id: String(current.id) } })
                }
              />
            ) : null}
          </>
        )}
      </View>

      {!exhausted && current ? (
        <View style={styles.actions}>
          <IconButton size={44} onPress={undo}>
            <Icon name="repeat" size={16} color={colors.fog} />
          </IconButton>
          <Pressable style={[styles.actionButton, styles.passButton]} onPress={() => commitSwipe(current, 'pass')}>
            <Icon name="x" size={22} color={colors.bone} />
          </Pressable>
          <Pressable style={[styles.actionButton, styles.likeButton]} onPress={() => commitSwipe(current, 'like')}>
            <Icon name="heart" size={26} color={colors.ember} />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

function SwipeCard({
  athlete,
  onSwiped,
  onViewProfile,
}: {
  athlete: Athlete;
  onSwiped: (direction: SwipeDirection) => void;
  onViewProfile: () => void;
}) {
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 6 || Math.abs(gesture.dy) > 6,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          forceSwipe('like');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          forceSwipe('pass');
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  function forceSwipe(direction: SwipeDirection) {
    const x = direction === 'like' ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;
    Animated.timing(pan, {
      toValue: { x, y: 0 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: false,
    }).start(() => onSwiped(direction));
  }

  function resetPosition() {
    Animated.spring(pan, { toValue: { x: 0, y: 0 }, friction: 6, useNativeDriver: false }).start();
  }

  const rotate = pan.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-12deg', '0deg', '12deg'],
  });
  const likeOpacity = pan.x.interpolate({ inputRange: [20, SWIPE_THRESHOLD], outputRange: [0, 1], extrapolate: 'clamp' });
  const passOpacity = pan.x.interpolate({ inputRange: [-SWIPE_THRESHOLD, -20], outputRange: [1, 0], extrapolate: 'clamp' });

  return (
    <Animated.View
      style={[
        styles.card,
        { transform: [{ translateX: pan.x }, { translateY: pan.y }, { rotate }] },
      ]}
      {...panResponder.panHandlers}
    >
      <PhotoSlot label={athlete.name} shape="rect" style={styles.cardPhoto} />
      <View style={styles.cardGradient} pointerEvents="none" />

      <View style={styles.verifiedRow} pointerEvents="none">
        <Icon name="shield-check" size={12} color={colors.ember} />
        <Text style={styles.verifiedText}>VERIFIED</Text>
      </View>

      <Animated.View style={[styles.stamp, styles.likeStamp, { opacity: likeOpacity }]}>
        <Text style={[styles.stampText, { color: colors.mint, borderColor: colors.mint }]}>LIKE</Text>
      </Animated.View>
      <Animated.View style={[styles.stamp, styles.passStamp, { opacity: passOpacity }]}>
        <Text style={[styles.stampText, { color: colors.ember, borderColor: colors.ember }]}>PASS</Text>
      </Animated.View>

      <View style={styles.cardInfo} pointerEvents="box-none">
        <Text style={styles.cardName}>
          {athlete.name}, {athlete.age}
        </Text>
        <Text style={styles.cardMeta}>
          {athlete.pace} · {athlete.city}
        </Text>
        <View style={{ marginTop: 10, flexDirection: 'row' }}>
          <Badge tone="accent">{athlete.discipline}</Badge>
        </View>
        <Pressable onPress={onViewProfile} style={styles.viewProfileRow} hitSlop={8}>
          <Text style={styles.viewProfileText}>VIEW PROFILE</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

function NextCard({ athlete }: { athlete: Athlete }) {
  return (
    <View style={[styles.card, styles.nextCard]}>
      <PhotoSlot label={athlete.name} shape="rect" style={styles.cardPhoto} />
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
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  stack: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 26,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.ash,
  },
  nextCard: { transform: [{ scale: 0.95 }, { translateY: 10 }], opacity: 0.7 },
  cardPhoto: { width: '100%', height: '100%' },
  cardGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '55%',
    backgroundColor: 'rgba(10,10,13,0.55)',
  },
  verifiedRow: { position: 'absolute', top: 14, left: 14, flexDirection: 'row', alignItems: 'center', gap: 6 },
  verifiedText: { fontFamily: fonts.mono, fontSize: 9, letterSpacing: 1.5, color: colors.ember },
  cardInfo: { position: 'absolute', left: 18, right: 18, bottom: 20 },
  cardName: { fontFamily: fonts.display, fontSize: 26, color: colors.bone, textTransform: 'uppercase', lineHeight: 26 },
  cardMeta: { fontFamily: fonts.mono, fontSize: 11, color: colors.fog, marginTop: 6, letterSpacing: 0.5 },
  viewProfileRow: { marginTop: 12 },
  viewProfileText: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 2, color: colors.ember, textDecorationLine: 'underline' },
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
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    paddingVertical: 20,
  },
  actionButton: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  passButton: { backgroundColor: colors.ash, borderColor: colors.line, width: 62, height: 62, borderRadius: 31 },
  likeButton: { backgroundColor: colors.emberSoft, borderColor: colors.emberBorder, width: 68, height: 68, borderRadius: 34 },
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
