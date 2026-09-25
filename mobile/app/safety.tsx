import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { Icon, IconName } from '../src/components/Icon';
import { Callout, ScreenHeader } from '../src/components/ui';
import { useColors } from '../src/theme/appearance';

// Safety centre. Meeting to train is already safer than meeting at a bar
// — this makes the defaults and habits explicit.

const TIPS: { icon: IconName; title: string; body: string }[] = [
  {
    icon: 'map-pin',
    title: 'Meet somewhere public',
    body: 'Invites suggest busy, public spots — promenades, parkruns, gyms. Stick to them for early sessions.',
  },
  {
    icon: 'users',
    title: 'Start with a group',
    body: 'Open group sessions are the easiest first meet. Train together with others around, then go 1-on-1.',
  },
  {
    icon: 'send',
    title: 'Share your plan',
    body: 'Turn on “Share plan with a friend” on any session to send the where and when to someone you trust.',
  },
  {
    icon: 'clock',
    title: 'Use the check-in timer',
    body: 'Turn it on and we’ll ask if you’re OK 90 minutes after a session starts.',
  },
  {
    icon: 'activity',
    title: 'Go at your pace',
    body: 'Pace matches effort levels so nobody gets dragged along. It’s fine to cut a session short.',
  },
  {
    icon: 'ban',
    title: 'Block anytime',
    body: 'Block someone from their profile and they can’t see you, message you or invite you again.',
  },
];

export default function SafetyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  return (
    <ScrollView flex={1} bg="$canvas" contentContainerStyle={{ pb: insets.bottom + 24 }}>
      <ScreenHeader
        title="Safety *centre*"
        subtitle="Training first makes meeting safer. Here’s how Pace helps."
        onBack={() => router.back()}
      />
      <YStack px={20} gap={12} mt={16}>
        {TIPS.map((t) => (
          <XStack
            key={t.title}
            gap={14}
            p={16}
            rounded={20}
            bg="$card"
            borderWidth={1}
            borderColor="$border"
          >
            <XStack
              width={40}
              height={40}
              rounded={12}
              bg="$successSoft"
              items="center"
              justify="center"
            >
              <Icon name={t.icon} size={19} color={colors.success} strokeWidth={2} />
            </XStack>
            <YStack flex={1} gap={3}>
              <Text fontFamily="$semibold" fontSize={16} color="$text">
                {t.title}
              </Text>
              <Text fontSize={14} lineHeight={20} color="$muted">
                {t.body}
              </Text>
            </YStack>
          </XStack>
        ))}
        <Callout icon="shield-check" tone="success" title="In an emergency">
          Call 10111 (SAPS) or 112 from any mobile. Pace is never a substitute for emergency
          services.
        </Callout>
      </YStack>
    </ScrollView>
  );
}
