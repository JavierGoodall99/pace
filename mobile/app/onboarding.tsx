import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { Image, ScrollView, Text, XStack, YStack } from 'tamagui';
import { buildConfettiPieces, Confetti } from '../src/components/Confetti';
import { Icon } from '../src/components/Icon';
import {
  Badge,
  Button,
  Chip,
  Callout,
  IconButton,
  Input,
  ProgressBar,
  SectionTitle,
  SegmentedControl,
} from '../src/components/ui';
import { DISCIPLINES, Discipline } from '../src/data/mockData';
import { HERO_RUNNERS } from '../src/data/photos';
import { completeOnboarding, updateMe, useMe } from '../src/data/session';
import { colors, shadow } from '../src/theme/tokens';

// Ported from `../Pace Onboarding.dc.html` — an 8-step flow (0-7):
// Welcome, Basics, Disciplines, Cadence, Photos, Activity Sync, Verify,
// Launch. Header/progress bar only show for steps 1-6. Also ports the
// "+N% profile strength" toast on each step advance, and the
// confetti + badge-pop celebration on Launch. Steps write straight into
// the session profile (`updateMe`), the same store Profile reads from.
const MAX_PHOTOS = 3;

const CADENCE_OPTIONS = ['2-3X/WK', '4-5X/WK', '6+X/WK'];
const TIME_OPTIONS = ['EARLY MORNING', 'EVENING', 'WEEKENDS'];
const STEP_WEIGHT = 100 / 6;

