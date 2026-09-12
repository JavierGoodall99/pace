import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../src/components/Icon';
import { IconButton, SegmentedControl, ToggleRow } from '../src/components/ui';
import { colors, fonts } from '../src/theme/tokens';

const VISIBILITY_OPTIONS = ['EVERYONE', 'MATCHES ONLY'];

const TOGGLES: { label: string; hint: string; default: boolean }[] = [
  { label: 'Show Pace & Stats', hint: 'Your training stats on your card', default: true },
  { label: 'Show My City', hint: 'Used for match radius', default: true },
  { label: 'Public Training Photos', hint: 'Visible to un-matched athletes', default: false },
];

export default function SettingsPrivacyScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [visibility, setVisibility] = useState<string>('EVERYONE');
  const [toggles, setToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(TOGGLES.map((t) => [t.label, t.default]))
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
        <Text style={styles.title}>Privacy</Text>
      </View>
      <Text style={styles.subtitle}>You control who sees your pace.</Text>

      <Text style={styles.label}>PROFILE VISIBILITY</Text>
      <View style={styles.controlWrap}>
        <SegmentedControl options={VISIBILITY_OPTIONS} value={visibility} onChange={setVisibility} />
      </View>

      <Text style={styles.label}>ON MY CARD</Text>
      <View style={styles.group}>
        {TOGGLES.map((t, i) => (
          <View key={t.label} style={i === TOGGLES.length - 1 ? styles.lastRow : undefined}>
            <ToggleRow
              label={t.label}
              hint={t.hint}
              value={!!toggles[t.label]}
              onChange={(v) => setToggles((prev) => ({ ...prev, [t.label]: v }))}
            />
          </View>
        ))}
      </View>

      <View style={styles.note}>
        <Icon name="lock" size={14} color={colors.ember} />
        <Text style={styles.noteText}>
          {visibility === 'EVERYONE'
            ? 'Anyone on Pace can see your profile. Switch to Matches Only to hide from the discover deck.'
            : 'Only athletes you match with can see your full profile.'}
        </Text>
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
  controlWrap: { marginHorizontal: 20, marginBottom: 28 },
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