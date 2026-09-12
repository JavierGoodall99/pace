import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../../src/components/Icon';
import { PhotoSlot } from '../../src/components/PhotoSlot';
import { Badge, Button, IconButton } from '../../src/components/ui';
import { athleteById } from '../../src/data/mockData';
import { ATHLETE_ACTION_PHOTOS } from '../../src/data/photos';
import { colors, fonts } from '../../src/theme/tokens';

export default function AthleteDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const athlete = athleteById(Number(id));

  if (!athlete) {
    return (
      <View style={styles.screen}>
        <Text style={styles.missing}>Athlete not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <IconButton onPress={() => router.back()}>
          <Icon name="chevron-left" size={14} color={colors.bone} />
        </IconButton>
        <Text style={styles.topBarLabel}>{athlete.discipline}</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
        <PhotoSlot
          label={athlete.name}
          shape="rect"
          source={ATHLETE_ACTION_PHOTOS[athlete.slotId]}
          style={styles.hero}
        />

        <View style={styles.body}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{athlete.name}</Text>
            <Text style={styles.age}>{athlete.age}</Text>
          </View>
          <View style={styles.verifiedRow}>
            <Icon name="shield-check" size={14} color={colors.ember} />
            <Text style={styles.verifiedText}>Verified Athlete</Text>
            <Text style={styles.city}>· {athlete.city}</Text>
          </View>
          <View style={styles.badgeRow}>
            <Badge tone="accent">{athlete.discipline}</Badge>
            <Badge>{athlete.pace}</Badge>
          </View>
          <Text style={styles.bio}>{athlete.bio}</Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Button
          style={{ flex: 1 }}
          onPress={() =>
            router.replace({ pathname: '/thread/[athleteId]', params: { athleteId: String(athlete.id) } })
          }
        >
          Message
        </Button>
        <Button
          variant="ghost"
          style={{ flex: 1 }}
          onPress={() =>
            router.replace({
              pathname: '/(tabs)/planner',
              params: { partnerId: String(athlete.id) },
            })
          }
        >
          Plan a Session
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink },
  missing: { color: colors.fog, textAlign: 'center', marginTop: 100 },
  topBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  topBarLabel: { fontFamily: fonts.mono, fontSize: 11, letterSpacing: 2, color: colors.fog, textTransform: 'uppercase' },
  hero: { width: '100%', height: 300 },
  body: { paddingHorizontal: 20, marginTop: -16 },
  nameRow: { flexDirection: 'row', alignItems: 'baseline', gap: 10 },
  name: { fontFamily: fonts.display, fontSize: 34, color: colors.bone, textTransform: 'uppercase', lineHeight: 34 },
  age: { fontFamily: fonts.mono, fontSize: 14, color: colors.fog },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  verifiedText: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.5, color: colors.ember, textTransform: 'uppercase' },
  city: { fontFamily: fonts.mono, fontSize: 10, color: colors.fog },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
  bio: { color: colors.fog, fontSize: 13, lineHeight: 20, marginTop: 18 },
  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.ink,
  },
});
