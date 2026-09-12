import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../../src/components/Icon';
import { PhotoSlot } from '../../src/components/PhotoSlot';
import { Badge } from '../../src/components/ui';
import { colors, fonts } from '../../src/theme/tokens';

const STATS = [
  { value: '42KM', label: 'WEEKLY VOL.' },
  { value: '5', label: 'SESSIONS/WK' },
  { value: '94%', label: 'PROFILE MATCH' },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 24 }}>
      <PhotoSlot label="Cover photo" shape="rect" style={{ width: '100%', height: 160, marginTop: insets.top }} />

      <View style={styles.body}>
        <PhotoSlot label="Naledi" shape="circle" style={styles.avatar} />
        <Text style={styles.name}>Naledi Khumalo</Text>
        <View style={styles.verifiedRow}>
          <Icon name="shield-check" size={13} color={colors.ember} />
          <Text style={styles.verifiedText}>Verified · Pretoria</Text>
        </View>
        <Text style={styles.bio}>
          Competing at regionals next year. Coffee after WODs, always.
        </Text>
        <View style={styles.badgeRow}>
          <Badge tone="accent">CROSSFIT</Badge>
          <Badge>5X / WK</Badge>
        </View>

        <View style={styles.statsRow}>
          {STATS.map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.photosLabel}>TRAINING PHOTOS</Text>
        <View style={styles.photoGrid}>
          <PhotoSlot label="Photo" shape="rounded" style={styles.gridPhoto} />
          <PhotoSlot label="Photo" shape="rounded" style={styles.gridPhoto} />
          <PhotoSlot label="Photo" shape="rounded" style={styles.gridPhoto} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink },
  body: { paddingHorizontal: 20, marginTop: -40 },
  avatar: { width: 84, height: 84, borderWidth: 3, borderColor: colors.ink },
  name: {
    fontFamily: fonts.display,
    fontSize: 30,
    color: colors.bone,
    textTransform: 'uppercase',
    lineHeight: 30,
    marginTop: 14,
  },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  verifiedText: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.5, color: colors.ember, textTransform: 'uppercase' },
  bio: { color: colors.fog, fontSize: 13, lineHeight: 20, marginVertical: 14 },
  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.ash,
  },
  statValue: { fontFamily: fonts.display, fontSize: 22, color: colors.bone },
  statLabel: { fontFamily: fonts.mono, fontSize: 9, color: colors.fog, letterSpacing: 1, marginTop: 4 },
  photosLabel: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 2, color: colors.fog },
  photoGrid: { flexDirection: 'row', gap: 8, marginTop: 10 },
  gridPhoto: { flex: 1, aspectRatio: 1 },
});
