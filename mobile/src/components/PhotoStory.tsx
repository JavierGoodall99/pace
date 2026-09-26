import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, ImageSourcePropType, Pressable } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { Text, XStack, YStack } from 'tamagui';
import { Icon } from './Icon';
import { tapHaptic } from '../lib/haptics';
import type { Prompt } from '../data/athleteDepth';
import { PhotoLabel, photoLabel } from '../data/identity';
import { useColors } from '../theme/appearance';

// Story-style profile viewer: full-bleed photos interleaved with prompts
// and an info page. Tap right for next, left for previous. Photos lead —
// people decide with their eyes first — and every photo and prompt can
// be liked on its own.

export type StoryPage =
  | {
      kind: 'photo';
      source: ImageSourcePropType;
      label: PhotoLabel;
      caption?: string;
      motion?: boolean;
    }
  | { kind: 'prompt'; prompt: Prompt }
  | { kind: 'info'; content: React.ReactNode };

// Slow push-in loop that stands in for a short motion clip.
function MotionImage({ source }: { source: ImageSourcePropType }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(t, {
          toValue: 1,
          duration: 5200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(t, {
          toValue: 0,
          duration: 5200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [t]);
  return (
    <Animated.Image
      source={source}
      resizeMode="cover"
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        transform: [
          { scale: t.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] }) },
          { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, -10] }) },
        ],
      }}
    />
  );
}

