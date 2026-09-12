import { useRouter, type Href } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, IconName } from '../src/components/Icon';
import { PhotoSlot } from '../src/components/PhotoSlot';
import { Badge, IconButton } from '../src/components/ui';
import { ME_AVATAR } from '../src/data/photos';
import { colors, fonts } from '../src/theme/tokens';

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

  function confirmSignOut() {
    Alert.alert('Sign out', 'Are you sure? You can sign back in anytime.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive' },
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
      style={styles.screen}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 }}
    >
      <View style={styles.header}>
        <IconButton size={40} onPress={() => router.back()}>
          <Icon name="chevron-left" size={14} color={colors.bone} />
        </IconButton>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.accountCard}>
        <PhotoSlot label="Naledi" shape="circle" source={ME_AVATAR} style={styles.avatar} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.accountName}>Naledi Khumalo</Text>
          <Text style={styles.accountMeta}>naledi@pace.fit</Text>
        </View>
        <Badge tone="accent">GOLD · VERIFIED</Badge>
      </View>

      <Text style={styles.sectionLabel}>PREFERENCES</Text>
      <View style={styles.group}>
        {PREFERENCE_ROWS.map((row) => (
          <Row
            key={row.label}
            icon={row.icon}
            label={row.label}
            value={row.value}
            onPress={() => router.push(row.route)}
          />
        ))}
      </View>

      <Text style={styles.sectionLabel}>ACCOUNT</Text>
      <View style={styles.group}>
        <Row icon="log-out" label="Sign Out" danger onPress={confirmSignOut} />
        <Row icon="trash" label="Delete Account" danger onPress={confirmDelete} />
      </View>
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
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed ? styles.rowPressed : null]}
    >
      <View
        style={[
          styles.rowIcon,
          danger ? styles.rowIconDanger : null,
        ]}
      >
        <Icon name={icon} size={16} color={danger ? colors.ember : colors.fog} />
      </View>
      <Text style={[styles.rowLabel, danger ? styles.rowLabelDanger : null]}>{label}</Text>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      <Icon name="chevron-right" size={16} color={colors.fog} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 30,
    color: colors.bone,
    textTransform: 'uppercase',
    lineHeight: 30,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.ash,
  },
  avatar: { width: 60, height: 60 },
  accountName: {
    fontFamily: fonts.mono,
    fontSize: 13,
    letterSpacing: 0.5,
    color: colors.bone,
    textTransform: 'uppercase',
  },
  accountMeta: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1, color: colors.fog, marginTop: 4 },
  sectionLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 3,
    color: colors.ember,
    marginHorizontal: 20,
    marginTop: 26,
    marginBottom: 10,
  },
  group: {
    marginHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.ash,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
    backgroundColor: colors.ash,
  },
  rowPressed: { opacity: 0.7 },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.coal,
    borderWidth: 1,
    borderColor: colors.line,
  },
  rowIconDanger: {
    backgroundColor: 'rgba(255,77,46,0.08)',
    borderColor: 'rgba(255,77,46,0.3)',
  },
  rowLabel: {
    flex: 1,
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.bone,
    textTransform: 'uppercase',
  },
  rowLabelDanger: { color: colors.ember },
  rowValue: { fontFamily: fonts.mono, fontSize: 9, letterSpacing: 1, color: colors.fog },
});