const CONFETTI_COLORS = [
  colors.accent,
  colors.peach,
  colors.lilac,
  colors.sun,
  colors.accent,
  colors.peach,
  colors.lilac,
  colors.accent,
  colors.sun,
  colors.peach,
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

// Soft glow behind the primary CTA — same recipe as the onboarding toast.
const CTA_STYLE = {
  width: '100%',
  height: 56,
  shadowColor: colors.accent,
  shadowOpacity: 0.3,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 6 },
  elevation: 6,
} as const;

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const me = useMe();

  const [step, setStep] = useState(0);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const toastAnim = useRef(new Animated.Value(0)).current;
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stepsDone = {
    basics: me.name.trim().length > 0,
    disciplines: me.disciplines.length > 0,
    cadence: !!me.cadence,
    photos: me.photos.length > 0,
    sync: me.stravaConnected || me.garminConnected,
    verify: me.verified,
  };

  const profileStrength = useMemo(() => {
    const completedCount = Object.values(stepsDone).filter(Boolean).length;
    return Math.round(completedCount * STEP_WEIGHT);
  }, [stepsDone]);

  const badgeTierLabel = stepsDone.verify
    ? 'Gold · Verified'
    : stepsDone.sync
      ? 'Silver'
      : stepsDone.basics && stepsDone.disciplines && stepsDone.cadence && stepsDone.photos
        ? 'Bronze'
        : 'Unverified';

  const nextDisabledMap: Record<number, boolean> = {
    1: !stepsDone.basics,
    2: !stepsDone.disciplines,
    3: !stepsDone.cadence,
    4: !stepsDone.photos,
    5: false,
    6: !stepsDone.verify,
  };
  const nextLabel =
    step === 5 ? (stepsDone.sync ? 'Continue' : 'Skip for now') : (NEXT_LABEL[step] ?? 'Continue');

  function toggleDiscipline(d: Discipline) {
    updateMe({
      disciplines: me.disciplines.includes(d)
        ? me.disciplines.filter((x) => x !== d)
        : [...me.disciplines, d],
    });
  }
  function toggleTime(t: string) {
    updateMe({
      times: me.times.includes(t) ? me.times.filter((x) => x !== t) : [...me.times, t],
    });
  }

  async function pickPhotos() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: Math.max(1, MAX_PHOTOS - me.photos.length),
      quality: 0.8,
    });
    if (result.canceled) return;
    const merged = [...me.photos, ...result.assets.map((a) => a.uri)].slice(0, MAX_PHOTOS);
    await updateMe({ photos: merged });
  }
  function showToast(msg: string) {
    setToastMsg(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastAnim.setValue(0);
    Animated.sequence([
      Animated.timing(toastAnim, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.delay(1400),
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
    toastTimer.current = setTimeout(() => setToastMsg(null), 1800);
  }
  function goNext() {
    const midStep = step >= 1 && step <= 6;
    if (midStep) showToast(`+${Math.round(STEP_WEIGHT)}% profile strength`);
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
    <YStack flex={1} bg="$canvas">
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
          <Text fontFamily="$semibold" fontSize={14} color="$onAccent">
            {toastMsg}
          </Text>
        </Animated.View>
      ) : null}

      {showHeader ? (
        <YStack px={20} pb={12} gap={12} pt={insets.top + 8}>
          <XStack items="center" justify="space-between">
            <IconButton size={40} onPress={goBack} accessibilityLabel="Back">
              <Icon name="chevron-left" size={20} color={colors.text} />
            </IconButton>
            <Text fontFamily="$medium" fontSize={14} color="$muted">
              Step {step} of 6
            </Text>
            <YStack
              onPress={goNext}
              hitSlop={8}
              opacity={showSkip ? 1 : 0}
              minW={40}
              items="flex-end"
            >
              <Text fontFamily="$semibold" fontSize={15} color="$muted">
                Skip
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
            <Text
              fontFamily="$bold"
              fontSize={28}
              lineHeight={34}
              letterSpacing={-0.5}
              color="$text"
              mt={12}
            >
              Say hello.
            </Text>
            <Text color="$muted" fontSize={16} lineHeight={24} mt={8} mb={24}>
              Just enough for a warm introduction.
            </Text>
            <YStack gap={14}>
              <Input
                placeholder="First name"
                value={me.name}
                onChangeText={(v) => updateMe({ name: v })}
              />
              <Input
                placeholder="Age"
                value={me.age}
                onChangeText={(v) => updateMe({ age: v })}
                keyboardType="numeric"
              />
              <Input
                placeholder="City"
                value={me.city}
                onChangeText={(v) => updateMe({ city: v })}
              />
            </YStack>
          </YStack>
        )}

        {step === 2 && (
          <YStack>
            <Text
              fontFamily="$bold"
              fontSize={28}
              lineHeight={34}
              letterSpacing={-0.5}
              color="$text"
              mt={12}
            >
              Your sports.
            </Text>
            <Text color="$muted" fontSize={16} lineHeight={24} mt={8} mb={24}>
              Pick what you train. This is what we match on.
            </Text>
            <XStack flexWrap="wrap" gap={10}>
              {DISCIPLINES.map((d) => (
                <Chip
                  key={d}
                  label={d}
                  selected={me.disciplines.includes(d)}
                  onPress={() => toggleDiscipline(d)}
                />
              ))}
            </XStack>
          </YStack>
        )}

        {step === 3 && (
          <YStack>
            <Text
              fontFamily="$bold"
              fontSize={28}
              lineHeight={34}
              letterSpacing={-0.5}
              color="$text"
              mt={12}
            >
              Your rhythm.
            </Text>
            <Text color="$muted" fontSize={16} lineHeight={24} mt={8} mb={24}>
              How often, and when you actually train.
            </Text>
            <SectionTitle>How often do you train?</SectionTitle>
            <YStack>
              <SegmentedControl
                options={CADENCE_OPTIONS}
                value={me.cadence}
                onChange={(v) => updateMe({ cadence: v })}
              />
            </YStack>
            <SectionTitle mt={28}>When do you like to train?</SectionTitle>
            <XStack flexWrap="wrap" gap={10}>
              {TIME_OPTIONS.map((t) => (
                <Chip
                  key={t}
                  label={t}
                  selected={me.times.includes(t)}
                  onPress={() => toggleTime(t)}
                />
              ))}
            </XStack>
          </YStack>
        )}

        {step === 4 && (
          <YStack>
            <Text
              fontFamily="$bold"
              fontSize={28}
              lineHeight={34}
              letterSpacing={-0.5}
              color="$text"
              mt={12}
            >
              Put a face to it.
            </Text>
            <Text color="$muted" fontSize={16} lineHeight={24} mt={8} mb={24}>
              One good photo beats a paragraph of bio. Pick up to three from your library.
            </Text>
            <XStack gap={10} height={260}>
              {[0, 1, 2].map((i) => {
                const uri = me.photos[i];
                const main = i === 0;
                return (
                  <YStack
                    key={i}
                    onPress={pickPhotos}
                    flex={main ? 1.4 : 1}
                    rounded={20}
                    bg={uri ? '$card' : '$surface'}
                    borderWidth={uri ? 0 : 1.5}
                    borderColor="$borderStrong"
                    borderStyle="dashed"
                    overflow="hidden"
                    items="center"
                    justify="center"
                  >
                    {uri ? (
                      <Image
                        source={{ uri }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                      />
                    ) : (
                      <YStack items="center" gap={8}>
                        <XStack
                          width={36}
                          height={36}
                          rounded={18}
                          bg="$accent"
                          items="center"
                          justify="center"
                        >
                          <Icon name="plus" size={20} color={colors.onAccent} strokeWidth={2.2} />
                        </XStack>
                        {main ? (
                          <Text fontFamily="$medium" fontSize={13} color="$muted">
                            Main photo
                          </Text>
                        ) : null}
                      </YStack>
                    )}
                  </YStack>
                );
              })}
            </XStack>
            <XStack onPress={pickPhotos} items="center" gap={8} mt={16}>
              <Icon
                name={me.photos.length > 0 ? 'check' : 'camera'}
                size={16}
                color={me.photos.length > 0 ? colors.success : colors.muted}
              />
              <Text
                fontFamily="$medium"
                fontSize={14}
                color={me.photos.length > 0 ? '$success' : '$muted'}
              >
                {me.photos.length > 0
                  ? `${me.photos.length} photo${me.photos.length === 1 ? '' : 's'} added · tap a tile to change`
                  : 'Tap a tile to add photos'}
              </Text>
            </XStack>
          </YStack>
        )}

        {step === 5 && (
          <YStack>
            <Text
              fontFamily="$bold"
              fontSize={28}
              lineHeight={34}
              letterSpacing={-0.5}
              color="$text"
              mt={12}
            >
              Share your training.
            </Text>
            <Text color="$muted" fontSize={16} lineHeight={24} mt={8} mb={24}>
              Connect your data so your matches see the real, verified you.
            </Text>
            <YStack gap={10}>
              <SyncRow
                icon="activity"
                label="Strava"
                connected={me.stravaConnected}
                onPress={() => router.push('/connect/strava')}
              />
              <SyncRow
                icon="repeat"
                label="Garmin"
                connected={me.garminConnected}
                onPress={() => router.push('/connect/garmin')}
              />
            </YStack>
            <YStack mt={18}>
              <Callout icon="sparkles" title="Unlocks Silver tier">
                A wider match radius and a verified-stats badge on your card.
              </Callout>
            </YStack>
          </YStack>
        )}

        {step === 6 && (
          <YStack>
            <Text
              fontFamily="$bold"
              fontSize={28}
              lineHeight={34}
              letterSpacing={-0.5}
              color="$text"
              mt={12}
            >
              You are you.
            </Text>
            <Text color="$muted" fontSize={16} lineHeight={24} mt={8} mb={24}>
              A quick liveness check — matched against your photo. Ten seconds, no document needed.
            </Text>
            <YStack items="center" gap={18} py={10}>
              <YStack
                width={140}
                height={140}
                rounded={70}
                borderWidth={3}
                bg={me.verified ? '$accentSoft' : '$surface'}
                borderColor={me.verified ? '$accent' : '$border'}
                items="center"
                justify="center"
              >
                <Icon
                  name="shield-check"
                  size={44}
                  color={me.verified ? colors.accent : colors.muted}
                />
              </YStack>
              <Button
                onPress={() => router.push('/verify')}
                style={{ width: '100%' }}
                disabled={me.verified}
              >
                {me.verified ? 'Verified' : 'Verify me'}
              </Button>
              {me.verified ? (
                <XStack items="center" gap={8}>
                  <Icon name="shield-check" size={16} color={colors.success} strokeWidth={2} />
                  <Text fontFamily="$semibold" fontSize={14} color="$success">
                    Gold tier unlocked
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
            name={me.name}
            age={me.age}
            city={me.city}
            disciplines={me.disciplines}
          />
        )}
      </ScrollView>

      <YStack
        px={20}
        pt={16}
        borderTopWidth={step === 0 ? 0 : 1}
        borderTopColor="$border"
        bg="$canvas"
        style={{ paddingBottom: insets.bottom + 20 }}
      >
        {step === 7 && (
          <Button
            style={{ width: '100%' }}
            onPress={async () => {
              await completeOnboarding();
              router.replace('/(tabs)/discover');
            }}
          >
            Start exploring
          </Button>
        )}
        {step === 0 && (
          <YStack gap={12}>
            <Button style={CTA_STYLE} onPress={goNext}>
              Get started
            </Button>
            <XStack justify="center" gap={4} py={6} onPress={() => router.push('/sign-in')}>
              <Text fontSize={15} color="$muted">
                Already have an account?
              </Text>
              <Text fontFamily="$semibold" fontSize={15} color="$accent">
                Log in
              </Text>
            </XStack>
            <Text fontSize={12} lineHeight={17} color="$muted" text="center">
              By continuing, you agree to Pace&apos;s Terms &amp; Community Code.
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
  const insets = useSafeAreaInsets();
  // Full-width, aspect-correct height: `cover` then has nothing to crop.
  // Clamped so very wide/short screens don't let the hero swallow the
  // whole viewport and squeeze the copy + CTA below it.
  const heroHeight = Math.min(Math.round(width / HERO_ASPECT_RATIO), Math.round(height * 0.42));

  const heroOpacity = useRef(new Animated.Value(0)).current;
  const bodyOpacity = useRef(new Animated.Value(0)).current;
  const bodyTranslate = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.stagger(140, [
      Animated.timing(heroOpacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(bodyOpacity, { toValue: 1, duration: 380, useNativeDriver: true }),
        Animated.timing(bodyTranslate, {
          toValue: 0,
          duration: 380,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
    // Mount-once entrance choreography — deliberately no deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <YStack flex={1}>
      <Animated.View style={{ opacity: heroOpacity }}>
        <YStack mt={insets.top + 12}>
          <Image
            source={HERO_RUNNERS}
            style={{ width: '100%', height: heroHeight }}
            resizeMode="cover"
          />
          <YStack position="absolute" t={0} l={0} r={0} height={heroHeight} pointerEvents="none">
            <Svg width="100%" height="100%">
              <Defs>
                <LinearGradient id="gatewayFade" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={colors.canvas} stopOpacity={0} />
                  <Stop offset="1" stopColor={colors.canvas} stopOpacity={1} />
                </LinearGradient>
              </Defs>
              <Rect width="100%" height="100%" fill="url(#gatewayFade)" />
            </Svg>
          </YStack>
        </YStack>
      </Animated.View>

      <Animated.View
        style={{ flex: 1, opacity: bodyOpacity, transform: [{ translateY: bodyTranslate }] }}
      >
        <YStack flex={1} px={24} pt={20} justify="center">
          <YStack accessibilityRole="header">
            <Text
              fontFamily="$heading"
              fontSize={44}
              lineHeight={50}
              letterSpacing={-1.2}
              color="$text"
            >
              Match. Train.
            </Text>
            <Text
              fontFamily="$heading"
              fontSize={44}
              lineHeight={50}
              letterSpacing={-1.2}
              color="$accent"
            >
              Date.
            </Text>
          </YStack>

          <Text fontSize={17} lineHeight={26} color="$muted" maxW={340} mt={16}>
            Meet people who share your love of moving — and actually keep up with you.
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
  const tint = connected ? colors.accent : colors.text;
  return (
    <XStack
      onPress={onPress}
      items="center"
      gap={12}
      pressStyle={{ opacity: 0.8 }}
      px={16}
      py={14}
      rounded={20}
      borderWidth={1}
      borderColor={connected ? '$accentBorder' : '$border'}
      bg="$card"
    >
      <XStack
        width={40}
        height={40}
        rounded={12}
        bg={connected ? '$accentSoft' : '$surface'}
        items="center"
        justify="center"
      >
        <Icon name={icon} size={20} color={tint} />
      </XStack>
      <Text flex={1} fontFamily="$semibold" fontSize={16} color="$text">
        {label}
      </Text>
      {connected ? (
        <Badge tone="success" icon="check">
          Connected
        </Badge>
      ) : (
        <Text fontFamily="$semibold" fontSize={15} color="$accent">
          Connect
        </Text>
      )}
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
    Animated.spring(badgeAnim, {
      toValue: 1,
      friction: 5,
      tension: 60,
      useNativeDriver: true,
    }).start();
    // Mount-once celebration — deliberately no deps, this should fire
    // exactly once when the Launch step appears.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const badges = disciplines.length ? disciplines : ['Athlete'];

  return (
    <YStack items="center" pt={20}>
      <Badge tone="accent" icon="zap">{`Profile strength ${profileStrength}%`}</Badge>
      <Text
        fontFamily="$bold"
        fontSize={28}
        lineHeight={34}
        letterSpacing={-0.5}
        color="$text"
        mt={14}
        mb={4}
        text="center"
      >
        Welcome to Pace
      </Text>

      <Confetti pieces={CONFETTI_PIECES} />

      <YStack
        width="100%"
        mt={20}
        rounded={24}
        overflow="hidden"
        borderWidth={1}
        borderColor="$border"
        bg="$card"
        style={shadow.raised}
      >
        <YStack height={240} bg="$accentSoft" justify="space-between" p={16}>
          <Animated.View
            style={{
              alignSelf: 'flex-end',
              opacity: badgeAnim,
              transform: [
                {
                  scale: badgeAnim.interpolate({
                    inputRange: [0, 0.6, 1],
                    outputRange: [0.5, 1.12, 1],
                  }),
                },
              ],
            }}
          >
            <Badge tone="accent" icon="shield-check" style={{ backgroundColor: colors.card }}>
              {badgeTierLabel}
            </Badge>
          </Animated.View>
          <YStack>
            <Text fontFamily="$bold" fontSize={24} lineHeight={30} color="$text">
              {name || 'You'}, {age || '—'}
            </Text>
            <XStack items="center" gap={5} mt={2}>
              <Icon name="map-pin" size={14} color={colors.muted} />
              <Text fontFamily="$medium" fontSize={14} color="$muted">
                {city || 'South Africa'}
              </Text>
            </XStack>
          </YStack>
        </YStack>
        <XStack p={14} gap={8} flexWrap="wrap">
          {badges.map((d) => (
            <Badge key={d}>{d}</Badge>
          ))}
        </XStack>
      </YStack>
      <Text color="$muted" fontSize={15} lineHeight={22} mt={20} text="center">
        Your card looks great. Every step you took helps us find people who really get you.
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
  backgroundColor: colors.accent,
  borderRadius: 999,
  paddingVertical: 10,
  paddingHorizontal: 18,
  alignItems: 'center' as const,
  shadowColor: colors.accent,
  shadowOpacity: 0.3,
  shadowRadius: 24,
  shadowOffset: { width: 0, height: 8 },
  elevation: 8,
};
