import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, XStack, YStack } from 'tamagui';
import { Icon } from '../../src/components/Icon';
import { Button, Callout, ScreenHeader } from '../../src/components/ui';
import { showPip } from '../../src/components/PipKit';
import { updateMe, useMe } from '../../src/data/session';
import { importActivities, isProvider, PROVIDER_INFO, PROVIDER_LABEL } from '../../src/data/sync';
import { importSynced } from '../../src/data/training';
import { track } from '../../src/lib/analytics';
import { useColors } from '../../src/theme/appearance';
import { ConsentPrompt } from '../../src/components/Consent';
import { hasConsent, useConsents } from '../../src/data/consent';

export default function ConnectScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const me = useMe();
  const { provider } = useLocalSearchParams<{ provider?: string }>();
  const providerKey = isProvider(provider) ? provider : 'strava';
  const p = { ...PROVIDER_INFO[providerKey], label: PROVIDER_LABEL[providerKey] };
  const connected = me.connected.includes(providerKey);
  const [connecting, setConnecting] = useState(false);
  const consents = useConsents();

  function connect() {
    setConnecting(true);
    // Mock OAuth round-trip. A real build opens the provider's authorize
    // page, receives a code/token back, and swaps `updateMe` below for a
    // `connectProvider(providerKey, token)` endpoint call.
    setTimeout(async () => {
      const sync = importActivities(providerKey, me);
      // Dated activities land in the training log, which is what keeps
      // you "recently active" for other people's decks.
      importSynced(sync, me.disciplines[0] ?? 'RUNNING');
      await updateMe({
        connected: [...me.connected.filter((x) => x !== providerKey), providerKey],
        sync,
        pbs: me.pbs.map((pb) => ({ ...pb, source: providerKey })),
      });
      track('sync_connected', { provider: providerKey });
      showPip(`Imported ${sync.activities} activities. Stats verified!`, 'excited');
      setConnecting(false);
    }, 1400);
  }

  // Health data: ask first (once per consent version).
  if (!connected && !hasConsent('health', consents)) {
    return (
      <YStack flex={1} bg="$canvas" style={{ paddingBottom: insets.bottom + 20 }}>
        <ScreenHeader title={`Connect *${p.label}*`} onBack={() => router.back()} />
        <YStack flex={1} justify="center" px={20}>
          <ConsentPrompt kind="health" onAllow={() => {}} onDecline={() => router.back()} />
        </YStack>
      </YStack>
    );
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
            {`${p.label} is syncing to your card.`}
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

        {__DEV__ ? (
          <Text color="$muted" fontSize={13} lineHeight={19}>
            Dev: simulated connect screen. A real build opens {p.label}&apos;s permission screen.
          </Text>
        ) : null}
      </YStack>
    </YStack>
  );
}
