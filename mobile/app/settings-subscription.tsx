import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { Icon } from '../src/components/Icon';
import { Badge, Button, IconButton } from '../src/components/ui';
import { colors } from '../src/theme/tokens';

const PRO_FEATURES = [
  'Unlimited likes',
  'See who liked you',
  'Priority match radius · 2x',
  'Verified stats badge',
];

export default function SettingsSubscriptionScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

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
          Subscription
        </Text>
      </XStack>

      <YStack mx={20} mt={18} p={16} rounded={20} borderWidth={1} borderColor="$line" bg="$ash">
        <XStack items="center" gap={12}>
          <YStack flex={1}>
            <Text fontFamily="$display" fontSize={20} color="$bone" textTransform="uppercase" lineHeight={20}>
              PACE FREE
            </Text>
            <Text fontFamily="$mono" fontSize={10} letterSpacing={1.5} color="$fog" mt={4}>
              R0 / month · forever
            </Text>
          </YStack>
          <Badge>CURRENT PLAN</Badge>
        </XStack>
        <Text color="$fog" fontSize={12} lineHeight={18} mt={12}>
          5 likes a day, standard match radius, and your training log.
        </Text>
      </YStack>

      <YStack mx={20} mt={24} p={20} rounded={24} borderWidth={1} borderColor="rgba(255,77,46,0.4)" bg="$ash" overflow="hidden">
        <YStack position="absolute" t={-80} r={-60} width={200} height={200} rounded={100} bg="rgba(255,77,46,0.14)" pointerEvents="none" />
        <XStack items="flex-start" justify="space-between">
          <YStack>
            <Text fontFamily="$mono" fontSize={9} letterSpacing={3} color="$ember">
              GO FURTHER
            </Text>
            <Text fontFamily="$display" fontSize={30} color="$bone" textTransform="uppercase" lineHeight={30} mt={6}>
              PACE PRO
            </Text>
          </YStack>
          <XStack items="baseline">
            <Text fontFamily="$display" fontSize={30} color="$ember">
              R79
            </Text>
            <Text fontFamily="$mono" fontSize={10} color="$fog" letterSpacing={1}>
              {' '}/ MONTH
            </Text>
          </XStack>
        </XStack>

        <YStack mt={18} gap={10}>
          {PRO_FEATURES.map((f) => (
            <XStack key={f} items="center" gap={10}>
              <Icon name="check" size={14} color={colors.ember} />
              <Text flex={1} fontFamily="$mono" fontSize={11} letterSpacing={1} color="$bone">
                {f}
              </Text>
            </XStack>
          ))}
        </YStack>

        <Button
          style={{ width: '100%', marginTop: 18 }}
          onPress={() =>
            Alert.alert('Pace Pro', 'Upgrade flow coming soon — this is a shipping milestone, not a live payment screen.', [
              { text: 'Got It' },
            ])
          }
        >
          Upgrade to Pro
        </Button>
        <Button
          variant="ghost"
          style={{ width: '100%', marginTop: 10 }}
          onPress={() =>
            Alert.alert('Manage Payment', 'Payment method and receipts will live here.', [{ text: 'Got It' }])
          }
        >
          Manage Payment
        </Button>
      </YStack>
    </ScrollView>
  );
}