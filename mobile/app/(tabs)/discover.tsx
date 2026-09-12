import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PhotoSlot } from '../../src/components/PhotoSlot';
import { Chip } from '../../src/components/ui';
import { ATHLETES, DISCIPLINES, Discipline } from '../../src/data/mockData';
import { colors, fonts } from '../../src/theme/tokens';

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selected, setSelected] = useState<Discipline>('RUNNING');

  const filtered = useMemo(
    () => ATHLETES.filter((a) => a.discipline === selected),
    [selected]
  );

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 24 }}
    >
      <View style={styles.header}>
        <Text style={styles.eyebrow}>FOUNDING COHORT · BATCH 01</Text>
        <Text style={styles.title}>Discover</Text>
        <Text style={styles.subtitle}>Pick a discipline to find athletes training like you.</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {DISCIPLINES.map((d) => (
          <Chip key={d} label={d} selected={d === selected} onPress={() => setSelected(d)} />
        ))}
      </ScrollView>

      <View style={styles.grid}>
        {filtered.map((a) => (
          <Pressable
            key={a.id}
            style={styles.card}
            onPress={() => router.push({ pathname: '/athlete/[id]', params: { id: String(a.id) } })}
          >
            <PhotoSlot label={a.name} shape="rect" style={styles.cardPhoto} />
            <View style={styles.cardOverlay} pointerEvents="none">
              <Text style={styles.cardName}>
                {a.name}, {a.age}
              </Text>
              <Text style={styles.cardMeta}>
                {a.pace} · {a.city}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink },
  header: { paddingHorizontal: 20, paddingBottom: 4 },
  eyebrow: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 3, color: colors.ember },
  title: {
    fontFamily: fonts.display,
    fontSize: 32,
    color: colors.bone,
    textTransform: 'uppercase',
    lineHeight: 32,
    marginTop: 8,
  },
  subtitle: { color: colors.fog, fontSize: 12, marginTop: 8, marginBottom: 16 },
  chipRow: { paddingHorizontal: 20, gap: 8, paddingBottom: 16 },
  grid: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: '47.5%',
    aspectRatio: 0.85,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.ash,
  },
  cardPhoto: { width: '100%', height: '100%' },
  cardOverlay: { position: 'absolute', left: 10, right: 10, bottom: 10 },
  cardName: { fontFamily: fonts.mono, fontSize: 12, color: colors.bone, letterSpacing: 0.5 },
  cardMeta: { fontFamily: fonts.mono, fontSize: 10, color: colors.fog, marginTop: 2 },
});
