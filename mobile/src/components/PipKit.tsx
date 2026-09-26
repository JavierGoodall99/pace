import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, type Href } from 'expo-router';
import React, { useEffect, useRef, useSyncExternalStore } from 'react';
import { Animated, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, XStack, YStack } from 'tamagui';
import { Icon } from './Icon';
import { Mascot, Mood } from './Mascot';
import { tapHaptic } from '../lib/haptics';
import type { PipLine } from '../data/pip';
import { useColors } from '../theme/appearance';

// Pip outside onboarding: an inline tip card, and a toast that pops in
// to react to what you just did. Keeps Pace's mascot present the way
// Duolingo's owl is — at moments that matter, never in the way.

// ── Dismissals (per day, persisted) ─────────────────────────────────

const DISMISS_KEY = 'pace.pip.dismissed.v1';
let dismissed: Record<string, string> = {};
const dismissListeners = new Set<() => void>();

AsyncStorage.getItem(DISMISS_KEY)
  .then((raw) => {
    if (raw) {
      dismissed = JSON.parse(raw);
      dismissListeners.forEach((l) => l());
    }
  })
  .catch(() => {});

function today() {
  return new Date().toISOString().slice(0, 10);
}

function dismiss(key: string) {
  dismissed = { ...dismissed, [key]: today() };
  dismissListeners.forEach((l) => l());
  AsyncStorage.setItem(DISMISS_KEY, JSON.stringify(dismissed)).catch(() => {});
}

function useDismissed(key: string): boolean {
  const map = useSyncExternalStore(
    (l) => {
      dismissListeners.add(l);
      return () => dismissListeners.delete(l);
    },
    () => dismissed
  );
  return map[key] === today();
}

// ── Inline tip card ─────────────────────────────────────────────────

export function PipTip({ line, dismissible = true }: { line: PipLine; dismissible?: boolean }) {
  const c = useColors();
  const router = useRouter();
  const hidden = useDismissed(line.key);
  if (hidden) return null;
  return (
    <XStack items="flex-start" gap={10}>
      <Mascot size={58} mood={line.mood} reactKey={line.key} />
      <YStack
        flex={1}
        bg="$card"
        borderWidth={1.5}
        borderColor="$border"
        rounded={20}
        px={14}
        py={12}
        gap={10}
        mt={4}
      >
        {/* Tail pointing at Pip */}
        <YStack
          position="absolute"
          l={-8}
          t={18}
          width={14}
          height={14}
          bg="$card"
          borderLeftWidth={1.5}
          borderBottomWidth={1.5}
          borderColor="$border"
          rotate="45deg"
        />
        <XStack gap={8} items="flex-start">
          <Text flex={1} fontFamily="$semibold" fontSize={15} lineHeight={21} color="$text">
            {line.text}
          </Text>
          {dismissible ? (
            <XStack
              accessibilityRole="button"
              accessibilityLabel="Dismiss for today"
              aria-label="Dismiss for today"
              onPress={() => dismiss(line.key)}
              hitSlop={10}
              pt={2}
            >
              <Icon name="x" size={16} color={c.muted} />
            </XStack>
          ) : null}
        </XStack>
        {line.cta ? (
          <XStack
            accessibilityRole="button"
            onPress={() => {
              tapHaptic();
              router.push(line.cta!.href as Href);
            }}
            self="flex-start"
            items="center"
            gap={6}
            height={34}
            px={14}
            rounded="$full"
            bg="$accentSoft"
          >
            <Text fontFamily="$semibold" fontSize={14} color="$accentText">
              {line.cta.label}
            </Text>
            <Icon name="arrow-right" size={14} color={c.accentText} strokeWidth={2.2} />
          </XStack>
        ) : null}
      </YStack>
    </XStack>
  );
}

// ── Toast ───────────────────────────────────────────────────────────

interface Toast {
  id: number;
  text: string;
  mood: Mood;
}

let toast: Toast | null = null;
const toastListeners = new Set<() => void>();

// Pip reacts to something you just did. Call from anywhere.
export function showPip(text: string, mood: Mood = 'excited') {
  toast = { id: Date.now(), text, mood };
  toastListeners.forEach((l) => l());
}

function useToast(): Toast | null {
  return useSyncExternalStore(
    (l) => {
      toastListeners.add(l);
      return () => toastListeners.delete(l);
    },
    () => toast
  );
}

// Mounted once at the root, above every screen.
export function PipToastHost() {
  const current = useToast();
  const insets = useSafeAreaInsets();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!current) return;
    anim.setValue(0);
    const seq = Animated.sequence([
      Animated.spring(anim, { toValue: 1, friction: 7, tension: 90, useNativeDriver: true }),
      Animated.delay(2600),
      Animated.timing(anim, {
        toValue: 0,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);
    seq.start(({ finished }) => {
      if (finished && toast?.id === current.id) {
        toast = null;
        toastListeners.forEach((l) => l());
      }
    });
    return () => seq.stop();
  }, [current, anim]);

  if (!current) return null;
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: insets.top + 10,
        left: 16,
        right: 16,
        zIndex: 100,
        opacity: anim,
        transform: [
          { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] }) },
        ],
      }}
    >
      <XStack
        items="center"
        gap={10}
        pl={8}
        pr={16}
        py={8}
        rounded={24}
        bg="$card"
        borderWidth={1.5}
        borderColor="$border"
        style={{
          shadowColor: '#000',
          shadowOpacity: 0.16,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 8 },
          elevation: 10,
        }}
      >
        <Mascot size={46} mood={current.mood} reactKey={current.id} />
        <Text flex={1} fontFamily="$semibold" fontSize={15} lineHeight={21} color="$text">
          {current.text}
        </Text>
      </XStack>
    </Animated.View>
  );
}
