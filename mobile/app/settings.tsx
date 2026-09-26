import { useRouter, type Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { Icon, IconName } from '../src/components/Icon';
import { PhotoSlot } from '../src/components/PhotoSlot';
import { Badge, Card, ScreenHeader, SegmentedControl } from '../src/components/ui';
import { ME_AVATAR } from '../src/data/photos';
import { daysPerWeek } from '../src/data/rhythm';
import { deleteAccountAndData } from '../src/data/account';
import type { LegalDoc } from '../src/data/legal';
import { getAccount, MeProfile, signInLabel, signOut, useMe } from '../src/data/session';
import { confirmAction } from '../src/lib/dialogs';
import { inviteFriend } from '../src/lib/inviteFriend';
import {
  AppearancePreference,
  setAppearance,
  useAppearance,
  useColors,
} from '../src/theme/appearance';
import { formatLabel, shadow } from '../src/theme/tokens';

interface SettingsRow {
  icon: IconName;
  label: string;
  value?: string;
  route: Href;
}

function trainingSummary(me: MeProfile): string {
  const sports = me.disciplines.map(formatLabel);
  const sport =
    sports.length > 1 ? `${sports[0]} +${sports.length - 1}` : (sports[0] ?? 'No sport');
  if (!me.cadence && !me.trainingDays?.some(Boolean)) return sport;
  return `${sport} · ${daysPerWeek(me.cadence, me.trainingDays)}× a week`;
}

const PREFERENCE_ROWS: SettingsRow[] = [
  { icon: 'zap', label: 'Training', route: '/settings-preferences' },
  { icon: 'bell', label: 'Notifications', route: '/settings-notifications' },
  { icon: 'lock', label: 'Privacy', route: '/settings-privacy' },
  { icon: 'shield-check', label: 'Safety centre', route: '/safety' },
  { icon: 'activity', label: 'Race mode', route: '/races' },
  { icon: 'credit-card', label: 'Subscription', value: 'Free', route: '/settings-subscription' },
];

const APPEARANCE_LABEL: Record<AppearancePreference, string> = {
  system: 'System',
  light: 'Light',
  dark: 'Dark',
};

const LEGAL_ROWS: { doc: LegalDoc; label: string; icon: IconName }[] = [
  { doc: 'terms', label: 'Terms of use', icon: 'flag' },
  { doc: 'privacy', label: 'Privacy policy', icon: 'lock' },
  { doc: 'community', label: 'Community code', icon: 'users' },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const me = useMe();
  const { preference } = useAppearance();

  const avatar = me.photos[0] ? { uri: me.photos[0] } : ME_AVATAR;

  async function confirmSignOut() {
    const ok = await confirmAction({
      title: 'Sign out',
      message: 'Are you sure? You can sign back in anytime.',
      confirmLabel: 'Sign out',
      destructive: true,
    });
    if (!ok) return;
    await signOut();
    router.replace('/sign-in');
  }

  async function confirmDelete() {
    const ok = await confirmAction({
      title: 'Delete account',
      message:
        'This permanently removes your profile, photos, and match history. This cannot be undone.',
      confirmLabel: 'Delete account',
      destructive: true,
    });
    if (!ok) return;
    await deleteAccountAndData();
    router.replace('/onboarding');
  }

  return (
    <ScrollView flex={1} bg="$canvas" contentContainerStyle={{ pb: insets.bottom + 32 }}>
      <ScreenHeader title="*Settings*" onBack={() => router.back()} />

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
            {signInLabel(getAccount(), me.email)}
          </Text>
        </YStack>
        <Badge
          tone={me.verified ? 'success' : 'neutral'}
          icon={me.verified ? 'shield-check' : undefined}
        >
          {me.verified ? 'Verified' : 'Unverified'}
        </Badge>
      </XStack>

      <GroupLabel>Appearance</GroupLabel>
      <YStack mx={20}>
        <SegmentedControl
          options={['System', 'Light', 'Dark']}
          value={APPEARANCE_LABEL[preference]}
          onChange={(v) => setAppearance(v.toLowerCase() as AppearancePreference)}
        />
      </YStack>

      <GroupLabel>Preferences</GroupLabel>
      <YStack mx={20}>
        <Card>
          {PREFERENCE_ROWS.map((row, i) => (
            <Row
              key={row.label}
              icon={row.icon}
              label={row.label}
              value={row.route === '/settings-preferences' ? trainingSummary(me) : row.value}
              last={i === PREFERENCE_ROWS.length - 1}
              onPress={() => router.push(row.route)}
            />
          ))}
        </Card>
      </YStack>

      <GroupLabel>Share Pace</GroupLabel>
      <YStack mx={20}>
        <Card>
          <Row icon="users" label="Invite a training friend" last onPress={inviteFriend} />
        </Card>
      </YStack>

      <GroupLabel>Legal</GroupLabel>
      <YStack mx={20}>
        <Card>
          {LEGAL_ROWS.map((row, i) => (
            <Row
              key={row.doc}
              icon={row.icon}
              label={row.label}
              last={i === LEGAL_ROWS.length - 1}
              onPress={() => router.push({ pathname: '/legal/[doc]', params: { doc: row.doc } })}
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
  const colors = useColors();
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
        <Icon name={icon} size={18} color={danger ? colors.accentText : colors.text} />
      </XStack>
      <Text flex={1} fontFamily="$medium" fontSize={16} color={danger ? '$accentText' : '$text'}>
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
