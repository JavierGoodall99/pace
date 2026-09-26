import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';
import { Text, YStack } from 'tamagui';
import { useColors } from '../theme/appearance';

// Pip — Pace's pace-setter. A heart in a sweatband who guides onboarding
// and reacts to every answer. Idle bob, occasional blink, and a bounce
// whenever `reactKey` changes.

export type Mood = 'happy' | 'excited' | 'thinking' | 'wink';

const INK = '#241B16';

function Face({ mood, blink }: { mood: Mood; blink: boolean }) {
  const closedLeft = blink || mood === 'wink';
  return (
    <G>
      {/* Eyes */}
      {closedLeft ? (
        <Path
          d="M31 42 Q38 46 45 42"
          stroke={INK}
          strokeWidth={3.2}
          strokeLinecap="round"
          fill="none"
        />
      ) : (
        <G>
          <Circle cx={38} cy={42} r={8.5} fill="#FFFFFF" />
          <Circle cx={40} cy={43.5} r={4.6} fill={INK} />
          <Circle cx={41.6} cy={41.8} r={1.5} fill="#FFFFFF" />
        </G>
      )}
      {blink ? (
        <Path
          d="M55 42 Q62 46 69 42"
          stroke={INK}
          strokeWidth={3.2}
          strokeLinecap="round"
          fill="none"
        />
      ) : (
        <G>
          <Circle cx={62} cy={42} r={8.5} fill="#FFFFFF" />
          <Circle cx={64} cy={43.5} r={4.6} fill={INK} />
          <Circle cx={65.6} cy={41.8} r={1.5} fill="#FFFFFF" />
        </G>
      )}
      {/* Cheeks */}
      <Ellipse cx={27} cy={55} rx={6} ry={3.6} fill="#FFB38A" opacity={0.85} />
      <Ellipse cx={73} cy={55} rx={6} ry={3.6} fill="#FFB38A" opacity={0.85} />
      {/* Mouth */}
      {mood === 'excited' ? (
        <G>
          <Path d="M40 55 Q50 71 60 55 Z" fill={INK} />
          <Path d="M44 61 Q50 66 56 61 Q50 63 44 61 Z" fill="#FF8A5C" />
        </G>
      ) : mood === 'thinking' ? (
        <Ellipse cx={50} cy={60} rx={4} ry={4.6} fill={INK} />
      ) : (
        <Path
          d="M42 56 Q50 64 58 56"
          stroke={INK}
          strokeWidth={3.2}
          strokeLinecap="round"
          fill="none"
        />
      )}
    </G>
  );
}

export function Mascot({
  size = 88,
  mood = 'happy',
  reactKey,
}: {
  size?: number;
  mood?: Mood;
  reactKey?: string | number;
}) {
  const c = useColors();
  const bob = useRef(new Animated.Value(0)).current;
  const pop = useRef(new Animated.Value(1)).current;
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bob, {
          toValue: 0,
          duration: 1100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [bob]);

  useEffect(() => {
    let off: ReturnType<typeof setTimeout>;
    const id = setInterval(() => {
      setBlink(true);
      off = setTimeout(() => setBlink(false), 140);
    }, 3200);
    return () => {
      clearInterval(id);
      clearTimeout(off);
    };
  }, []);

  useEffect(() => {
    if (reactKey === undefined) return;
    pop.setValue(0.86);
    Animated.spring(pop, {
      toValue: 1,
      friction: 3.5,
      tension: 180,
      useNativeDriver: true,
    }).start();
  }, [reactKey, pop]);

  const translateY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -5] });

  return (
    <Animated.View
      style={{ width: size, height: size, transform: [{ translateY }, { scale: pop }] }}
    >
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {/* Ground shadow */}
        <Ellipse cx={50} cy={95} rx={22} ry={3.5} fill="#000" opacity={0.12} />
        {/* Body */}
        <Path
          d="M50 90 C19 70 5 53 5 34 C5 19 16 9 30 9 C39 9 46 14 50 21 C54 14 61 9 70 9 C84 9 95 19 95 34 C95 53 81 70 50 90 Z"
          fill={c.accent}
        />
        {/* Sheen */}
        <Ellipse
          cx={26}
          cy={25}
          rx={8}
          ry={5}
          fill="#FFFFFF"
          opacity={0.28}
          transform="rotate(-30 26 25)"
        />
        {/* Sweatband */}
        <Path
          d="M9 27 C30 19 70 19 91 27"
          stroke="#FFFFFF"
          strokeWidth={6}
          strokeLinecap="round"
          fill="none"
        />
        <Path
          d="M9 27 C30 19 70 19 91 27"
          stroke={c.peach}
          strokeWidth={2}
          strokeLinecap="round"
          fill="none"
          strokeDasharray="4 5"
        />
        <Face mood={mood} blink={blink} />
      </Svg>
    </Animated.View>
  );
}

// Pip's speech bubble. Re-animates in each time `text` changes, so every
// reaction feels like Pip just said it.
export function SpeechBubble({ text }: { text: string }) {
  const enter = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    enter.setValue(0);
    Animated.spring(enter, {
      toValue: 1,
      friction: 6,
      tension: 120,
      useNativeDriver: true,
    }).start();
  }, [text, enter]);
  return (
    <Animated.View
      style={{
        flex: 1,
        opacity: enter,
        transform: [
          { translateX: enter.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }) },
          { scale: enter.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) },
        ],
      }}
    >
      <YStack bg="$card" borderWidth={1.5} borderColor="$border" rounded={22} px={16} py={14}>
        {/* Tail pointing at Pip */}
        <YStack
          position="absolute"
          l={-8}
          t={22}
          width={14}
          height={14}
          bg="$card"
          borderLeftWidth={1.5}
          borderBottomWidth={1.5}
          borderColor="$border"
          rotate="45deg"
        />
        <Text fontFamily="$semibold" fontSize={17} lineHeight={24} color="$text">
          {text}
        </Text>
      </YStack>
    </Animated.View>
  );
}
