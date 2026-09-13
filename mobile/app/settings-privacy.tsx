import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { Icon } from '../src/components/Icon';
import { IconButton, SegmentedControl, ToggleRow } from '../src/components/ui';
import { colors } from '../src/theme/tokens';

const VISIBILITY_OPTIONS = ['EVERYONE', 'MATCHES ONLY'];

const TOGGLES: { label: string; hint: string; default: boolean }[] = [
  { label: 'Show Pace & Stats', hint: 'Your training stats on your card', default: true },
  { label: 'Show My City', hint: 'Used for match radius', default: true },
  { label: 'Public Training Photos', hint: 'Visible to un-matched athletes', default: false },
];

export default function SettingsPrivacyScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [visibility, setVisibility] = useState<string>('EVERYONE');
  const [toggles, setToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(TOGGLES.map((t) => [t.label, t.default]))
  );

  return (
    <ScrollView
      flex={1}
      bg="$ink"
      contentContainerStyle={{ pt: insets.top + 8, pb: insets.bottom + 24 }}
    >
      <XStack items="center" gap={12} px={20} pb={2}>
        <IconButton size={40} onPress={() => router.back()}>
          <Icon name="chevron-left" size={14} color={colors.bone} />
        </IconButton>
        <Text fontFamily="$display" fontSize={30} color="$bone" textTransform="uppercase" lineHeight={30}>
          Privacy
        </Text>
      </XStack>
      <Text color="$fog" fontSize={12} mx={20} mt={8} mb={24}>
        You control who sees your pace.
      </Text>

      <Text fontFamily="$mono" fontSize={10} letterSpacing={3} color="$ember" mx={20} mb={10}>
        PROFILE VISIBILITY
      </Text>
      <YStack mx={20} mb={28}>
        <SegmentedControl options={VISIBILITY_OPTIONS} value={visibility} onChange={setVisibility} />
      </YStack>

      <Text fontFamily="$mono" fontSize={10} letterSpacing={3} color="$ember" mx={20} mb={10}>
        ON MY CARD
      </Text>
      <YStack mx={20} mb={28} px={16} rounded={20} borderWidth={1} borderColor="$line" bg="$ash">
        {TOGGLES.map((t) => (
          <ToggleRow
            key={t.label}
            label={t.label}
            hint={t.hint}
            value={!!toggles[t.label]}
            onChange={(v) => setToggles((prev) => ({ ...prev, [t.label]: v }))}
          />
        ))}
      </YStack>

      <XStack
        items="center"
        gap={10}
        mx={20}
        p={14}
        rounded={16}
        bg="rgba(255,77,46,0.06)"
        borderWidth={1}
        borderColor="rgba(255,77,46,0.25)"
      >
        <Icon name="lock" size={14} color={colors.ember} />
        <Text flex={1} fontFamily="$mono" fontSize={10} letterSpacing={1} lineHeight={16} color="$fog">
          {visibility === 'EVERYONE'
            ? 'Anyone on Pace can see your profile. Switch to Matches Only to hide from the discover deck.'
            : 'Only athletes you match with can see your full profile.'}
        </Text>
      </XStack>
    </ScrollView>
  );
}