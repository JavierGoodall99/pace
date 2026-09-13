import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop, Text as SvgText } from 'react-native-svg';
import { Image, ScrollView, Text, XStack, YStack } from 'tamagui';
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
import { HERO_RUNNERS } from '../src/data/photos';
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

const BODY_STYLE = { px: 20, pt: 4, pb: 24, flexGrow: 1 };
const WELCOME_BODY_STYLE = { pb: 0, flexGrow: 1 };

// Warm glow behind the primary CTA — same recipe as the onboarding toast.
const CTA_STYLE = {
  width: '100%',
  height: 56,
  shadowColor: colors.ember,
  shadowOpacity: 0.4,
  shadowRadius: 20,
  shadowOffset: { width: 0, height: 6 },
  elevation: 8,
} as const;

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
      ) : step === 0 ? null : (
        <YStack height={insets.top + 12} />
      )}

      <ScrollView flex={1} contentContainerStyle={step === 0 ? WELCOME_BODY_STYLE : BODY_STYLE}>
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
          <YStack gap={12}>
            <Button style={CTA_STYLE} onPress={goNext}>
              Get Early Access
            </Button>
            <Text
              fontFamily="$mono"
              fontSize={12}
              letterSpacing={1.5}
              color="$fog"
              textTransform="uppercase"
              text="center"
            >
              I already have an account · Log in
            </Text>
            <Text fontSize={10} color="$fog" opacity={0.72} text="center">
              By continuing, you agree to PACE&apos;s Terms &amp; Community Code.
            </Text>
          </YStack>
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

// Actual pixel dimensions of `hero_runners.png` — used to size the hero by
// its real aspect ratio instead of a fraction of screen height, so `cover`
// never has to crop the sides (which used to slice off the left runner).
const HERO_ASPECT_RATIO = 1536 / 1024;

function WelcomeStep() {
  const { width, height } = useWindowDimensions();
  // Full-width, aspect-correct height: `cover` then has nothing to crop.
  // Clamped so very wide/short screens don't let the hero swallow the
  // whole viewport and squeeze the copy + CTA below it.
  const heroHeight = Math.min(Math.round(width / HERO_ASPECT_RATIO), Math.round(height * 0.42));

  const heroOpacity = useRef(new Animated.Value(0)).current;
  const bodyOpacity = useRef(new Animated.Value(0)).current;
  const bodyTranslate = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.stagger(140, [
      Animated.timing(heroOpacity, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(bodyOpacity, { toValue: 1, duration: 380, useNativeDriver: true }),
        Animated.timing(bodyTranslate, { toValue: 0, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
    ]).start();
    // Mount-once entrance choreography — deliberately no deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <YStack flex={1}>
      <Animated.View style={{ opacity: heroOpacity }}>
        <YStack>
          <Image source={HERO_RUNNERS} style={{ width: '100%', height: heroHeight }} resizeMode="cover" />
          <YStack position="absolute" t={0} l={0} r={0} height={heroHeight} pointerEvents="none">
            <Svg width="100%" height="100%">
              <Defs>
                <LinearGradient id="gatewayFade" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={colors.ink} stopOpacity={0} />
                  <Stop offset="1" stopColor={colors.ink} stopOpacity={1} />
                </LinearGradient>
              </Defs>
              <Rect width="100%" height="100%" fill="url(#gatewayFade)" />
            </Svg>
          </YStack>
        </YStack>
      </Animated.View>

      <Animated.View style={{ flex: 1, opacity: bodyOpacity, transform: [{ translateY: bodyTranslate }] }}>
        <YStack flex={1} px={20} pt={28} justify="center">
          <YStack accessibilityRole="header" accessibilityLabel="Match. Train. Date.">
            <Svg width="100%" height={120}>
              <SvgText x={0} y={32} fontFamily={fonts.display} fontSize={40} fill={colors.bone}>
                MATCH.
              </SvgText>
              <SvgText
                x={0}
                y={72}
                fontFamily={fonts.display}
                fontSize={40}
                fill="transparent"
                stroke={colors.bone}
                strokeWidth={1.5}
              >
                TRAIN.
              </SvgText>
              <SvgText x={0} y={112} fontFamily={fonts.display} fontSize={40} fill={colors.ember}>
                DATE.
              </SvgText>
            </Svg>
          </YStack>

          <Text fontSize={14} lineHeight={21} color="$bone" maxW={330} mt={20}>
            Dating apps waste your time with people who don&apos;t live like you.{' '}
            <Text color="$fog">PACE matches you with people who keep up.</Text>
          </Text>
        </YStack>
      </Animated.View>
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