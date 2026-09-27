import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Platform, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { XStack } from 'tamagui';
import { Icon, IconName } from './Icon';
import { useColors } from '../theme/appearance';

// Floating pill tab bar: detached from the screen edge, icon-only tabs,
// the active one sitting in an accent capsule.
//
// Switching tabs moves like iOS 18's floating tab bar: the capsule slides
// to the new tab on a spring and the icons it passes over turn white as
// it crosses them. A tapped icon squashes and springs back (SF Symbols'
// "bounce"). Everything animated is a transform or opacity, so it all
// runs on the native thread and stays smooth while the new screen
// renders. With Reduce Motion on, the capsule jumps instead.

const BAR_HEIGHT = 64;
const BAR_PAD = 8;
const BORDER = 1;
const CAPSULE_W = 56;
const CAPSULE_H = 48;
const ICON = 24;

// UIKit's spring (response 0.4s, damping ratio 0.8) as stiffness/damping.
export const IOS_TAB_SPRING = { stiffness: 247, damping: 25, mass: 1 };

// Web has no native animation driver.
const NATIVE = Platform.OS !== 'web';

// Bottom padding tab screens reserve so content scrolls clear of the bar.
export function useTabBarSpace() {
  const insets = useSafeAreaInsets();
  return Math.max(insets.bottom, 12) + 84;
}

function useReduceMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((on) => alive && setReduce(on))
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduce);
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);
  return reduce;
}

interface TabBarProps {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: {
    emit: (e: { type: 'tabPress'; target: string; canPreventDefault: true }) => {
      defaultPrevented: boolean;
    };
    navigate: (name: string) => void;
  };
}

export function FloatingTabBar({
  state,
  navigation,
  tabs,
}: TabBarProps & { tabs: Record<string, { label: string; icon: IconName }> }) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReduceMotion();

  const routes = state.routes.filter((r) => tabs[r.name]);
  const focusedKey = state.routes[state.index]?.key;
  const focused = routes.findIndex((r) => r.key === focusedKey);

  const [barWidth, setBarWidth] = useState(0);
  // The capsule's position, in tabs (0 = first tab). Fractional mid-slide.
  const [pos] = useState(() => new Animated.Value(Math.max(focused, 0)));
  const [scales] = useState(() => new Map<string, Animated.Value>());
  const scaleFor = (key: string) => {
    if (!scales.has(key)) scales.set(key, new Animated.Value(1));
    return scales.get(key)!;
  };
  // Where the capsule is heading, so a press and the navigation state
  // catching up don't start the same slide twice.
  const target = useRef(Math.max(focused, 0));

  const slideTo = (index: number) => {
    if (index < 0 || index === target.current) return;
    target.current = index;
    if (reduceMotion) {
      pos.setValue(index);
    } else {
      Animated.spring(pos, { toValue: index, ...IOS_TAB_SPRING, useNativeDriver: NATIVE }).start();
    }
  };

  // Follow navigation that didn't come from a tap (deep links,
  // router.push, the back button).
  useEffect(() => {
    slideTo(focused);
    // slideTo only reads refs and stable values.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focused]);

  // Equal slots; the capsule is centred in the focused one.
  const n = Math.max(routes.length, 1);
  const slot = (barWidth - 2 * BORDER - 2 * BAR_PAD) / n;
  const range = n > 1 ? routes.map((_, i) => i) : [0, 1];
  const xs = range.map((i) => BAR_PAD + i * slot + (slot - CAPSULE_W) / 2);

  return (
    <XStack
      position="absolute"
      l={16}
      r={16}
      b={Math.max(insets.bottom, 12)}
      height={BAR_HEIGHT}
      px={BAR_PAD}
      rounded={32}
      items="center"
      bg="$tabBar"
      borderWidth={BORDER}
      borderColor="$border"
      onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
      style={{
        shadowColor: '#000',
        shadowOpacity: 0.14,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 10 },
        elevation: 12,
      }}
    >
      {focused >= 0 && barWidth > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.capsule,
            {
              backgroundColor: c.accent,
              transform: [
                {
                  translateX: pos.interpolate({
                    inputRange: range,
                    outputRange: xs,
                    extrapolate: 'clamp',
                  }),
                },
              ],
            },
          ]}
        />
      ) : null}

      {routes.map((route, index) => {
        const tab = tabs[route.name];
        const isFocused = index === focused;
        const scale = scaleFor(route.key);
        // 1 while the capsule is over this tab, fading as it moves off.
        const covered = pos.interpolate({
          inputRange: [index - 1, index, index + 1],
          outputRange: [0, 1, 0],
          extrapolate: 'clamp',
        });
        return (
          <Pressable
            key={route.key}
            style={styles.slot}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            aria-label={tab.label}
            accessibilityState={{ selected: isFocused }}
            onPressIn={() => {
              scale.stopAnimation();
              Animated.timing(scale, {
                toValue: 0.82,
                duration: 90,
                easing: Easing.out(Easing.quad),
                useNativeDriver: NATIVE,
              }).start();
            }}
            onPressOut={() => {
              Animated.spring(scale, {
                toValue: 1,
                stiffness: 420,
                damping: 11,
                useNativeDriver: NATIVE,
              }).start();
            }}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (isFocused || event.defaultPrevented) return;
              // Start moving now, before the new screen renders.
              slideTo(index);
              navigation.navigate(route.name);
            }}
          >
            <Animated.View style={[styles.icon, { transform: [{ scale }] }]}>
              {/* Crossfade: SVG colours can't be animated natively. */}
              <Animated.View
                style={[
                  StyleSheet.absoluteFill,
                  { opacity: covered.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) },
                ]}
              >
                <Icon name={tab.icon} size={ICON} color={c.muted} strokeWidth={1.9} />
              </Animated.View>
              <Animated.View style={[StyleSheet.absoluteFill, { opacity: covered }]}>
                <Icon
                  name={tab.icon}
                  size={ICON}
                  color={c.onAccent}
                  strokeWidth={2.2}
                  filled={tab.icon === 'heart'}
                />
              </Animated.View>
            </Animated.View>
          </Pressable>
        );
      })}
    </XStack>
  );
}

const styles = StyleSheet.create({
  capsule: {
    position: 'absolute',
    left: 0,
    top: (BAR_HEIGHT - 2 * BORDER - CAPSULE_H) / 2,
    width: CAPSULE_W,
    height: CAPSULE_H,
    borderRadius: CAPSULE_H / 2,
  },
  slot: {
    flex: 1,
    height: CAPSULE_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: ICON,
    height: ICON,
  },
});
