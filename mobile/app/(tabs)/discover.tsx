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
import { Chip } from '../../src/components/ui';
import { ATHLETES, Athlete, DISCIPLINES, Discipline } from '../../src/data/mockData';
import { colors, fonts } from '../../src/theme/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.28;
const SWIPE_OUT_DURATION = 240;
const CARD_WIDTH = SCREEN_WIDTH - 40;
const CARD_HEIGHT = CARD_WIDTH * 1.3;

type SwipeDirection = 'left' | 'right';

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selected, setSelected] = useState<Discipline | null>(null);
  const [cursor, setCursor] = useState(0);
  const [interested, setInterested] = useState<number[]>([]);

  const queue = useMemo(
    () => (selected ? ATHLETES.filter((a) => a.discipline === selected) : ATHLETES),
    [selected]
  );

  function selectDiscipline(d: Discipline) {
    setSelected((prev) => (prev === d ? null : d));
    setCursor(0);
  }

  function advance() {
    setCursor((c) => c + 1);
  }

  function recordInterest(athleteId: number) {
    setInterested((prev) => (prev.includes(athleteId) ? prev : [...prev, athleteId]));
  }

  const current = queue[cursor];
  const next = queue[cursor + 1];
  const exhausted = cursor >= queue.length;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.eyebrow}>FOUNDING COHORT · BATCH 01</Text>
        <Text style={styles.title}>Discover</Text>
        <Text style={styles.subtitle}>Swipe right if you&apos;re interested, left to pass.</Text>
      </View>

      <View style={styles.chipRow}>
        {DISCIPLINES.map((d) => (
          <Chip key={d} label={d} selected={d === selected} onPress={() => selectDiscipline(d)} />
        ))}
      </View>

      <View style={styles.stack}>
        {exhausted ? (
          <EmptyState onReset={() => setCursor(0)} />
        ) : (
          <>
            {next ? <NextCard athlete={next} /> : null}
            {current ? (
              <SwipeCard
                key={current.id}
                athlete={current}
                onSwiped={(dir) => {
                  if (dir === 'right') recordInterest(current.id);
                  advance();
                }}
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
          <Pressable
            style={[styles.actionButton, styles.passButton]}
            onPress={() => {
              advance();
            }}
          >
            <Icon name="x" size={22} color={colors.fog} />
          </Pressable>
          <Pressable
            style={[styles.actionButton, styles.likeButton]}
            onPress={() => {
              recordInterest(current.id);
              advance();
            }}
          >
            <Icon name="heart" size={22} color={colors.ember} />
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
          forceSwipe('right');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          forceSwipe('left');
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  function forceSwipe(direction: SwipeDirection) {
    const x = direction === 'right' ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;
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

      <Animated.View style={[styles.stamp, styles.likeStamp, { opacity: likeOpacity }]}>
        <Text style={[styles.stampText, { color: colors.ember, borderColor: colors.ember }]}>INTERESTED</Text>
      </Animated.View>
      <Animated.View style={[styles.stamp, styles.passStamp, { opacity: passOpacity }]}>
        <Text style={[styles.stampText, { color: colors.fog, borderColor: colors.fog }]}>PASS</Text>
      </Animated.View>

      <View style={styles.cardInfo} pointerEvents="box-none">
        <Text style={styles.cardName}>
          {athlete.name}, {athlete.age}
        </Text>
        <Text style={styles.cardMeta}>
          {athlete.discipline} · {athlete.pace} · {athlete.city}
        </Text>
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
      <Icon name="zap" size={28} color={colors.fog} />
      <Text style={styles.emptyTitle}>You&apos;re all caught up</Text>
      <Text style={styles.emptyBody}>Check back later for new athletes, or start the deck over.</Text>
      <Pressable onPress={onReset} style={styles.emptyButton}>
        <Text style={styles.emptyButtonText}>START OVER</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink },
  header: { paddingHorizontal: 20, paddingBottom: 4 },
  eyebrow: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 3, color: colors.ember },
  title: {
    fontFamily: fonts.display,
    fontSize: 32,
    color: colors.bone,
    textTransform: 'uppercase',
    lineHeight: 32,
    marginTop: 8,
  },
  subtitle: { color: colors.fog, fontSize: 12, marginTop: 8, marginBottom: 4 },
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
    borderRadius: 24,
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
    justifyContent: 'center',
    gap: 28,
    paddingVertical: 20,
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  passButton: { backgroundColor: colors.ash, borderColor: colors.line },
  likeButton: { backgroundColor: colors.emberSoft, borderColor: colors.emberBorder },
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
