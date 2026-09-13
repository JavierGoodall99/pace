import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, XStack, YStack } from 'tamagui';
import { Icon } from '../../src/components/Icon';
import { Button, IconButton } from '../../src/components/ui';
import { updateMe, useMe } from '../../src/data/session';
import { colors } from '../../src/theme/tokens';

const PROVIDERS: Record<
  'strava' | 'garmin',
  { label: string; desc: string; icon: 'activity' | 'repeat' }
> = {
  strava: {
    label: 'STRAVA',
    desc: 'Sync runs, rides and swims so the stats on your card stay honest.',
    icon: 'activity',
  },
  garmin: {
    label: 'GARMIN',
    desc: 'Pair Garmin Connect and your sessions show up automatically.',
    icon: 'repeat',
  },
};

export default function ConnectScreen() {
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
      await updateMe(providerKey === 'garmin' ? { garminConnected: true } : { stravaConnected: true });
      setConnecting(false);
    }, 1400);
  }

  return (
    <YStack
      flex={1}
      bg="$ink"
      px={20}
      style={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 20 }}
    >
      <XStack items="center" gap={12} pb={14}>
        <IconButton size={40} onPress={() => router.back()}>
          <Icon name="chevron-left" size={14} color={colors.bone} />
        </IconButton>
        <Text fontFamily="$display" fontSize={30} color="$bone" textTransform="uppercase" lineHeight={30}>
          Connect
        </Text>
      </XStack>

      <YStack flex={1} justify="center" gap={20}>
        <XStack
          width={72}
          height={72}
          rounded={36}
          bg="$ash"
          borderWidth={1}
          borderColor="$line"
          items="center"
          justify="center"
        >
          <Icon name={p.icon} size={30} color={connected ? colors.ember : colors.fog} />
        </XStack>

        <YStack gap={8}>
          <Text fontFamily="$display" fontSize={30} color="$bone" textTransform="uppercase" lineHeight={30}>
            {p.label}
          </Text>
          <Text color="$fog" fontSize={13} lineHeight={20}>
            {p.desc}
          </Text>
        </YStack>

        {connected ? (
          <YStack p={18} rounded={16} bg="$emberSoft" borderWidth={1} borderColor="$emberBorder" gap={6}>
            <Text fontFamily="$mono" fontSize={10} letterSpacing={1.5} color="$ember" textTransform="uppercase">
              CONNECTED
            </Text>
            <Text fontSize={12} color="$fog" lineHeight={18}>
              {p.label} is syncing to your card. Your stats stay current automatically.
            </Text>
          </YStack>
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

        <Text color="$fog" fontSize={11} lineHeight={17} opacity={0.8}>
          Demo note: this is a simulated authorize screen. A real build opens {p.label}&apos;s
          OAuth page and swaps the timeout in connect() for the callback.
        </Text>
      </YStack>
    </YStack>
  );
}