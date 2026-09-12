import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { Icon } from '../../src/components/Icon';
import { Badge, Button } from '../../src/components/ui';
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
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 24 }}
      >
        <View style={styles.hero}>
          {/* The image box is taller than the window and anchored to
              its top, so the crop shows the top of the action shot —
              a portrait source keeps its subject's head instead of
              cover-centering and clipping it. */}
          <Image
            source={ATHLETE_ACTION_PHOTOS[athlete.slotId]}
            style={styles.heroImage}
            resizeMode="cover"
          />

          {/* Header sits on the photo, held up by an ink fade so the
              back button reads cleanly over the image. */}
          <View pointerEvents="none" style={styles.topFade}>
            <Svg width="100%" height="100%">
              <Defs>
                <LinearGradient id="heroTopFade" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={colors.ink} stopOpacity={0.9} />
                  <Stop offset="1" stopColor={colors.ink} stopOpacity={0} />
                </LinearGradient>
              </Defs>
              <Rect width="100%" height="100%" fill="url(#heroTopFade)" />
            </Svg>
          </View>
          <View style={[styles.overlay, { top: 8 }]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back"
              onPress={() => router.back()}
              style={({ pressed }) => [styles.overlayBtn, pressed ? styles.overlayBtnPressed : null]}
            >
              <Icon name="chevron-left" size={14} color={colors.bone} />
            </Pressable>
          </View>

          {/* Bottom fade dissolves the photo into the body — no hard
              dividing line between the hero and the profile info. */}
          <View pointerEvents="none" style={styles.bottomFade}>
            <Svg width="100%" height="100%">
              <Defs>
                <LinearGradient id="heroBottomFade" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={colors.ink} stopOpacity={0} />
                  <Stop offset="1" stopColor={colors.ink} stopOpacity={1} />
                </LinearGradient>
              </Defs>
              <Rect width="100%" height="100%" fill="url(#heroBottomFade)" />
            </Svg>
          </View>
        </View>

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

          <View style={styles.statsRow}>
            <StatCard value={String(athlete.weekly)} label="SESSIONS/WK" />
            <StatCard value={athlete.pace} label="AVG PACE" />
            <StatCard value="94%" label="PROFILE MATCH" />
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
          style={{ flex: 1, paddingHorizontal: 12 }}
          onPress={() =>
            router.replace({
              pathname: '/(tabs)/planner',
              params: { partnerId: String(athlete.id) },
            })
          }
        >
          Plan Session
        </Button>
      </View>
    </View>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink },
  missing: { color: colors.fog, textAlign: 'center', marginTop: 100 },
  hero: {
    width: '100%',
    height: 400,
    backgroundColor: colors.ash,
    overflow: 'hidden',
  },
  heroImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: 620,
  },
  topFade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  overlay: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  overlayBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10,10,13,0.55)',
    borderWidth: 1,
    borderColor: colors.lineHover,
  },
  overlayBtnPressed: { opacity: 0.7 },
  bottomFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 130,
  },
  body: { paddingHorizontal: 20, marginTop: -36 },
  nameRow: { flexDirection: 'row', alignItems: 'baseline', gap: 10 },
  name: { fontFamily: fonts.display, fontSize: 34, color: colors.bone, textTransform: 'uppercase', lineHeight: 34 },
  age: { fontFamily: fonts.mono, fontSize: 14, color: colors.fog },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  verifiedText: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.5, color: colors.ember, textTransform: 'uppercase' },
  city: { fontFamily: fonts.mono, fontSize: 10, color: colors.fog },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
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
  statValue: { fontFamily: fonts.display, fontSize: 20, color: colors.bone, textAlign: 'center' },
  statLabel: { fontFamily: fonts.mono, fontSize: 9, color: colors.fog, letterSpacing: 1, marginTop: 4, textAlign: 'center' },
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