import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
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

// `Animated.Text` needs a component it can drive with animated styles —
// the shared Tamagui Text is the app's text primitive, so wrap that.
const AnimatedText = Animated.createAnimatedComponent(Text);

const BODY_STYLE = { px: 20, pt: 4, pb: 24, flexGrow: 1 };
const HERO_LINE = {
  fontFamily: fonts.display,
  fontSize: 46,
  color: colors.bone,
  textTransform: 'uppercase' as const,
  lineHeight: 46,
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
    <YStack flex={1} bg="$ink">
      {toastMsg ? (
        <Animated.View
          pointerEvents="none"
          style={[
            TOAST_STYLE,
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
          <Text fontFamily="$mono" fontSize={11} letterSpacing={1.5} color="$ink">
            {toastMsg}
          </Text>
        </Animated.View>
      ) : null}

      {showHeader ? (
        <YStack px={20} pb={12} gap={12} pt={insets.top + 8}>
          <XStack items="center" justify="space-between">
            <IconButton size={36} onPress={goBack}>
              <Icon name="chevron-left" size={13} color={colors.bone} />
            </IconButton>
            <Text fontFamily="$mono" fontSize={10} letterSpacing={3} color="$fog">
              STEP {step} / 6
            </Text>
            <YStack onPress={goNext} hitSlop={8} opacity={showSkip ? 1 : 0}>
              <Text fontFamily="$mono" fontSize={10} letterSpacing={2} color="$fog">
                SKIP
              </Text>
            </YStack>
          </XStack>
          <ProgressBar pct={(step / 6) * 100} />
        </YStack>
      ) : (
        <YStack height={insets.top + 12} />
      )}

      <ScrollView flex={1} contentContainerStyle={BODY_STYLE}>
        {step === 0 && <WelcomeStep />}

        {step === 1 && (
          <YStack>
            <Text fontFamily="$display" fontSize={30} color="$bone" textTransform="uppercase" lineHeight={30} mt={10}>
              Say hello.
            </Text>
            <Text color="$fog" fontSize={12} mt={8} mb={20}>
              Just enough for a warm introduction.
            </Text>
            <YStack gap={14}>
              <Input placeholder="FIRST NAME" value={name} onChangeText={setName} />
              <Input placeholder="AGE" value={age} onChangeText={setAge} />
              <Input placeholder="CITY" value={city} onChangeText={setCity} />
            </YStack>
          </YStack>
        )}

        {step === 2 && (
          <YStack>
            <Text fontFamily="$display" fontSize={30} color="$bone" textTransform="uppercase" lineHeight={30} mt={10}>
              Your sports.
            </Text>
            <Text color="$fog" fontSize={12} mt={8} mb={20}>
              Pick what you train. This is what we match on.
            </Text>
            <XStack flexWrap="wrap" gap={10}>
              {DISCIPLINES.map((d) => (
                <Chip key={d} label={d} selected={disciplines.includes(d)} onPress={() => toggleDiscipline(d)} />
              ))}
            </XStack>
          </YStack>
        )}

        {step === 3 && (
          <YStack>
            <Text fontFamily="$display" fontSize={30} color="$bone" textTransform="uppercase" lineHeight={30} mt={10}>
              Your rhythm.
            </Text>
            <Text color="$fog" fontSize={12} mt={8} mb={20}>
              How often, and when you actually train.
            </Text>
            <Text fontFamily="$mono" fontSize={10} letterSpacing={2} color="$bone">
              WEEKLY VOLUME
            </Text>
            <YStack mt={10}>
              <SegmentedControl options={CADENCE_OPTIONS} value={cadence} onChange={setCadence} />
            </YStack>
            <Text fontFamily="$mono" fontSize={10} letterSpacing={2} color="$bone" mt={22}>
              TIME OF DAY
            </Text>
            <XStack flexWrap="wrap" gap={10} mt={10}>
              {TIME_OPTIONS.map((t) => (
                <Chip key={t} label={t} selected={times.includes(t)} onPress={() => toggleTime(t)} />
              ))}
            </XStack>
          </YStack>
        )}

        {step === 4 && (
          <YStack>
            <Text fontFamily="$display" fontSize={30} color="$bone" textTransform="uppercase" lineHeight={30} mt={10}>
              Put a face to it.
            </Text>
            <Text color="$fog" fontSize={12} mt={8} mb={20}>
              One good photo beats a paragraph of bio.
            </Text>
            <XStack gap={10} height={260}>
              <YStack flex={1.4} rounded={18} bg="$ash" borderWidth={1} borderColor="$line" />
              <YStack flex={1} rounded={18} bg="$ash" borderWidth={1} borderColor="$line" />
              <YStack flex={1} rounded={18} bg="$ash" borderWidth={1} borderColor="$line" />
            </XStack>
            <XStack onPress={() => setPhotosAdded(true)} items="center" gap={8} mt={16} opacity={photosAdded ? 1 : 0.5}>
              <Icon name="check" size={13} color={photosAdded ? colors.ember : colors.fog} />
              <Text fontFamily="$mono" fontSize={10} letterSpacing={1.5} color={photosAdded ? '$ember' : '$fog'}>
                {photosAdded ? 'PHOTOS ADDED' : 'MARK PHOTOS AS ADDED'}
              </Text>
            </XStack>
          </YStack>
        )}

        {step === 5 && (
          <YStack>
            <Text fontFamily="$display" fontSize={30} color="$bone" textTransform="uppercase" lineHeight={30} mt={10}>
              Share your training.
            </Text>
            <Text color="$fog" fontSize={12} mt={8} mb={20}>
              Connect your data so your matches see the real, verified you.
            </Text>
            <YStack gap={10}>
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
            </YStack>
            <YStack
              mt={18}
              p={16}
              rounded={16}
              bg="rgba(255,77,46,0.06)"
              borderWidth={1}
              borderColor="rgba(255,77,46,0.25)"
            >
              <Text fontFamily="$mono" fontSize={10} letterSpacing={1.5} color="$ember">
                UNLOCKS SILVER TIER
              </Text>
              <Text fontSize={12} color="$fog" mt={6} lineHeight={18}>
                Wider match radius and a verified-stats badge on your card.
              </Text>
            </YStack>
          </YStack>
        )}

        {step === 6 && (
          <YStack>
            <Text fontFamily="$display" fontSize={30} color="$bone" textTransform="uppercase" lineHeight={30} mt={10}>
              You are you.
            </Text>
            <Text color="$fog" fontSize={12} mt={8} mb={20}>
              A quick liveness check — matched against your photo. Ten seconds, no document
              needed.
            </Text>
            <YStack items="center" gap={18} py={10}>
              <YStack width={140} height={140} rounded={70} borderWidth={3} bg="$ash" borderColor={verified ? '$ember' : '$line'} />
              <Button onPress={() => setVerified(true)} style={{ width: '100%' }}>
                {verified ? 'Verified' : 'Verify Me'}
              </Button>
              {verified ? (
                <XStack items="center" gap={8}>
                  <Icon name="shield-check" size={13} color={colors.ember} />
                  <Text fontFamily="$mono" fontSize={10} letterSpacing={1.5} color="$ember">
                    GOLD TIER UNLOCKED
                  </Text>
                </XStack>
              ) : null}
            </YStack>
          </YStack>
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

      <YStack
        px={20}
        pt={16}
        borderTopWidth={1}
        borderTopColor="$line"
        bg="$ink"
        style={{ paddingBottom: insets.bottom + 20 }}
      >
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
      </YStack>
    </YStack>
  );
}

function WelcomeStep() {
  const line1 = useRef(new Animated.ValueXY({ x: -28, y: 0 })).current;
  const line1Opacity = useRef(new Animated.Value(0)).current;
  const line2 = useRef(new Animated.ValueXY({ x: 28, y: 0 })).current;
  const line2Opacity = useRef(new Animated.Value(0)).current;
  const underline = useRef(new Animated.Value(0)).current;
  const bodyOpacity = useRef(new Animated.Value(0)).current;
  const bodyTranslate = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.stagger(110, [
      Animated.parallel([
        Animated.timing(line1, { toValue: { x: 0, y: 0 }, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(line1Opacity, { toValue: 1, duration: 380, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(line2, { toValue: { x: 0, y: 0 }, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(line2Opacity, { toValue: 1, duration: 380, useNativeDriver: true }),
      ]),
      Animated.timing(underline, { toValue: 1, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      Animated.parallel([
        Animated.timing(bodyOpacity, { toValue: 1, duration: 320, useNativeDriver: true }),
        Animated.timing(bodyTranslate, { toValue: 0, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      // Mount-once entrance choreography — deliberately no deps.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    ]).start();
  }, []);

  return (
    <YStack flex={1} justify="center" pb={40} minH={500}>
      <YStack pointerEvents="none" position="absolute" style={HERO_GLOW} />

      <AnimatedText style={[HERO_LINE, { opacity: line1Opacity, transform: [{ translateX: line1.x }] }]}>
        Let&apos;s build
      </AnimatedText>
      <AnimatedText
        style={[
          HERO_LINE,
          { color: colors.ember, opacity: line2Opacity, transform: [{ translateX: line2.x }] },
        ]}
      >
        your profile.
      </AnimatedText>

      <Animated.View
        style={{
          height: 3,
          borderRadius: 2,
          backgroundColor: colors.ember,
          marginTop: 18,
          width: underline.interpolate({ inputRange: [0, 1], outputRange: [0, 64] }),
        }}
      />

      <AnimatedText
        style={{
          color: colors.fog,
          fontSize: 13,
          lineHeight: 20,
          marginTop: 20,
          maxWidth: 300,
          opacity: bodyOpacity,
          transform: [{ translateY: bodyTranslate }],
        }}
      >
        Six quick steps. Each one sharpens your matches — no fluff, just the right people.
      </AnimatedText>
    </YStack>
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
    <XStack
      onPress={onPress}
      items="center"
      gap={12}
      px={16}
      py={14}
      rounded={16}
      borderWidth={1}
      borderColor={connected ? 'rgba(255,77,46,0.4)' : '$line'}
      bg="$ash"
    >
      <Icon name={icon} size={18} color={tint} />
      <Text flex={1} fontFamily="$mono" fontSize={12} letterSpacing={1} color="$bone">
        {label}
      </Text>
      <Text fontFamily="$mono" fontSize={10} letterSpacing={1} color={tint}>
        {connected ? 'CONNECTED' : 'CONNECT'}
      </Text>
    </XStack>
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
    <YStack items="center" pt={20}>
      <Text fontFamily="$mono" fontSize={10} letterSpacing={4} color="$ember">
        PROFILE STRENGTH · {profileStrength}%
      </Text>
      <Text fontFamily="$display" fontSize={32} color="$bone" textTransform="uppercase" lineHeight={32} mt={12} mb={4} text="center">
        Welcome to the pack.
      </Text>

      <Confetti pieces={CONFETTI_PIECES} />

      <YStack width="100%" mt={16} rounded={16} overflow="hidden" borderWidth={1} borderColor="$line" bg="$ash">
        <YStack height={260} bg="$coal" justify="space-between" p={12}>
          <Animated.View
            style={{ alignSelf: 'flex-end', opacity: badgeAnim, transform: [{ scale: badgeAnim.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0.5, 1.12, 1] }) }] }}
          >
            <Badge tone="accent">{badgeTierLabel}</Badge>
          </Animated.View>
          <YStack>
            <Text fontFamily="$mono" fontSize={14} color="$bone">
              {name || 'You'}, {age || '—'}
            </Text>
            <Text fontFamily="$mono" fontSize={10} color="$fog" mt={2}>
              {city || 'South Africa'}
            </Text>
          </YStack>
        </YStack>
        <XStack p={14} gap={8} flexWrap="wrap">
          {badges.map((d) => (
            <Badge key={d}>{d}</Badge>
          ))}
        </XStack>
      </YStack>
      <Text color="$fog" fontSize={12} lineHeight={18} mt={20} text="center">
        Your card looks great. Every step you took just made your matches feel a little more like
        home.
      </Text>
    </YStack>
  );
}

// Static frame styles used by the Animated wrappers — plain values
// because RN's Animated API consumes them directly.
const TOAST_STYLE = {
  position: 'absolute' as const,
  left: '50%' as const,
  marginLeft: -110,
  width: 220,
  zIndex: 40,
  backgroundColor: colors.ember,
  borderRadius: 999,
  paddingVertical: 10,
  paddingHorizontal: 18,
  alignItems: 'center' as const,
  shadowColor: colors.ember,
  shadowOpacity: 0.35,
  shadowRadius: 24,
  shadowOffset: { width: 0, height: 8 },
  elevation: 8,
};

const HERO_GLOW = {
  width: 380,
  height: 380,
  borderRadius: 190,
  backgroundColor: 'rgba(255,77,46,0.08)',
  left: -80,
  bottom: -60,
};