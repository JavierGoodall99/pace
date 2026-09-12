import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { buildConfettiPieces, Confetti } from '../src/components/Confetti';
import { Icon } from '../src/components/Icon';
import {
  Badge,
  Button,
  Chip,
  IconButton,
  Input,
  ProgressBar,
  SegmentedControl,
} from '../src/components/ui';
import { DISCIPLINES, Discipline } from '../src/data/mockData';
import { colors, fonts } from '../src/theme/tokens';

// Ported from `../Pace Onboarding.dc.html` — an 8-step flow (0-7):
// Welcome, Basics, Disciplines, Cadence, Photos, Activity Sync, Verify,
// Launch. Header/progress bar only show for steps 1-6. Also ports the
// "+N% profile strength" toast on each step advance, and the
// confetti + badge-pop celebration on Launch.

const CADENCE_OPTIONS = ['2-3X/WK', '4-5X/WK', '6+X/WK'];
const TIME_OPTIONS = ['EARLY MORNING', 'EVENING', 'WEEKENDS'];
const STEP_WEIGHT = 100 / 6;

const CONFETTI_COLORS = [
  colors.ember,
  colors.flare,
  colors.bone,
  colors.fog,
  colors.ember,
  colors.flare,
  colors.bone,
  colors.ember,
  colors.flare,
  colors.bone,
];

