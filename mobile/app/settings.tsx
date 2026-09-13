import { useRouter, type Href } from 'expo-router';
import { Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { Icon, IconName } from '../src/components/Icon';
import { PhotoSlot } from '../src/components/PhotoSlot';
import { Badge, IconButton } from '../src/components/ui';
import { ME_AVATAR } from '../src/data/photos';
import { signOut, useMe } from '../src/data/session';
import { colors } from '../src/theme/tokens';

interface SettingsRow {
  icon: IconName;
  label: string;
  value?: string;
  route: Href;
}

const PREFERENCE_ROWS: SettingsRow[] = [
  {
    icon: 'zap',
    label: 'Training Preferences',
    value: 'CROSSFIT · 4-5X/WK',
    route: '/settings-preferences',
  },
  { icon: 'bell', label: 'Notifications', route: '/settings-notifications' },
  { icon: 'lock', label: 'Privacy', route: '/settings-privacy' },
  { icon: 'credit-card', label: 'Subscription', value: 'PACE FREE', route: '/settings-subscription' },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const me = useMe();

  const avatar = me.photos[0] ? { uri: me.photos[0] } : ME_AVATAR;

  function confirmSignOut() {
    Alert.alert('Sign out', 'Are you sure? You can sign back in anytime.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/sign-in');
        },
      },
    ]);
  }

  function confirmDelete() {
    Alert.alert(
      'Delete account',
      'This permanently removes your profile, photos, and match history. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete Account', style: 'destructive' },
      ]
    );
  }

  return (
    <ScrollView
      flex={1}
      bg="$ink"
      contentContainerStyle={{ pt: insets.top + 8, pb: insets.bottom + 24 }}
    >
      <XStack items="center" gap={12} px={20} pb={14}>
        <IconButton size={40} onPress={() => router.back()}>
          <Icon name="chevron-left" size={14} color={colors.bone} />
        </IconButton>
        <Text fontFamily="$display" fontSize={30} color="$bone" textTransform="uppercase" lineHeight={30}>
          Settings
        </Text>
      </XStack>

      <XStack items="center" gap={14} mx={20} p={16} rounded={20} borderWidth={1} borderColor="$line" bg="$ash">
        <PhotoSlot label={me.name} shape="circle" source={avatar} style={{ width: 60, height: 60 }} />
        <YStack flex={1} minW={0}>
          <Text fontFamily="$mono" fontSize={13} letterSpacing={0.5} color="$bone" textTransform="uppercase">
            {me.name || 'You'}
          </Text>
          <Text fontFamily="$mono" fontSize={10} letterSpacing={1} color="$fog" mt={4}>
            {me.email}
          </Text>
        </YStack>
        <Badge tone="accent">{me.verified ? 'GOLD · VERIFIED' : 'UNVERIFIED'}</Badge>
      </XStack>

      <Text fontFamily="$mono" fontSize={10} letterSpacing={3} color="$ember" mx={20} mt={26} mb={10}>
        PREFERENCES
      </Text>
      <YStack mx={20} rounded={20} borderWidth={1} borderColor="$line" bg="$ash" overflow="hidden">
        {PREFERENCE_ROWS.map((row) => (
          <Row
            key={row.label}
            icon={row.icon}
            label={row.label}
            value={row.value}
            onPress={() => router.push(row.route)}
          />
        ))}
      </YStack>

      <Text fontFamily="$mono" fontSize={10} letterSpacing={3} color="$ember" mx={20} mt={26} mb={10}>
        ACCOUNT
      </Text>
      <YStack mx={20} rounded={20} borderWidth={1} borderColor="$line" bg="$ash" overflow="hidden">
        <Row icon="log-out" label="Sign Out" danger onPress={confirmSignOut} />
        <Row icon="trash" label="Delete Account" danger onPress={confirmDelete} />
      </YStack>
    </ScrollView>
  );
}

function Row({
  icon,
  label,
  value,
  onPress,
  danger = false,
}: {
  icon: IconName;
  label: string;
  value?: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <XStack
      onPress={onPress}
      pressStyle={{ opacity: 0.7 }}
      items="center"
      gap={12}
      px={16}
      py={14}
      borderBottomWidth={0.5}
      borderBottomColor="$line"
      bg="$ash"
    >
      <XStack
        width={34}
        height={34}
        rounded={10}
        items="center"
        justify="center"
        bg={danger ? '$emberSoft' : '$coal'}
        borderWidth={1}
        borderColor={danger ? '$emberBorder' : '$line'}
      >
        <Icon name={icon} size={16} color={danger ? colors.ember : colors.fog} />
      </XStack>
      <Text
        flex={1}
        fontFamily="$mono"
        fontSize={11}
        letterSpacing={1}
        color={danger ? '$ember' : '$bone'}
        textTransform="uppercase"
      >
        {label}
      </Text>
      {value ? (
        <Text fontFamily="$mono" fontSize={9} letterSpacing={1} color="$fog">
          {value}
        </Text>
      ) : null}
      <Icon name="chevron-right" size={16} color={colors.fog} />
    </XStack>
  );
}