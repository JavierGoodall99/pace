import { useRouter, type Href } from 'expo-router';
import { Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { Icon, IconName } from '../src/components/Icon';
import { PhotoSlot } from '../src/components/PhotoSlot';
import { Badge, Card, ScreenHeader } from '../src/components/ui';
import { ME_AVATAR } from '../src/data/photos';
import { signOut, useMe } from '../src/data/session';
import { colors, shadow } from '../src/theme/tokens';

interface SettingsRow {
  icon: IconName;
  label: string;
  value?: string;
  route: Href;
}

const PREFERENCE_ROWS: SettingsRow[] = [
  {
    icon: 'zap',
    label: 'Training',
    value: 'CrossFit · 4–5× a week',
    route: '/settings-preferences',
  },
  { icon: 'bell', label: 'Notifications', route: '/settings-notifications' },
  { icon: 'lock', label: 'Privacy', route: '/settings-privacy' },
  { icon: 'credit-card', label: 'Subscription', value: 'Free', route: '/settings-subscription' },
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
        text: 'Sign out',
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
        { text: 'Delete account', style: 'destructive' },
      ]
    );
  }

  return (
    <ScrollView flex={1} bg="$canvas" contentContainerStyle={{ pb: insets.bottom + 32 }}>
      <ScreenHeader title="Settings" onBack={() => router.back()} />

      <XStack
        items="center"
        gap={14}
        mx={20}
        mt={16}
        p={16}
        rounded={20}
        borderWidth={1}
        borderColor="$border"
        bg="$card"
        style={shadow.card}
      >
        <PhotoSlot
          label={me.name}
          shape="circle"
          source={avatar}
          style={{ width: 56, height: 56 }}
        />
        <YStack flex={1} minW={0}>
          <Text fontFamily="$semibold" fontSize={17} color="$text" numberOfLines={1}>
            {me.name || 'You'}
          </Text>
          <Text fontSize={14} color="$muted" mt={2} numberOfLines={1}>
            {me.email}
          </Text>
        </YStack>
        <Badge
          tone={me.verified ? 'success' : 'neutral'}
          icon={me.verified ? 'shield-check' : undefined}
        >
          {me.verified ? 'Verified' : 'Unverified'}
        </Badge>
      </XStack>

      <GroupLabel>Preferences</GroupLabel>
      <YStack mx={20}>
        <Card>
          {PREFERENCE_ROWS.map((row, i) => (
            <Row
              key={row.label}
              icon={row.icon}
              label={row.label}
              value={row.value}
              last={i === PREFERENCE_ROWS.length - 1}
              onPress={() => router.push(row.route)}
            />
          ))}
        </Card>
      </YStack>

      <GroupLabel>Account</GroupLabel>
      <YStack mx={20}>
        <Card>
          <Row icon="log-out" label="Sign out" onPress={confirmSignOut} />
          <Row icon="trash" label="Delete account" danger last onPress={confirmDelete} />
        </Card>
      </YStack>
    </ScrollView>
  );
}

function GroupLabel({ children }: { children: string }) {
  return (
    <Text fontFamily="$semibold" fontSize={14} color="$muted" mx={24} mt={28} mb={8}>
      {children}
    </Text>
  );
}

function Row({
  icon,
  label,
  value,
  onPress,
  danger = false,
  last = false,
}: {
  icon: IconName;
  label: string;
  value?: string;
  onPress: () => void;
  danger?: boolean;
  last?: boolean;
}) {
  return (
    <XStack
      accessibilityRole="button"
      onPress={onPress}
      pressStyle={{ opacity: 0.7 }}
      items="center"
      gap={12}
      py={14}
      borderBottomWidth={last ? 0 : 1}
      borderBottomColor="$border"
    >
      <XStack
        width={36}
        height={36}
        rounded={10}
        items="center"
        justify="center"
        bg={danger ? '$accentSoft' : '$surface'}
      >
        <Icon name={icon} size={18} color={danger ? colors.accent : colors.text} />
      </XStack>
      <Text flex={1} fontFamily="$medium" fontSize={16} color={danger ? '$accent' : '$text'}>
        {label}
      </Text>
      {value ? (
        <Text fontSize={14} color="$muted" numberOfLines={1}>
          {value}
        </Text>
      ) : null}
      <Icon name="chevron-right" size={18} color={colors.muted} />
    </XStack>
  );
}
