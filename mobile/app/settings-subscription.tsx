import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { Icon } from '../src/components/Icon';
import { Badge, Button, Card, ScreenHeader } from '../src/components/ui';
import { useColors } from '../src/theme/appearance';

const PRO_FEATURES = [
  'Unlimited likes',
  'See who liked you',
  'Double the match radius',
  'Verified stats badge',
];

export default function SettingsSubscriptionScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <ScrollView flex={1} bg="$canvas" contentContainerStyle={{ pb: insets.bottom + 32 }}>
      <ScreenHeader title="Your *plan*" onBack={() => router.back()} />

      <YStack px={20} pt={20} gap={16}>
        <Card px={18} py={18}>
          <XStack items="center" gap={12}>
            <YStack flex={1}>
              <Text fontFamily="$bold" fontSize={20} color="$text">
                Pace Free
              </Text>
              <Text fontSize={14} color="$muted" mt={2}>
                R0 / month · forever
              </Text>
            </YStack>
            <Badge>Current plan</Badge>
          </XStack>
          <Text color="$muted" fontSize={15} lineHeight={22} mt={12}>
            5 likes a day, the standard match radius, and your training log.
          </Text>
        </Card>

        <YStack
          p={20}
          rounded={28}
          bg="$accentSoft"
          borderWidth={1}
          borderColor="$accentBorder"
          overflow="hidden"
        >
          <YStack
            position="absolute"
            t={-80}
            r={-60}
            width={200}
            height={200}
            rounded={100}
            bg="$card"
            opacity={0.5}
            pointerEvents="none"
          />
          <XStack items="flex-start" justify="space-between">
            <YStack>
              <Badge
                tone="accent"
                icon="sparkles"
                style={{ backgroundColor: colors.card, alignSelf: 'flex-start' }}
              >
                Go further
              </Badge>
              <Text
                fontFamily="$bold"
                fontSize={28}
                lineHeight={34}
                letterSpacing={-0.5}
                color="$text"
                mt={12}
              >
                Pace Pro
              </Text>
            </YStack>
            <XStack items="baseline" mt={40}>
              <Text fontFamily="$bold" fontSize={28} color="$accentText">
                R79
              </Text>
              <Text fontFamily="$medium" fontSize={14} color="$muted">
                {' '}
                / month
              </Text>
            </XStack>
          </XStack>

          <YStack mt={18} gap={12}>
            {PRO_FEATURES.map((f) => (
              <XStack key={f} items="center" gap={10}>
                <XStack
                  width={24}
                  height={24}
                  rounded={12}
                  bg="$accent"
                  items="center"
                  justify="center"
                >
                  <Icon name="check" size={14} color={colors.onAccent} strokeWidth={2.5} />
                </XStack>
                <Text flex={1} fontFamily="$medium" fontSize={15} color="$text">
                  {f}
                </Text>
              </XStack>
            ))}
          </YStack>

          <Button
            style={{ width: '100%', marginTop: 22 }}
            onPress={() =>
              Alert.alert(
                'Pace Pro',
                'Upgrade flow coming soon — this is a shipping milestone, not a live payment screen.',
                [{ text: 'Got it' }]
              )
            }
          >
            Upgrade to Pro
          </Button>
          <Button
            variant="ghost"
            style={{ width: '100%', marginTop: 10, backgroundColor: colors.card }}
            onPress={() =>
              Alert.alert('Manage payment', 'Payment method and receipts will live here.', [
                { text: 'Got it' },
              ])
            }
          >
            Manage payment
          </Button>
        </YStack>
      </YStack>
    </ScrollView>
  );
}
