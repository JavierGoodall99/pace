import { useRouter } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, YStack } from 'tamagui';
import { Callout, Card, ScreenHeader, SectionTitle, ToggleRow } from '../src/components/ui';
import { EmailKey, PushKey, setEmail, setPush, useSettings } from '../src/data/settings';
import { notify } from '../src/lib/dialogs';
import { allowNotifications } from '../src/lib/reminders';

const PUSH_ITEMS: { key: PushKey; label: string; hint: string }[] = [
  { key: 'likes', label: 'Likes & kudos', hint: 'When someone likes your run or workout' },
  { key: 'messages', label: 'Messages', hint: 'Direct messages from your matches' },
  { key: 'matches', label: 'New matches', hint: 'When someone you liked likes you back' },
  { key: 'invites', label: 'Session invites', hint: 'Planner invites to run, ride, or lift' },
  { key: 'reminders', label: 'Training reminders', hint: 'Nudges when your streak is at risk' },
];

const EMAIL_ITEMS: { key: EmailKey; label: string; hint: string }[] = [
  { key: 'digest', label: 'Weekly digest', hint: 'Your week in pace, every Monday' },
  { key: 'matchEmails', label: 'New match emails', hint: 'A note when you match' },
  { key: 'product', label: 'Product updates', hint: 'New features and beta invites' },
];

export default function SettingsNotificationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { push, email } = useSettings();

  return (
    <ScrollView flex={1} bg="$canvas" contentContainerStyle={{ pb: insets.bottom + 32 }}>
      <ScreenHeader
        title="Stay in the *loop*"
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
                value={push[item.key]}
                onChange={async (v) => {
                  // Reminders are scheduled on this phone, so they need permission now.
                  if (
                    v &&
                    item.key === 'reminders' &&
                    Platform.OS !== 'web' &&
                    !(await allowNotifications())
                  ) {
                    notify(
                      'Notifications are off',
                      'Turn on notifications for Pace in your phone settings to get training reminders.'
                    );
                    return;
                  }
                  setPush(item.key, v);
                }}
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
                value={email[item.key]}
                onChange={(v) => setEmail(item.key, v)}
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