export function PhotoStory({
  pages,
  height,
  onLike,
  liked,
  footer,
  topRight,
  radius = 0,
  bottomFade = true,
  insetBottom = 0,
  labelAt = 'top',
}: {
  pages: StoryPage[];
  height: number;
  // `kindIndex` counts only pages of the same kind: photo 0, 1… / prompt 0, 1…
  onLike?: (page: StoryPage, kindIndex: number) => void;
  liked?: boolean;
  // Rendered over the bottom of photo pages (name, city, chips…).
  footer?: (page: StoryPage, index: number) => React.ReactNode;
  topRight?: (onPhoto: boolean) => React.ReactNode;
  radius?: number;
  bottomFade?: boolean;
  // Space covered by content overlapping the bottom edge.
  insetBottom?: number;
  labelAt?: 'top' | 'bottom';
}) {
  const c = useColors();
  const [i, setI] = useState(0);
  const page = pages[Math.min(i, pages.length - 1)];
  const onPhoto = page.kind === 'photo';

  function go(delta: number) {
    const next = Math.max(0, Math.min(pages.length - 1, i + delta));
    if (next !== i) {
      tapHaptic();
      setI(next);
    }
  }

  return (
    <YStack height={height} overflow="hidden" bg="$surface" style={{ borderRadius: radius }}>
      {page.kind === 'photo' ? (
        page.motion ? (
          <MotionImage key={i} source={page.source} />
        ) : (
          <Image
            source={page.source}
            resizeMode="cover"
            style={{ position: 'absolute', width: '100%', height: '100%' }}
          />
        )
      ) : page.kind === 'prompt' ? (
        <YStack flex={1} bg="$accentSoft" px={24} justify="center" gap={14}>
          <Text fontFamily="$semibold" fontSize={15} color="$accentText">
            {page.prompt.q}
          </Text>
          <Text fontFamily="$display" fontSize={38} lineHeight={44} color="$text">
            {page.prompt.a}
          </Text>
        </YStack>
      ) : (
        <YStack flex={1} bg="$card">
          {page.content}
        </YStack>
      )}

      {onPhoto && bottomFade ? (
        <YStack pointerEvents="none" position="absolute" l={0} r={0} b={0} height="55%">
          <Svg width="100%" height="100%">
            <Defs>
              <LinearGradient id="storyFade" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#12100E" stopOpacity={0} />
                <Stop offset="1" stopColor="#12100E" stopOpacity={0.85} />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#storyFade)" />
          </Svg>
        </YStack>
      ) : null}
      {onPhoto ? (
        <YStack pointerEvents="none" position="absolute" l={0} r={0} t={0} height={90}>
          <Svg width="100%" height="100%">
            <Defs>
              <LinearGradient id="storyTop" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#12100E" stopOpacity={0.4} />
                <Stop offset="1" stopColor="#12100E" stopOpacity={0} />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#storyTop)" />
          </Svg>
        </YStack>
      ) : null}

      {/* Tap zones: left third back, the rest forward. */}
      {page.kind !== 'info' || pages.length > 1 ? (
        <XStack position="absolute" t={0} l={0} r={0} b={0}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Previous"
            aria-label="Previous"
            onPress={() => go(-1)}
            style={{ width: '35%', height: '100%' }}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Next"
            aria-label="Next"
            onPress={() => go(1)}
            style={{ flex: 1, height: '100%' }}
          />
        </XStack>
      ) : null}

      {/* Progress segments */}
      <XStack pointerEvents="none" position="absolute" t={10} l={12} r={12} gap={4}>
        {pages.map((_, k) => (
          <YStack
            key={k}
            flex={1}
            height={3.5}
            rounded={2}
            style={{
              backgroundColor:
                k === i
                  ? onPhoto
                    ? '#FFFFFF'
                    : c.accent
                  : onPhoto
                    ? 'rgba(255,255,255,0.4)'
                    : c.borderStrong,
            }}
          />
        ))}
      </XStack>

      <XStack
        pointerEvents="box-none"
        position="absolute"
        t={24}
        l={12}
        r={12}
        items="center"
        justify="space-between"
      >
        {page.kind === 'photo' && labelAt === 'top' ? (
          <XStack
            pointerEvents="none"
            items="center"
            gap={5}
            height={26}
            px={10}
            rounded="$full"
            bg="rgba(18,16,14,0.45)"
          >
            <Text fontFamily="$semibold" fontSize={12} color="#FFFFFF">
              {photoLabel(page.label)}
              {page.caption ? ` · ${page.caption}` : ''}
            </Text>
          </XStack>
        ) : (
          <YStack />
        )}
        {topRight?.(onPhoto)}
      </XStack>

      {page.kind === 'photo' && labelAt === 'bottom' ? (
        <XStack
          pointerEvents="none"
          position="absolute"
          l={14}
          b={insetBottom + 22}
          items="center"
          height={26}
          px={10}
          rounded="$full"
          bg="rgba(18,16,14,0.45)"
        >
          <Text fontFamily="$semibold" fontSize={12} color="#FFFFFF">
            {photoLabel(page.label)}
            {page.caption ? ` · ${page.caption}` : ''}
          </Text>
        </XStack>
      ) : null}

      {footer ? (
        <YStack pointerEvents="box-none" position="absolute" l={16} r={76} b={insetBottom + 16}>
          {footer(page, i)}
        </YStack>
      ) : null}

      {onLike && page.kind !== 'info' ? (
        <YStack position="absolute" r={14} b={insetBottom + 16}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={page.kind === 'photo' ? 'Like this photo' : 'Like this answer'}
            aria-label={page.kind === 'photo' ? 'Like this photo' : 'Like this answer'}
            onPress={() =>
              onLike(page, pages.slice(0, i).filter((p) => p.kind === page.kind).length)
            }
          >
            <XStack
              width={52}
              height={52}
              rounded={26}
              items="center"
              justify="center"
              bg={liked ? '$accent' : '$card'}
              style={{
                shadowColor: '#000',
                shadowOpacity: 0.2,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 4 },
                elevation: 6,
              }}
            >
              <Icon
                name="heart"
                size={24}
                color={liked ? c.onAccent : c.accent}
                filled={liked}
                strokeWidth={2.2}
              />
            </XStack>
          </Pressable>
        </YStack>
      ) : null}
    </YStack>
  );
}