const NEXT_LABEL: Record<number, string> = {
  1: 'Continue',
  2: 'Continue',
  3: 'Continue',
  4: 'Continue',
  6: 'Continue',
};

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [city, setCity] = useState('');
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [cadence, setCadence] = useState<string | null>(null);
  const [times, setTimes] = useState<string[]>([]);
  const [photosAdded, setPhotosAdded] = useState(false);
  const [stravaConnected, setStravaConnected] = useState(false);
  const [garminConnected, setGarminConnected] = useState(false);
  const [verified, setVerified] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const toastAnim = useRef(new Animated.Value(0)).current;
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stepsDone = {
    basics: name.trim().length > 0,
    disciplines: disciplines.length > 0,
    cadence: !!cadence,
    photos: photosAdded,
    sync: stravaConnected || garminConnected,
    verify: verified,
  };

  const profileStrength = useMemo(() => {
    const completedCount = Object.values(stepsDone).filter(Boolean).length;
    return Math.round(completedCount * STEP_WEIGHT);
  }, [stepsDone]);

  const badgeTierLabel = stepsDone.verify
    ? 'GOLD · VERIFIED'
    : stepsDone.sync
    ? 'SILVER'
    : stepsDone.basics && stepsDone.disciplines && stepsDone.cadence && stepsDone.photos
    ? 'BRONZE'
    : 'UNVERIFIED';

  const nextDisabledMap: Record<number, boolean> = {
    1: !stepsDone.basics,
    2: !stepsDone.disciplines,
    3: !stepsDone.cadence,
    4: !stepsDone.photos,
    5: false,
    6: !stepsDone.verify,
  };
  const nextLabel = step === 5 ? (stepsDone.sync ? 'Continue' : 'Skip For Now') : NEXT_LABEL[step] ?? 'Continue';

  function toggleDiscipline(d: Discipline) {
    setDisciplines((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  }
  function toggleTime(t: string) {
    setTimes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }
  function showToast(msg: string) {
    setToastMsg(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastAnim.setValue(0);
    Animated.sequence([
      Animated.timing(toastAnim, { toValue: 1, duration: 200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.delay(1400),
      Animated.timing(toastAnim, { toValue: 0, duration: 200, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
    ]).start();
    toastTimer.current = setTimeout(() => setToastMsg(null), 1800);
  }
  function goNext() {
    const midStep = step >= 1 && step <= 6;
    if (midStep) showToast(`+${Math.round(STEP_WEIGHT)}% PROFILE STRENGTH`);
    setStep((s) => Math.min(s + 1, 7));
  }
  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const showHeader = step >= 1 && step <= 6;
  const showSkip = step === 5 && !stepsDone.sync;

  return (
    <View style={styles.screen}>
      {toastMsg ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.toast,
            {
              top: insets.top + 60,
              opacity: toastAnim,
              transform: [
                {
                  translateY: toastAnim.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.toastText}>{toastMsg}</Text>
        </Animated.View>
      ) : null}

      {showHeader ? (
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <View style={styles.headerRow}>
            <IconButton size={36} onPress={goBack}>
              <Icon name="chevron-left" size={13} color={colors.bone} />
            </IconButton>
            <Text style={styles.stepLabel}>STEP {step} / 6</Text>
            <Pressable onPress={goNext} hitSlop={8} style={{ opacity: showSkip ? 1 : 0 }}>
              <Text style={styles.skipLabel}>SKIP</Text>
            </Pressable>
          </View>
          <ProgressBar pct={(step / 6) * 100} />
        </View>
      ) : (
        <View style={{ height: insets.top + 12 }} />
      )}

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.body}>
        {step === 0 && (
          <View style={styles.welcome}>
            <View style={styles.welcomeIcon}>
              <Icon name="zap" size={28} color={colors.ember} />
            </View>
            <Text style={styles.welcomeEyebrow}>FOUNDING COHORT · BATCH 01</Text>
            <Text style={styles.welcomeTitle}>Let&apos;s build{'\n'}your profile.</Text>
            <Text style={styles.welcomeBody}>
              Six easy steps. Every one earns you profile strength and unlocks better matches —
              watch it grow as you go.
            </Text>
          </View>
        )}

        {step === 1 && (
          <View>
            <Text style={styles.stepTitle}>Say hello.</Text>
            <Text style={styles.stepSubtitle}>Just enough for a warm introduction.</Text>
            <View style={{ gap: 14 }}>
              <Input placeholder="FIRST NAME" value={name} onChangeText={setName} />
              <Input placeholder="AGE" value={age} onChangeText={setAge} />
              <Input placeholder="CITY" value={city} onChangeText={setCity} />
            </View>
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={styles.stepTitle}>Your sports.</Text>
            <Text style={styles.stepSubtitle}>Pick what you train. This is what we match on.</Text>
            <View style={styles.chipWrap}>
              {DISCIPLINES.map((d) => (
                <Chip key={d} label={d} selected={disciplines.includes(d)} onPress={() => toggleDiscipline(d)} />
              ))}
            </View>
          </View>
        )}

        {step === 3 && (
          <View>
            <Text style={styles.stepTitle}>Your rhythm.</Text>
            <Text style={styles.stepSubtitle}>How often, and when you actually train.</Text>
            <Text style={styles.label}>WEEKLY VOLUME</Text>
            <View style={{ marginTop: 10 }}>
              <SegmentedControl options={CADENCE_OPTIONS} value={cadence} onChange={setCadence} />
            </View>
            <Text style={[styles.label, { marginTop: 22 }]}>TIME OF DAY</Text>
            <View style={[styles.chipWrap, { marginTop: 10 }]}>
              {TIME_OPTIONS.map((t) => (
                <Chip key={t} label={t} selected={times.includes(t)} onPress={() => toggleTime(t)} />
              ))}
            </View>
          </View>
        )}

        {step === 4 && (
          <View>
            <Text style={styles.stepTitle}>Put a face to it.</Text>
            <Text style={styles.stepSubtitle}>One good photo beats a paragraph of bio.</Text>
            <View style={styles.photoGrid}>
              <View style={[styles.photoTile, styles.photoTileMain]} />
              <View style={styles.photoTile} />
              <View style={styles.photoTile} />
            </View>
            <Pressable onPress={() => setPhotosAdded(true)} style={[styles.confirmRow, { opacity: photosAdded ? 1 : 0.5 }]}>
              <Icon name="check" size={13} color={photosAdded ? colors.ember : colors.fog} />
              <Text style={[styles.confirmLabel, { color: photosAdded ? colors.ember : colors.fog }]}>
                {photosAdded ? 'PHOTOS ADDED' : 'MARK PHOTOS AS ADDED'}
              </Text>
            </Pressable>
          </View>
        )}

        {step === 5 && (
          <View>
            <Text style={styles.stepTitle}>Share your training.</Text>
            <Text style={styles.stepSubtitle}>
              Connect your data so your matches see the real, verified you.
            </Text>
            <View style={{ gap: 10 }}>
              <SyncRow
                icon="activity"
                label="STRAVA"
                connected={stravaConnected}
                onPress={() => setStravaConnected((v) => !v)}
              />
              <SyncRow
                icon="repeat"
                label="GARMIN"
                connected={garminConnected}
                onPress={() => setGarminConnected((v) => !v)}
              />
            </View>
            <View style={styles.silverBox}>
              <Text style={styles.silverLabel}>UNLOCKS SILVER TIER</Text>
              <Text style={styles.silverBody}>
                Wider match radius and a verified-stats badge on your card.
              </Text>
            </View>
          </View>
        )}

        {step === 6 && (
          <View>
            <Text style={styles.stepTitle}>You are you.</Text>
            <Text style={styles.stepSubtitle}>
              A quick liveness check — matched against your photo. Ten seconds, no document
              needed.
            </Text>
            <View style={styles.verifyBody}>
              <View style={[styles.selfie, { borderColor: verified ? colors.ember : colors.line }]} />
              <Button onPress={() => setVerified(true)} style={{ width: '100%' }}>
                {verified ? 'Verified' : 'Verify Me'}
              </Button>
              {verified ? (
                <View style={styles.confirmRow}>
                  <Icon name="shield-check" size={13} color={colors.ember} />
                  <Text style={[styles.confirmLabel, { color: colors.ember }]}>GOLD TIER UNLOCKED</Text>
                </View>
              ) : null}
            </View>
          </View>
        )}

        {step === 7 && (
          <LaunchStep
            profileStrength={profileStrength}
            badgeTierLabel={badgeTierLabel}
            name={name}
            age={age}
            city={city}
            disciplines={disciplines}
          />
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        {step === 7 && (
          <Button style={{ width: '100%' }} onPress={() => router.replace('/(tabs)/discover')}>
            Enter Pace
          </Button>
        )}
        {step === 0 && (
          <Button style={{ width: '100%' }} onPress={goNext}>
            Get Started
          </Button>
        )}
        {step >= 1 && step <= 6 && (
          <Button style={{ width: '100%' }} onPress={goNext} disabled={nextDisabledMap[step]}>
            {nextLabel}
          </Button>
        )}
      </View>
    </View>
  );
}

function SyncRow({
  icon,
  label,
  connected,
  onPress,
}: {
  icon: 'activity' | 'repeat';
  label: string;
  connected: boolean;
  onPress: () => void;
}) {
  const tint = connected ? colors.ember : colors.fog;
  return (
    <Pressable
      onPress={onPress}
      style={[styles.syncRow, { borderColor: connected ? 'rgba(255,77,46,0.4)' : colors.line }]}
    >
      <Icon name={icon} size={18} color={tint} />
      <Text style={styles.syncLabel}>{label}</Text>
      <Text style={[styles.syncStatus, { color: tint }]}>{connected ? 'CONNECTED' : 'CONNECT'}</Text>
    </Pressable>
  );
}

const CONFETTI_PIECES = buildConfettiPieces(CONFETTI_COLORS);

function LaunchStep({
  profileStrength,
  badgeTierLabel,
  name,
  age,
  city,
  disciplines,
}: {
  profileStrength: number;
  badgeTierLabel: string;
  name: string;
  age: string;
  city: string;
  disciplines: Discipline[];
}) {
  const badgeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(badgeAnim, { toValue: 1, friction: 5, tension: 60, useNativeDriver: true }).start();
    // Mount-once celebration — deliberately no deps, this should fire
    // exactly once when the Launch step appears.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const badges = disciplines.length ? disciplines : ['ATHLETE'];

  return (
    <View style={styles.launch}>
      <Text style={styles.launchEyebrow}>PROFILE STRENGTH · {profileStrength}%</Text>
      <Text style={styles.launchTitle}>Welcome to the pack.</Text>

      <Confetti pieces={CONFETTI_PIECES} />

      <View style={styles.launchCard}>
        <View style={styles.launchHero}>
          <Animated.View
            style={[
              styles.launchBadge,
              { opacity: badgeAnim, transform: [{ scale: badgeAnim.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0.5, 1.12, 1] }) }] },
            ]}
          >
            <Badge tone="accent">{badgeTierLabel}</Badge>
          </Animated.View>
          <View>
            <Text style={styles.launchName}>
              {name || 'You'}, {age || '—'}
            </Text>
            <Text style={styles.launchCity}>{city || 'South Africa'}</Text>
          </View>
        </View>
        <View style={styles.launchBadgeRow}>
          {badges.map((d) => (
            <Badge key={d}>{d}</Badge>
          ))}
        </View>
      </View>
      <Text style={styles.launchFooter}>
        Your card looks great. Every step you took just made your matches feel a little more like
        home.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink },
  toast: {
    position: 'absolute',
    left: '50%',
    marginLeft: -110,
    width: 220,
    zIndex: 40,
    backgroundColor: colors.ember,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignItems: 'center',
    shadowColor: colors.ember,
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  toastText: { fontFamily: fonts.mono, fontSize: 11, letterSpacing: 1.5, color: colors.ink },
  header: { paddingHorizontal: 20, paddingBottom: 12, gap: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepLabel: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 3, color: colors.fog },
  skipLabel: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 2, color: colors.fog },
  body: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 24, flexGrow: 1 },
  welcome: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 40, minHeight: 500 },
  welcomeIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.emberSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  welcomeEyebrow: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 4, color: colors.ember },
  welcomeTitle: {
    fontFamily: fonts.display,
    fontSize: 44,
    color: colors.bone,
    textTransform: 'uppercase',
    lineHeight: 40,
    textAlign: 'center',
    marginTop: 14,
  },
  welcomeBody: { color: colors.fog, fontSize: 13, lineHeight: 20, marginTop: 18, maxWidth: 280, textAlign: 'center' },
  stepTitle: { fontFamily: fonts.display, fontSize: 30, color: colors.bone, textTransform: 'uppercase', lineHeight: 30, marginTop: 10 },
  stepSubtitle: { color: colors.fog, fontSize: 12, marginTop: 8, marginBottom: 20 },
  label: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 2, color: colors.bone },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  photoGrid: { flexDirection: 'row', gap: 10, height: 260 },
  photoTile: { flex: 1, borderRadius: 18, backgroundColor: colors.ash, borderWidth: 1, borderColor: colors.line },
  photoTileMain: { flex: 1.4 },
  confirmRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16 },
  confirmLabel: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.5 },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: colors.ash,
  },
  syncLabel: { flex: 1, fontFamily: fonts.mono, fontSize: 12, letterSpacing: 1, color: colors.bone },
  syncStatus: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1 },
  silverBox: {
    marginTop: 18,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,77,46,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,77,46,0.25)',
  },
  silverLabel: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.5, color: colors.ember },
  silverBody: { fontSize: 12, color: colors.fog, marginTop: 6, lineHeight: 18 },
  verifyBody: { alignItems: 'center', gap: 18, paddingVertical: 10 },
  selfie: { width: 140, height: 140, borderRadius: 70, borderWidth: 3, backgroundColor: colors.ash },
  launch: { alignItems: 'center', paddingTop: 20 },
  launchEyebrow: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 4, color: colors.ember },
  launchTitle: {
    fontFamily: fonts.display,
    fontSize: 32,
    color: colors.bone,
    textTransform: 'uppercase',
    lineHeight: 32,
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  launchCard: { width: '100%', marginTop: 16, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: colors.line, backgroundColor: colors.ash },
  launchHero: { height: 260, backgroundColor: colors.coal, justifyContent: 'space-between', padding: 12 },
  launchBadge: { alignSelf: 'flex-end' },
  launchName: { fontFamily: fonts.mono, fontSize: 14, color: colors.bone },
  launchCity: { fontFamily: fonts.mono, fontSize: 10, color: colors.fog, marginTop: 2 },
  launchBadgeRow: { padding: 14, flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  launchFooter: { color: colors.fog, fontSize: 12, lineHeight: 18, marginTop: 20, textAlign: 'center' },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.ink,
  },
});
