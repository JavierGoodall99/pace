import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';
import { Icon } from './Icon';
import { Illo, IlloName } from './Illustrations';
import { tapHaptic } from '../lib/haptics';
import { useColors } from '../theme/appearance';
import { WEEK_DAY_NAMES } from '../data/rhythm';

// Building blocks for the onboarding flow: big tappable answers, sport
// tiles, the tap-to-build week, a chunky animated progress bar, and a
// slide-in wrapper for each step.

// Slides + fades its children in on mount. Key it on the step so each
// new question arrives with motion.
export function StepEnter({ children }: { children: React.ReactNode }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(t, {
      toValue: 1,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [t]);
  return (
    <Animated.View
      style={{
        flex: 1,
        opacity: t,
        transform: [{ translateX: t.interpolate({ inputRange: [0, 1], outputRange: [28, 0] }) }],
      }}
    >
      {children}
    </Animated.View>
  );
}

export function OnboardingProgress({ pct }: { pct: number }) {
  const c = useColors();
  const v = useRef(new Animated.Value(pct)).current;
  useEffect(() => {
    Animated.spring(v, { toValue: pct, friction: 7, tension: 50, useNativeDriver: false }).start();
  }, [pct, v]);
  const width = v.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });
  return (
    <YStack flex={1} height={14} rounded={7} bg="$surface" overflow="hidden">
      <Animated.View style={{ height: '100%', width, backgroundColor: c.accent, borderRadius: 7 }}>
        {/* Highlight stripe, Duolingo-style */}
        <YStack
          position="absolute"
          t={3}
          l={8}
          r={8}
          height={3}
          rounded={2}
          bg="rgba(255,255,255,0.35)"
        />
      </Animated.View>
    </YStack>
  );
}

// Press-in scale shared by the tappable answers.
function usePressScale() {
  const s = useRef(new Animated.Value(1)).current;
  return {
    scale: s,
    onPressIn: () =>
      Animated.spring(s, { toValue: 0.96, useNativeDriver: true, speed: 40 }).start(),
    onPressOut: () =>
      Animated.spring(s, { toValue: 1, friction: 4, useNativeDriver: true }).start(),
  };
}

export function OptionCard({
  illo,
  title,
  subtitle,
  selected,
  onPress,
}: {
  illo: IlloName;
  title: string;
  subtitle?: string;
  selected: boolean;
  onPress: () => void;
}) {
  const c = useColors();
  const press = usePressScale();
  return (
    <Animated.View style={{ transform: [{ scale: press.scale }] }}>
      <XStack
        accessibilityRole="button"
        accessibilityState={{ selected }}
        onPress={() => {
          tapHaptic();
          onPress();
        }}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        items="center"
        gap={14}
        px={16}
        py={14}
        rounded={20}
        borderWidth={2}
        borderBottomWidth={selected ? 2 : 4}
        borderColor={selected ? '$accent' : '$border'}
        bg={selected ? '$accentSoft' : '$card'}
      >
        <XStack
          width={48}
          height={48}
          rounded={16}
          items="center"
          justify="center"
          bg={selected ? '$card' : '$surface'}
        >
          <Illo name={illo} size={34} />
        </XStack>
        <YStack flex={1}>
          <Text fontFamily="$bold" fontSize={17} color="$text">
            {title}
          </Text>
          {subtitle ? (
            <Text fontSize={14} lineHeight={19} color="$muted" mt={2}>
              {subtitle}
            </Text>
          ) : null}
        </YStack>
        <XStack
          width={26}
          height={26}
          rounded={13}
          items="center"
          justify="center"
          borderWidth={selected ? 0 : 2}
          borderColor="$borderStrong"
          bg={selected ? '$accent' : 'transparent'}
        >
          {selected ? <Icon name="check" size={16} color={c.onAccent} strokeWidth={3} /> : null}
        </XStack>
      </XStack>
    </Animated.View>
  );
}

export function SportTile({
  illo,
  label,
  selected,
  onPress,
}: {
  illo: IlloName;
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const press = usePressScale();
  return (
    <Animated.View style={{ width: '48%', transform: [{ scale: press.scale }] }}>
      <YStack
        accessibilityRole="button"
        accessibilityState={{ selected }}
        onPress={() => {
          tapHaptic();
          onPress();
        }}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        items="center"
        gap={6}
        py={16}
        rounded={20}
        borderWidth={2}
        borderBottomWidth={selected ? 2 : 4}
        borderColor={selected ? '$accent' : '$border'}
        bg={selected ? '$accentSoft' : '$card'}
      >
        <Illo name={illo} size={48} />
        <Text fontFamily="$bold" fontSize={15} color={selected ? '$accentText' : '$text'}>
          {label}
        </Text>
      </YStack>
    </Animated.View>
  );
}

// Tap a day and its bar springs up — the user literally builds the
// rhythm they'll be matched on.
export function WeekBuilder({
  days,
  onToggle,
}: {
  days: boolean[];
  onToggle: (i: number) => void;
}) {
  return (
    <XStack gap={8} items="flex-end" height={190}>
      {days.map((on, i) => (
        <DayBar key={i} label={WEEK_DAY_NAMES[i]} on={on} onPress={() => onToggle(i)} />
      ))}
    </XStack>
  );
}

function DayBar({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  const c = useColors();
  const h = useRef(new Animated.Value(on ? 1 : 0)).current;
  useEffect(() => {
    Animated.spring(h, {
      toValue: on ? 1 : 0,
      friction: 5,
      tension: 120,
      useNativeDriver: false,
    }).start();
  }, [on, h]);
  const height = h.interpolate({ inputRange: [0, 1], outputRange: [36, 150] });
  return (
    <YStack
      flex={1}
      items="center"
      gap={8}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: on }}
      onPress={() => {
        tapHaptic();
        onPress();
      }}
    >
      <Animated.View
        style={{
          width: '100%',
          height,
          borderRadius: 14,
          backgroundColor: on ? c.accent : c.surface,
          borderWidth: on ? 0 : 2,
          borderColor: c.borderStrong,
          borderStyle: 'dashed',
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingTop: 10,
          ...(on
            ? {
                shadowColor: c.accent,
                shadowOpacity: 0.45,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 4 },
              }
            : null),
        }}
      >
        {on ? <Icon name="zap" size={16} color={c.onAccent} filled /> : null}
      </Animated.View>
      <Text
        fontFamily={on ? '$bold' : '$medium'}
        fontSize={13}
        color={on ? '$accentText' : '$muted'}
      >
        {label}
      </Text>
    </YStack>
  );
}
