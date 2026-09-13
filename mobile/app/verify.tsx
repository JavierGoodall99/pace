import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, XStack, YStack } from 'tamagui';
import { Icon } from '../src/components/Icon';
import { Button, IconButton } from '../src/components/ui';
import { updateMe, useMe } from '../src/data/session';
import { colors } from '../src/theme/tokens';

// Mock liveness check — a selfie-style scan that "verifies" after a
// couple of seconds. A real build swaps the timer + state flip for the
// identity provider's SDK result.
export default function VerifyScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const me = useMe();
  const [done, setDone] = useState(me.verified);
  const scanLine = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (me.verified) return;

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLine, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(scanLine, { toValue: 0, duration: 1000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
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
    <YStack
      flex={1}
      bg="$ink"
      px={20}
      items="center"
      style={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 20 }}
    >
      <XStack items="center" self="flex-start" gap={12} pb={14}>
        <IconButton size={40} onPress={() => router.back()}>
          <Icon name="chevron-left" size={14} color={colors.bone} />
        </IconButton>
        <Text fontFamily="$display" fontSize={30} color="$bone" textTransform="uppercase" lineHeight={30}>
          Verify
        </Text>
      </XStack>

      <YStack flex={1} justify="center" items="center" gap={24}>
        <YStack
          width={240}
          height={240}
          rounded={120}
          bg="$coal"
          borderWidth={2}
          borderColor={done ? '$ember' : '$lineHover'}
          items="center"
          justify="center"
          overflow="hidden"
        >
          <Icon name="user" size={72} color={done ? colors.ember : colors.fog} />
          {!done ? (
            <YStack
              position="absolute"
              l={0}
              r={0}
              height={2}
              bg="$ember"
              opacity={1}
              style={{ transform: [{ translateY }] }}
            />
          ) : null}
        </YStack>

        <YStack items="center" gap={8} px={10}>
          <Text fontFamily="$display" fontSize={22} color="$bone" textTransform="uppercase" lineHeight={22} text="center">
            {done ? 'Identity verified' : 'Hold still…'}
          </Text>
          <Text color="$fog" fontSize={13} lineHeight={19} text="center">
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
          <Text fontFamily="$mono" fontSize={10} letterSpacing={2} color="$fog" opacity={0.7}>
            TAKES ABOUT 2 SECONDS
          </Text>
        )}
      </YStack>
    </YStack>
  );
}