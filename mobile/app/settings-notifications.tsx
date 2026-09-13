import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { Icon } from '../src/components/Icon';
import { IconButton, ToggleRow } from '../src/components/ui';
import { colors } from '../src/theme/tokens';

const PUSH_ITEMS: { label: string; hint: string; default: boolean }[] = [
  { label: 'Likes & Kudos', hint: 'When someone likes your run or workout', default: true },
  { label: 'Messages', hint: 'Direct messages from your matches', default: true },
  { label: 'New Matches', hint: 'When a mutual grinder finds you', default: true },
  { label: 'Session Invites', hint: 'Planner invites to run, ride, or lift', default: true },
  { label: 'Training Reminders', hint: 'Nudges when your streak is at risk', default: false },
];

const EMAIL_ITEMS: { label: string; hint: string; default: boolean }[] = [
  { label: 'Weekly Digest', hint: 'Your week in pace, every Monday', default: true },
  { label: 'New Match Emails', hint: 'A note when you match', default: false },
  { label: 'Product Updates', hint: 'New features and beta invites', default: false },
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
          Notifications
        </Text>
      </XStack>
      <Text color="$fog" fontSize={12} mx={20} mt={8} mb={24}>
        Choose what pings you, and where.
      </Text>

      <Text fontFamily="$mono" fontSize={10} letterSpacing={3} color="$ember" mx={20} mb={10}>
        PUSH
      </Text>
      <YStack mx={20} mb={28} px={16} rounded={20} borderWidth={1} borderColor="$line" bg="$ash">
        {PUSH_ITEMS.map((item) => (
          <ToggleRow
            key={item.label}
            label={item.label}
            hint={item.hint}
            value={!!push[item.label]}
            onChange={(v) => setPush((prev) => ({ ...prev, [item.label]: v }))}
          />
        ))}
      </YStack>

      <Text fontFamily="$mono" fontSize={10} letterSpacing={3} color="$ember" mx={20} mb={10}>
        EMAIL
      </Text>
      <YStack mx={20} mb={28} px={16} rounded={20} borderWidth={1} borderColor="$line" bg="$ash">
        {EMAIL_ITEMS.map((item) => (
          <ToggleRow
            key={item.label}
            label={item.label}
            hint={item.hint}
            value={!!email[item.label]}
            onChange={(v) => setEmail((prev) => ({ ...prev, [item.label]: v }))}
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
        <Icon name="shield-check" size={14} color={colors.ember} />
        <Text flex={1} fontFamily="$mono" fontSize={10} letterSpacing={1} lineHeight={16} color="$fog">
          We never sell your data. Pings stay between you and the pack.
        </Text>
      </XStack>
    </ScrollView>
  );
}