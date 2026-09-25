import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, XStack, YStack } from 'tamagui';
import { Icon } from '../../src/components/Icon';
import { Button, Callout, ScreenHeader } from '../../src/components/ui';
import { updateMe, useMe } from '../../src/data/session';
import { useColors } from '../../src/theme/appearance';

const PROVIDERS: Record<
  'strava' | 'garmin',
  { label: string; desc: string; icon: 'activity' | 'repeat' }
> = {
  strava: {
    label: 'Strava',
    desc: 'Sync runs, rides and swims so the stats on your card stay honest.',
    icon: 'activity',
  },
  garmin: {
    label: 'Garmin',
    desc: 'Pair Garmin Connect and your sessions show up automatically.',
    icon: 'repeat',
  },
};

export default function ConnectScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const me = useMe();
  const { provider } = useLocalSearchParams<{ provider?: string }>();
  const providerKey = provider === 'garmin' ? 'garmin' : 'strava';
  const p = PROVIDERS[providerKey];
  const connected = providerKey === 'garmin' ? me.garminConnected : me.stravaConnected;
  const [connecting, setConnecting] = useState(false);

  function connect() {
    setConnecting(true);
    // Mock OAuth round-trip. A real build opens the provider's authorize
    // page, receives a code/token back, and swaps `updateMe` below for a
    // `connectProvider(providerKey, token)` endpoint call.
    setTimeout(async () => {
      await updateMe(
        providerKey === 'garmin' ? { garminConnected: true } : { stravaConnected: true }
      );
      setConnecting(false);
    }, 1400);
  }

  return (
    <YStack flex={1} bg="$canvas" style={{ paddingBottom: insets.bottom + 20 }}>
      <ScreenHeader title="Connect *data*" onBack={() => router.back()} />

      <YStack flex={1} justify="center" gap={20} px={20}>
        <XStack
          width={80}
          height={80}
          rounded={24}
          bg={connected ? '$accentSoft' : '$card'}
          borderWidth={1}
          borderColor={connected ? '$accentBorder' : '$border'}
          items="center"
          justify="center"
        >
          <Icon name={p.icon} size={34} color={connected ? colors.accentText : colors.text} />
        </XStack>

        <YStack gap={8}>
          <Text fontFamily="$bold" fontSize={28} lineHeight={34} letterSpacing={-0.5} color="$text">
            {p.label}
          </Text>
          <Text color="$muted" fontSize={16} lineHeight={24}>
            {p.desc}
          </Text>
        </YStack>

        {connected ? (
          <Callout icon="check" tone="success" title="Connected">
            {`${p.label} is syncing to your card. Your stats stay current automatically.`}
          </Callout>
        ) : (
          <Button onPress={connect} disabled={connecting} style={{ width: '100%' }}>
            {connecting ? 'Connecting…' : `Connect ${p.label}`}
          </Button>
        )}

        {connected ? (
          <Button onPress={() => router.back()} style={{ width: '100%' }}>
            Done
          </Button>
        ) : null}

        <Text color="$muted" fontSize={13} lineHeight={19}>
          Demo note: this is a simulated authorize screen. A real build opens {p.label}&apos;s OAuth
          page and swaps the timeout in connect() for the callback.
        </Text>
      </YStack>
    </YStack>
  );
}
