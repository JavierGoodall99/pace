import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../src/components/Icon';
import { IconButton, ToggleRow } from '../src/components/ui';
import { colors, fonts } from '../src/theme/tokens';

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
      style={styles.screen}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 }}
    >
      <View style={styles.header}>
        <IconButton size={40} onPress={() => router.back()}>
          <Icon name="chevron-left" size={14} color={colors.bone} />
        </IconButton>
        <Text style={styles.title}>Notifications</Text>
      </View>
      <Text style={styles.subtitle}>Choose what pings you, and where.</Text>

      <Text style={styles.label}>PUSH</Text>
      <View style={styles.group}>
        {PUSH_ITEMS.map((item, i) => (
          <View key={item.label} style={i === PUSH_ITEMS.length - 1 ? styles.lastRow : undefined}>
            <ToggleRow
              label={item.label}
              hint={item.hint}
              value={!!push[item.label]}
              onChange={(v) => setPush((prev) => ({ ...prev, [item.label]: v }))}
            />
          </View>
        ))}
      </View>

      <Text style={styles.label}>EMAIL</Text>
      <View style={styles.group}>
        {EMAIL_ITEMS.map((item, i) => (
          <View key={item.label} style={i === EMAIL_ITEMS.length - 1 ? styles.lastRow : undefined}>
            <ToggleRow
              label={item.label}
              hint={item.hint}
              value={!!email[item.label]}
              onChange={(v) => setEmail((prev) => ({ ...prev, [item.label]: v }))}
            />
          </View>
        ))}
      </View>

      <View style={styles.note}>
        <Icon name="shield-check" size={14} color={colors.ember} />
        <Text style={styles.noteText}>We never sell your data. Pings stay between you and the pack.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 2,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 30,
    color: colors.bone,
    textTransform: 'uppercase',
    lineHeight: 30,
  },
  subtitle: { color: colors.fog, fontSize: 12, marginHorizontal: 20, marginTop: 8, marginBottom: 24 },
  label: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 3, color: colors.ember, marginHorizontal: 20, marginBottom: 10 },
  group: {
    marginHorizontal: 20,
    marginBottom: 28,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.ash,
  },
  lastRow: { borderBottomWidth: 0 },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255,77,46,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,77,46,0.25)',
  },
  noteText: { flex: 1, fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1, lineHeight: 16, color: colors.fog },
});