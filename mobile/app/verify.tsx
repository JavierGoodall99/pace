import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, YStack } from 'tamagui';
import { Icon } from '../src/components/Icon';
import { Button, ScreenHeader } from '../src/components/ui';
import { updateMe, useMe } from '../src/data/session';
import { useColors } from '../src/theme/appearance';

// Mock liveness check — a selfie-style scan that "verifies" after a
// couple of seconds. A real build swaps the timer + state flip for the
// identity provider's SDK result.
export default function VerifyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const me = useMe();
  const [done, setDone] = useState(me.verified);
  const scanLine = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (me.verified) return;

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLine, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scanLine, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    const timer = setTimeout(async () => {
      loop.stop();
      await updateMe({ verified: true });
      setDone(true);
    }, 2400);
    return () => {
      loop.stop();
      clearTimeout(timer);
    };
    // Mount-once scan cycle — deliberately no deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const translateY = scanLine.interpolate({ inputRange: [0, 1], outputRange: [-72, 72] });

  return (
    <YStack flex={1} bg="$canvas" style={{ paddingBottom: insets.bottom + 20 }}>
      <ScreenHeader title="Verify it’s *you*" onBack={() => router.back()} />

      <YStack flex={1} justify="center" items="center" gap={24} px={20}>
        <YStack
          width={240}
          height={240}
          rounded={120}
          bg={done ? '$successSoft' : '$surface'}
          borderWidth={3}
          borderColor={done ? '$success' : '$accentBorder'}
          items="center"
          justify="center"
          overflow="hidden"
        >
          <Icon
            name={done ? 'shield-check' : 'user'}
            size={72}
            color={done ? colors.success : colors.muted}
            strokeWidth={1.5}
          />
          {!done ? (
            <YStack
              position="absolute"
              l={0}
              r={0}
              height={3}
              bg="$accent"
              opacity={0.8}
              style={{ transform: [{ translateY }] }}
            />
          ) : null}
        </YStack>

        <YStack items="center" gap={8} px={10}>
          <Text fontFamily="$bold" fontSize={24} lineHeight={30} color="$text" text="center">
            {done ? "You're verified" : 'Hold still…'}
          </Text>
          <Text color="$muted" fontSize={16} lineHeight={24} text="center">
            {done
              ? 'Your card carries the verified badge. Matches can trust it is really you.'
              : 'We are matching your face against your photo. Keep your eyes on the circle.'}
          </Text>
        </YStack>

        {done ? (
          <Button
            style={{ width: '100%' }}
            onPress={() => {
              if (router.canGoBack()) router.back();
              else router.replace('/onboarding');
            }}
          >
            Done
          </Button>
        ) : (
          <Text fontFamily="$medium" fontSize={14} color="$muted">
            Takes about 2 seconds
          </Text>
        )}
      </YStack>
    </YStack>
  );
}
