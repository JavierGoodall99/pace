import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../src/components/Icon';
import { Chip, IconButton, SegmentedControl } from '../src/components/ui';
import { DISCIPLINES, Discipline } from '../src/data/mockData';
import { colors, fonts } from '../src/theme/tokens';

const CADENCE_OPTIONS = ['2-3X/WK', '4-5X/WK', '6+X/WK'];
const TIME_OPTIONS = ['EARLY MORNING', 'EVENING', 'WEEKENDS'];

export default function SettingsPreferencesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [disciplines, setDisciplines] = useState<Discipline[]>(['CROSSFIT', 'RUNNING']);
  const [cadence, setCadence] = useState<string>('4-5X/WK');
  const [times, setTimes] = useState<string[]>(['EARLY MORNING']);

  function toggleDiscipline(d: Discipline) {
    setDisciplines((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  }
  function toggleTime(t: string) {
    setTimes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
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
        <Text style={styles.title}>Training</Text>
      </View>
      <Text style={styles.subtitle}>What you train, and when. This is what we match on.</Text>

      <Text style={styles.label}>DISCIPLINES</Text>
      <View style={styles.chipWrap}>
        {DISCIPLINES.map((d) => (
          <Chip key={d} label={d} selected={disciplines.includes(d)} onPress={() => toggleDiscipline(d)} />
        ))}
      </View>

      <Text style={styles.label}>WEEKLY CADENCE</Text>
      <View style={styles.controlWrap}>
        <SegmentedControl options={CADENCE_OPTIONS} value={cadence} onChange={setCadence} />
      </View>

      <Text style={styles.label}>TIME OF DAY</Text>
      <View style={styles.chipWrap}>
        {TIME_OPTIONS.map((t) => (
          <Chip key={t} label={t} selected={times.includes(t)} onPress={() => toggleTime(t)} />
        ))}
      </View>

      <View style={styles.note}>
        <Icon name="zap" size={14} color={colors.ember} />
        <Text style={styles.noteText}>
          {disciplines.length > 0
            ? `Matching on ${disciplines.join(' · ')} · ${cadence}`
            : 'Pick at least one discipline to stay searchable.'}
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
  subtitle: { color: colors.fog, fontSize: 12, marginHorizontal: 20, marginTop: 8, marginBottom: 24, lineHeight: 18 },
  label: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 2, color: colors.bone, marginHorizontal: 20, marginBottom: 12 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginHorizontal: 20, marginBottom: 32 },
  controlWrap: { marginHorizontal: 20, marginBottom: 32 },
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