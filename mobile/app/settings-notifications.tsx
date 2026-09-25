import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, YStack } from 'tamagui';
import { Callout, Card, ScreenHeader, SectionTitle, ToggleRow } from '../src/components/ui';

const PUSH_ITEMS: { label: string; hint: string; default: boolean }[] = [
  { label: 'Likes & kudos', hint: 'When someone likes your run or workout', default: true },
  { label: 'Messages', hint: 'Direct messages from your matches', default: true },
  { label: 'New matches', hint: 'When someone you liked likes you back', default: true },
  { label: 'Session invites', hint: 'Planner invites to run, ride, or lift', default: true },
  { label: 'Training reminders', hint: 'Nudges when your streak is at risk', default: false },
];

const EMAIL_ITEMS: { label: string; hint: string; default: boolean }[] = [
  { label: 'Weekly digest', hint: 'Your week in pace, every Monday', default: true },
  { label: 'New match emails', hint: 'A note when you match', default: false },
  { label: 'Product updates', hint: 'New features and beta invites', default: false },
];

export default function SettingsNotificationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [push, setPush] = useState<Record<string, boolean>>(
    Object.fromEntries(PUSH_ITEMS.map((i) => [i.label, i.default]))
  );
  const [email, setEmail] = useState<Record<string, boolean>>(
    Object.fromEntries(EMAIL_ITEMS.map((i) => [i.label, i.default]))
  );

  return (
    <ScrollView flex={1} bg="$canvas" contentContainerStyle={{ pb: insets.bottom + 32 }}>
      <ScreenHeader
        title="Notifications"
        subtitle="Choose what pings you, and where."
        onBack={() => router.back()}
      />

      <YStack px={20} pt={20} gap={28}>
        <YStack>
          <SectionTitle>Push notifications</SectionTitle>
          <Card>
            {PUSH_ITEMS.map((item, i) => (
              <ToggleRow
                key={item.label}
                label={item.label}
                hint={item.hint}
                last={i === PUSH_ITEMS.length - 1}
                value={!!push[item.label]}
                onChange={(v) => setPush((prev) => ({ ...prev, [item.label]: v }))}
              />
            ))}
          </Card>
        </YStack>

        <YStack>
          <SectionTitle>Email</SectionTitle>
          <Card>
            {EMAIL_ITEMS.map((item, i) => (
              <ToggleRow
                key={item.label}
                label={item.label}
                hint={item.hint}
                last={i === EMAIL_ITEMS.length - 1}
                value={!!email[item.label]}
                onChange={(v) => setEmail((prev) => ({ ...prev, [item.label]: v }))}
              />
            ))}
          </Card>
        </YStack>

        <Callout icon="shield-check">
          We never sell your data. Notifications stay between you and your matches.
        </Callout>
      </YStack>
    </ScrollView>
  );
}
