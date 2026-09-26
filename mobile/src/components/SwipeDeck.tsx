import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { Animated, PanResponder, Platform, useWindowDimensions } from 'react-native';
import { Text, YStack } from 'tamagui';
import { brand } from '../theme/tokens';

// Tinder-style card stack. Drag the top card right to like, left to pass,
// or call `swipe()` from buttons. Taps inside the card (photo paging,
// the heart, the name) still work: the deck only takes over once a drag
// is clearly horizontal.
//
// `allow` decides whether a swipe goes through; returning false (not
// verified, no likes left) springs the card back. `onSwiped` runs once
// the card has left the screen.

export type SwipeDir = 'left' | 'right';

export interface SwipeDeckHandle {
  swipe: (dir: SwipeDir) => void;
}

const SWIPE_OUT_MS = 220;

export function SwipeDeck<T>({
  items,
  keyOf,
  renderCard,
  allow,
  onSwiped,
  height,
  deckRef,
}: {
  items: T[];
  keyOf: (item: T) => string | number;
  renderCard: (item: T, isTop: boolean) => React.ReactNode;
  allow?: (item: T, dir: SwipeDir) => boolean;
  onSwiped: (item: T, dir: SwipeDir) => void;
  height: number;
  deckRef?: React.RefObject<SwipeDeckHandle | null>;
}) {
  const { width } = useWindowDimensions();
  const threshold = width * 0.28;
  const top = items[0];
  const next = items[1];
  const topKey = top === undefined ? null : keyOf(top);

  // A fresh position per top card, so the card that just flew off stays
  // off-screen until the parent drops it from `items`.
  const pan = useMemo(() => new Animated.ValueXY(), [topKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const busy = useRef(false);
  useEffect(() => {
    busy.current = false;
  }, [topKey]);

  // Latest values for the responder, which is created once.
  const live = useRef({ pan, top, allow, onSwiped, width, threshold });
  useLayoutEffect(() => {
    live.current = { pan, top, allow, onSwiped, width, threshold };
  });

  function springBack() {
    Animated.spring(live.current.pan, {
      toValue: { x: 0, y: 0 },
      friction: 6,
      tension: 60,
      useNativeDriver: Platform.OS !== 'web',
    }).start(() => {
      busy.current = false;
    });
  }

  function flyOut(dir: SwipeDir, vy = 0) {
    const { pan: p, top: item, allow: ok, onSwiped: done, width: w } = live.current;
    if (item === undefined || busy.current) return;
    busy.current = true;
    if (ok && !ok(item, dir)) {
      springBack();
      return;
    }
    Animated.timing(p, {
      toValue: { x: (dir === 'right' ? 1 : -1) * w * 1.5, y: vy * 120 },
      duration: SWIPE_OUT_MS,
      useNativeDriver: Platform.OS !== 'web',
    }).start(() => done(item, dir));
  }

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, g) =>
          !busy.current && Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy) * 1.2,
        onMoveShouldSetPanResponderCapture: (_, g) =>
          !busy.current && Math.abs(g.dx) > 12 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
        onPanResponderMove: (_, g) => live.current.pan.setValue({ x: g.dx, y: g.dy * 0.3 }),
        onPanResponderRelease: (_, g) => {
          const t = live.current.threshold;
          if (g.dx > t || g.vx > 0.8) flyOut('right', g.vy);
          else if (g.dx < -t || g.vx < -0.8) flyOut('left', g.vy);
          else springBack();
        },
        onPanResponderTerminate: () => springBack(),
      }),
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  useLayoutEffect(() => {
    if (deckRef) deckRef.current = { swipe: (dir) => flyOut(dir) };
  });

  const rotate = pan.x.interpolate({
    inputRange: [-width, 0, width],
    outputRange: ['-12deg', '0deg', '12deg'],
  });
  const likeOpacity = pan.x.interpolate({
    inputRange: [0, threshold],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const nopeOpacity = pan.x.interpolate({
    inputRange: [-threshold, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const nextScale = pan.x.interpolate({
    inputRange: [-threshold, 0, threshold],
    outputRange: [1, 0.95, 1],
    extrapolate: 'clamp',
  });

  return (
    <YStack height={height} mx={20}>
      {next !== undefined ? (
        <Animated.View
          key={keyOf(next)}
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height,
            transform: [{ scale: nextScale }],
          }}
        >
          {renderCard(next, false)}
        </Animated.View>
      ) : null}
      {top !== undefined ? (
        <Animated.View
          key={topKey!}
          {...responder.panHandlers}
          style={[
            { position: 'absolute', top: 0, left: 0, right: 0, height },
            { transform: [{ translateX: pan.x }, { translateY: pan.y }, { rotate }] },
            Platform.OS === 'web' ? ({ userSelect: 'none', touchAction: 'pan-y' } as object) : null,
          ]}
        >
          {renderCard(top, true)}
          <Stamp label="LIKE" color={brand.accent} side="left" opacity={likeOpacity} />
          <Stamp label="PASS" color="#6B6560" side="right" opacity={nopeOpacity} />
        </Animated.View>
      ) : null}
    </YStack>
  );
}

function Stamp({
  label,
  color,
  side,
  opacity,
}: {
  label: string;
  color: string;
  side: 'left' | 'right';
  opacity: Animated.AnimatedInterpolation<number>;
}) {
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 56,
        [side]: 22,
        opacity,
        transform: [{ rotate: side === 'left' ? '-14deg' : '14deg' }],
        borderWidth: 4,
        borderColor: color,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 4,
        backgroundColor: 'rgba(255,255,255,0.85)',
      }}
    >
      <Text fontFamily="$bold" fontSize={30} letterSpacing={2} style={{ color }}>
        {label}
      </Text>
    </Animated.View>
  );
}
