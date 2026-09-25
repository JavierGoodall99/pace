import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, YStack } from 'tamagui';
import {
  Callout,
  Card,
  ScreenHeader,
  SectionTitle,
  SegmentedControl,
  ToggleRow,
} from '../src/components/ui';

const VISIBILITY_OPTIONS = ['EVERYONE', 'MATCHES ONLY'];

const TOGGLES: { label: string; hint: string; default: boolean }[] = [
  { label: 'Show pace & stats', hint: 'Your training stats on your card', default: true },
  { label: 'Show my city', hint: 'Used for match radius', default: true },
  {
    label: 'Public training photos',
    hint: 'Visible to people you haven’t matched with',
    default: false,
  },
];

export default function SettingsPrivacyScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [visibility, setVisibility] = useState<string>('EVERYONE');
  const [toggles, setToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(TOGGLES.map((t) => [t.label, t.default]))
  );

  return (
    <ScrollView flex={1} bg="$canvas" contentContainerStyle={{ pb: insets.bottom + 32 }}>
      <ScreenHeader
        title="Privacy"
        subtitle="You decide who sees what."
        onBack={() => router.back()}
      />

      <YStack px={20} pt={20} gap={28}>
        <YStack>
          <SectionTitle>Who can see your profile</SectionTitle>
          <SegmentedControl
            options={VISIBILITY_OPTIONS}
            value={visibility}
            onChange={setVisibility}
          />
        </YStack>

        <YStack>
          <SectionTitle>On your card</SectionTitle>
          <Card>
            {TOGGLES.map((t, i) => (
              <ToggleRow
                key={t.label}
                label={t.label}
                hint={t.hint}
                last={i === TOGGLES.length - 1}
                value={!!toggles[t.label]}
                onChange={(v) => setToggles((prev) => ({ ...prev, [t.label]: v }))}
              />
            ))}
          </Card>
        </YStack>

        <Callout icon="lock">
          {visibility === 'EVERYONE'
            ? 'Anyone on Pace can see your profile. Switch to Matches only to hide from Discover.'
            : 'Only people you match with can see your full profile.'}
        </Callout>
      </YStack>
    </ScrollView>
  );
}
