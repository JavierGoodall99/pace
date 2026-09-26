import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image as RNImage,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import type { IlloName } from '../src/components/Illustrations';
import { buildConfettiPieces, Confetti } from '../src/components/Confetti';
import { Icon, IconName } from '../src/components/Icon';
import { Mascot, Mood, SpeechBubble } from '../src/components/Mascot';
import { MyCard } from '../src/components/MyCard';
import { Aurora, PulseLine } from '../src/components/Motif';
import {
  OnboardingProgress,
  OptionCard,
  SportTile,
  StepEnter,
  WeekBuilder,
} from '../src/components/OnboardingKit';
import { PhotoSlot } from '../src/components/PhotoSlot';
import { PickRow } from '../src/components/Sessions';
import { PhotoGrid } from '../src/components/PhotoGrid';
import { RhythmStrip } from '../src/components/Rhythm';
import { Badge, Button, Callout, DisplayTitle, IconButton, Input } from '../src/components/ui';
import { track } from '../src/lib/analytics';
import { buy, configurePurchases, offeringFor, ONBOARDING_PLACEMENT } from '../src/lib/purchases';
import {
  AppleButton,
  googleEnabled,
  signInWithApple,
  signInWithGoogle,
  useAppleAvailable,
} from '../src/lib/socialAuth';
import { successHaptic } from '../src/lib/haptics';
import { forgetPhoto, keepAndCheck } from '../src/lib/photoStore';
import { ATHLETES, DISCIPLINES, Discipline, SPORT_ILLO } from '../src/data/mockData';
import { ATHLETE_PHOTOS, HERO_RUNNERS } from '../src/data/photos';
import {
  NO_DAYS,
  Rhythm,
  rhythmForMe,
  toggleTrainingDay,
  TRAINING_TIMES,
} from '../src/data/rhythm';
import { compatibility } from '../src/data/compat';
import { isEligible, wantEachOther } from '../src/data/pacers';
import {
  CITIES,
  distanceTo,
  HOME_CITY_OPTIONS,
  isLaunchCity,
  LAUNCH_CITY,
  OTHER_CITY,
} from '../src/data/places';
import { isOnWaitlist, joinWaitlist, useWaitlist } from '../src/data/waitlist';
import { DEFAULT_RADIUS_KM } from '../src/data/trust';
import { depthFor, LEVELS } from '../src/data/athleteDepth';
import { athletesTrainingFor, formatRaceDate, raceById, upcomingRaces } from '../src/data/races';
import { availableProviders, hasSync, PROVIDER_INFO, PROVIDER_LABEL } from '../src/data/sync';
import { seedDemoFor } from '../src/data/account';
import {
  answered,
  answerSummary,
  markPaywallSeen,
  markStarted,
  PROFILE_QUESTIONS,
  QUESTIONS,
  resumeIndex,
  saveProfileStep,
  STEPS,
  type StepId,
  type SummaryRow,
  useOnboardingProgress,
} from '../src/data/onboardingFlow';
import type { LegalDoc } from '../src/data/legal';
import { PRO_FEATURES } from '../src/data/pro';
import {
  completeOnboarding,
  createAccount,
  createSocialAccount,
  getAccount,
  Intent,
  MeProfile,
  MIN_PASSWORD,
  updateMe,
  useMe,
  useSession,
} from '../src/data/session';
import { DIETS, DRINKS, GENDERS, photoProblem, REST_DAYS } from '../src/data/identity';
import { useAppearance, useColors } from '../src/theme/appearance';
import { brand, formatLabel, shadow } from '../src/theme/tokens';

// Onboarding, Duolingo-style: Pip (the mascot) asks one question per
// screen and reacts to every answer, a chunky progress bar fills as the
// profile gets stronger, and the flow ends with a "building your
// matches" moment and a reveal of who already moves like you — so by
// the time the card is built, the user has something to lose.
//
// Every answer writes straight into the session profile (`updateMe`),
// the same store Profile and Discover read from. Step order, progress
// and resume live in src/data/onboardingFlow.ts.

const MAX_PHOTOS = 4;

const BODY_STYLE = { px: 20, pt: 8, pb: 24, flexGrow: 1 };
const WELCOME_BODY_STYLE = { pb: 0, flexGrow: 1 };

const INTENTS: { id: Intent; illo: IlloName; title: string; subtitle: string; reply: string }[] = [
  {
    id: 'love',
    illo: 'heart',
    title: 'Love',
    subtitle: 'Someone to date who shares my drive',
    reply: 'Someone who gets your 5am alarm? Love that.',
  },
  {
    id: 'partner',
    illo: 'buddies',
    title: 'A training partner',
    subtitle: 'Someone to train with — maybe more',
    reply: 'Accountability buddy it is. Who knows where it leads!',
  },
  {
    id: 'both',
    illo: 'sparkle',
    title: 'Open to both',
    subtitle: 'Let’s see where the miles take us',
    reply: 'Why choose? Best of both worlds.',
  },
];

const TIME_ILLO: Record<string, IlloName> = {
  'EARLY MORNING': 'sunrise',
  MIDDAY: 'sun',
  EVENING: 'moon',
  WEEKENDS: 'calendar',
};
const TIMES = TRAINING_TIMES.map((t) => ({ ...t, illo: TIME_ILLO[t.id] }));

const CONFETTI_COLORS = [
  brand.accent,
  brand.peach,
  brand.sky,
  brand.sun,
  brand.accent,
  brand.peach,
  brand.sky,
  brand.accent,
  brand.sun,
  brand.peach,
];

// Soft glow behind the primary CTA.
const CTA_STYLE = {
  width: '100%',
  height: 56,
  shadowColor: brand.accent,
  shadowOpacity: 0.3,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 6 },
  elevation: 6,
} as const;

// What Pip says on each step — a prompt until answered, then a reaction.
function pipLine(step: StepId, me: MeProfile): { text: string; mood: Mood } {
  const first = me.name.trim().split(' ')[0];
  const done = answered(step, me);
  switch (step) {
    case 'meet':
      return {
        text: 'Hey, I’m Pip! Let’s build your profile.',
        mood: 'excited',
      };
    case 'city': {
      const city = me.city.trim();
      if (done) return { text: 'Cape Town — we’re live there!', mood: 'excited' };
      if (city)
        return {
          text: `Not in ${city} yet — leave your email and I’ll tell you first.`,
          mood: 'thinking',
        };
      return { text: 'First things first: where do you train?', mood: 'happy' };
    }
    case 'name':
      return done
        ? { text: `Nice to meet you, ${first}!`, mood: 'excited' }
        : { text: 'What should I call you?', mood: 'happy' };
    case 'gender':
      return done
        ? {
            text: `Got it — I’ll show you ${me.gender === 'woman' ? 'men' : 'women'} who train like you.`,
            mood: 'happy',
          }
        : { text: 'Let’s get the basics right. I am a…', mood: 'happy' };
    case 'intent': {
      const pick = INTENTS.find((i) => i.id === me.intent);
      return pick
        ? { text: pick.reply, mood: 'wink' }
        : { text: 'What brings you to Pace?', mood: 'happy' };
    }
    case 'sports': {
      const n = me.disciplines.length;
      if (n === 0) return { text: 'What do you train? Pick as many as you like.', mood: 'happy' };
      if (n === 1)
        return {
          text: `A ${formatLabel(me.disciplines[0])} specialist. Respect.`,
          mood: 'excited',
        };
      return { text: `${n} sports — a true all-rounder!`, mood: 'excited' };
    }
    case 'week': {
      const n = me.trainingDays?.filter(Boolean).length ?? 0;
      if (n === 0) return { text: 'Tap the days you train.', mood: 'happy' };
      if (n <= 2)
        return {
          text: `${n} day${n === 1 ? '' : 's'} a week — every session counts!`,
          mood: 'happy',
        };
      if (n <= 4) return { text: `${n} days a week — that’s a solid rhythm!`, mood: 'excited' };
      if (n <= 6) return { text: `${n} days?! Serious dedication.`, mood: 'excited' };
      return { text: 'Every. Single. Day. Absolute legend.', mood: 'excited' };
    }
    case 'time':
      if (me.times.includes('EARLY MORNING'))
        return { text: 'An early bird! We’ll find you other early birds.', mood: 'excited' };
      if (done) return { text: 'Got it — same-clock matches.', mood: 'happy' };
      return { text: 'When do you like to train?', mood: 'happy' };
    case 'level': {
      const l = LEVELS.find((x) => x.id === me.level);
      if (!l)
        return {
          text: 'How hard do you go?',
          mood: 'happy',
        };
      if (l.id === 4)
        return { text: 'Racing mode! We’ll find people who can hang.', mood: 'excited' };
      if (l.id === 1)
        return { text: 'Chatty pace is the best pace. Great for first sessions.', mood: 'wink' };
      return {
        text: `${l.label} it is — we’ll keep your matches within reach.`,
        mood: 'excited',
      };
    }
    case 'goal': {
      if (me.goalRaceId === null)
        return {
          text: 'Training for a race?',
          mood: 'happy',
        };
      const race = raceById(me.goalRaceId);
      if (!race) return { text: 'No race? No problem — training is the point.', mood: 'happy' };
      const n = athletesTrainingFor(race.id).length;
      return {
        text: n
          ? `${race.name}! ${n} pacer${n === 1 ? ' is' : 's are'} training for it too.`
          : `${race.name} — let’s find you training partners.`,
        mood: 'excited',
      };
    }
    case 'basics':
      if (me.age && Number(me.age) < 18)
        return { text: 'Pace is for adults only — you need to be 18+.', mood: 'thinking' };
      if (done) return { text: 'Perfect. Nearly done!', mood: 'excited' };
      return { text: 'How old are you?', mood: 'happy' };
    case 'lifestyle':
      return done
        ? { text: 'Perfect. Deal-breakers sorted.', mood: 'excited' }
        : { text: 'Quick lifestyle check.', mood: 'happy' };
    case 'photos':
      if (done)
        return {
          text: 'Looking great!',
          mood: 'excited',
        };
      if (me.photos.length >= 2)
        return {
          text: photoProblem(me.photos, me.photoLabels, me.photoFaces) ?? 'Looking great!',
          mood: 'thinking',
        };
      return {
        text: 'Add 2–4 photos — one in action, one off the clock.',
        mood: 'happy',
      };
    case 'sync':
      return done
        ? { text: 'Synced! Your stats are verified.', mood: 'excited' }
        : {
            text: 'Connect your training app to prove you train.',
            mood: 'happy',
          };
    case 'verify':
      return done
        ? { text: 'Selfie check passed! You just unlocked Gold.', mood: 'excited' }
        : {
            text: 'Last one: a quick selfie check.',
            mood: 'happy',
          };
    case 'account':
      return { text: 'Nice! Here’s what you told me.', mood: 'excited' };
    case 'building':
      return { text: 'Finding people who move like you…', mood: 'thinking' };
    default:
      return { text: '', mood: 'happy' };
  }
}

// Waits for saved progress, then opens the flow at the first step that
// isn't done yet — so a closed app picks up where it left off.
export default function OnboardingScreen() {
  const me = useMe();
  const { signedIn, onboarded } = useSession();
  const progress = useOnboardingProgress();
  if (!progress.ready) return null;

  // First-timers create their account inside the flow; anyone who signed
  // up first skips that step. Fixed at mount so the step list doesn't
  // shift under the index once the account exists.
  const steps = signedIn ? STEPS.filter((s) => s !== 'account') : STEPS;
  // Finished users only get here from the dev preview: start at the top.
  const start = onboarded ? 0 : resumeIndex(steps, progress, me, signedIn);
  return <OnboardingFlow steps={steps} startIndex={start} />;
}

function OnboardingFlow({ steps, startIndex }: { steps: StepId[]; startIndex: number }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const me = useMe();
  const { signedIn, onboarded } = useSession();

  const [index, setIndex] = useState(startIndex);
  const step = steps[index];
  // Editing an answer from the Account summary comes straight back to it.
  const [returnTo, setReturnTo] = useState<number | null>(null);
  const appleAvailable = useAppleAvailable();
  const { scheme } = useAppearance();

  useEffect(() => {
    if (!onboarded) markStarted();
  }, [onboarded]);

  // Under-18s can't continue; log it once a full age is typed.
  const underage = me.age.length === 2 && Number(me.age) < 18;
  useEffect(() => {
    if (underage) track('age_blocked');
  }, [underage]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountError, setAccountError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const questionIndex = QUESTIONS.indexOf(step);
  const doneCount = PROFILE_QUESTIONS.filter((q) => answered(q, me)).length;
  const profileStrength = Math.round((doneCount / PROFILE_QUESTIONS.length) * 100);
  const stepDone = step === 'account' ? signedIn : answered(step, me);
  const progressPct =
    questionIndex >= 0 ? ((questionIndex + (stepDone ? 1 : 0.35)) / QUESTIONS.length) * 100 : 0;

  const myRhythm = rhythmForMe(me.cadence, me.trainingDays);
  const pip = pipLine(step, me);

  const badgeTierLabel = me.verified ? 'Gold · Live selfie' : hasSync(me) ? 'Silver' : 'Bronze';

  function next() {
    if (QUESTIONS.includes(step) && answered(step, me)) successHaptic();
    if (step === 'sync' && !hasSync(me)) track('sync_skipped');
    if (step === 'verify' && !me.verified) track('verify_skipped');
    saveProfileStep(step, signedIn);
    if (returnTo !== null) {
      setIndex(returnTo);
      setReturnTo(null);
      return;
    }
    setIndex((i) => Math.min(i + 1, steps.length - 1));
  }
  function editAnswer(target: StepId) {
    setReturnTo(index);
    setIndex(steps.indexOf(target));
  }
  function back() {
    setIndex((i) => Math.max(i - 1, 0));
  }
  function accountCreated(method: 'email' | 'apple' | 'google') {
    track('account_created', { method });
    // Purchases belong to the account, so RevenueCat starts here.
    const account = getAccount();
    if (account) configurePurchases(account.userId);
    next();
  }
  async function submitAccount() {
    setAccountError(null);
    setBusy(true);
    const result = await createAccount(email, password);
    setBusy(false);
    if (!result.ok) {
      setAccountError(result.error);
      return;
    }
    accountCreated('email');
  }
  async function socialAccount(method: 'apple' | 'google') {
    setAccountError(null);
    setBusy(true);
    const r = method === 'apple' ? await signInWithApple() : await signInWithGoogle();
    if (!r.ok) {
      setBusy(false);
      if (!r.cancelled) setAccountError(r.error ?? 'That didn’t work. Try again.');
      return;
    }
    const result = await createSocialAccount(r.profile);
    setBusy(false);
    if (!result.ok) {
      setAccountError(result.error);
      return;
    }
    accountCreated(method);
  }

  function toggleDiscipline(d: Discipline) {
    updateMe({
      disciplines: me.disciplines.includes(d)
        ? me.disciplines.filter((x) => x !== d)
        : [...me.disciplines, d],
    });
  }
  function toggleTime(t: string) {
    updateMe({ times: me.times.includes(t) ? me.times.filter((x) => x !== t) : [...me.times, t] });
  }
  function toggleDay(i: number) {
    updateMe(toggleTrainingDay(me.trainingDays, i));
  }
  async function pickPhotos() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: Math.max(1, MAX_PHOTOS - me.photos.length),
      quality: 0.8,
    });
    if (result.canceled) return;
    const picked = keepAndCheck(result.assets.map((a) => a.uri));
    const current = me.photos.map((uri, i) => ({ uri, faces: me.photoFaces[i] ?? null }));
    const merged = [...current, ...picked].slice(0, MAX_PHOTOS);
    await updateMe({
      photos: merged.map((p) => p.uri),
      photoFaces: merged.map((p) => p.faces),
      photosUpdatedAt: new Date().toISOString(),
    });
  }

  // Footer CTA per step.
  const skippable = step === 'sync' || step === 'verify';
  const canContinue =
    step === 'account'
      ? !!email.trim() && !!password && !busy
      : !QUESTIONS.includes(step) || answered(step, me) || skippable;
  const ctaLabel =
    returnTo !== null
      ? 'Done'
      : step === 'welcome'
        ? 'Get started'
        : step === 'meet'
          ? 'Let’s go!'
          : step === 'reveal'
            ? 'See my profile'
            : step === 'launch'
              ? 'Start exploring'
              : step === 'account'
                ? busy
                  ? 'Saving…'
                  : 'Create account'
                : skippable && !answered(step, me)
                  ? 'Maybe later'
                  : 'Continue';

  const showHeader = QUESTIONS.includes(step) || step === 'account';

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <YStack flex={1} bg="$canvas">
        {step === 'meet' || step === 'building' || step === 'reveal' ? (
          <Aurora height={620} />
        ) : null}
        {showHeader ? (
          <XStack px={20} pb={10} gap={12} items="center" pt={insets.top + 8}>
            <IconButton size={40} onPress={back} accessibilityLabel="Back">
              <Icon name="chevron-left" size={20} color={colors.text} />
            </IconButton>
            <OnboardingProgress pct={progressPct} />
            <XStack
              items="center"
              gap={3}
              accessibilityLabel={`Profile strength ${profileStrength}%`}
              aria-label={`Profile strength ${profileStrength}%`}
            >
              <Icon name="zap" size={18} color={colors.accentText} filled />
              <Text fontFamily="$bold" fontSize={15} color="$accentText">
                {profileStrength}%
              </Text>
            </XStack>
          </XStack>
        ) : step === 'welcome' ? null : (
          <YStack height={insets.top + 12} />
        )}

        <ScrollView
          flex={1}
          contentContainerStyle={step === 'welcome' ? WELCOME_BODY_STYLE : BODY_STYLE}
          keyboardShouldPersistTaps="handled"
        >
          {step === 'welcome' ? (
            <WelcomeStep />
          ) : (
            <StepEnter key={step}>
              {showHeader ? (
                <XStack items="flex-start" gap={14} mb={24}>
                  <Mascot size={76} mood={pip.mood} reactKey={pip.text} />
                  <YStack flex={1} pt={6}>
                    <SpeechBubble text={pip.text} />
                  </YStack>
                </XStack>
              ) : null}

              {step === 'meet' && <MeetStep text={pip.text} />}

              {step === 'city' && <CityStep />}

              {step === 'name' && (
                <Input
                  placeholder="Your first name"
                  value={me.name}
                  onChangeText={(v) => updateMe({ name: v })}
                  autoCapitalize="words"
                  autoComplete="name"
                  returnKeyType="next"
                  onSubmitEditing={() => answered('name', me) && next()}
                />
              )}

              {step === 'gender' && (
                <YStack gap={12}>
                  {GENDERS.map((g) => (
                    <OptionCard
                      key={g.id}
                      title={g.label}
                      selected={me.gender === g.id}
                      onPress={() => updateMe({ gender: g.id })}
                    />
                  ))}
                </YStack>
              )}

              {step === 'intent' && (
                <YStack gap={12}>
                  {INTENTS.map((i) => (
                    <OptionCard
                      key={i.id}
                      illo={i.illo}
                      title={i.title}
                      subtitle={i.subtitle}
                      selected={me.intent === i.id}
                      onPress={() => updateMe({ intent: i.id })}
                    />
                  ))}
                </YStack>
              )}

              {step === 'sports' && (
                <XStack flexWrap="wrap" justify="space-between" rowGap={12}>
                  {DISCIPLINES.map((d) => (
                    <SportTile
                      key={d}
                      illo={SPORT_ILLO[d]}
                      label={formatLabel(d)}
                      selected={me.disciplines.includes(d)}
                      onPress={() => toggleDiscipline(d)}
                    />
                  ))}
                </XStack>
              )}

              {step === 'week' && (
                <YStack gap={20}>
                  <XStack items="baseline" gap={8}>
                    <Text fontFamily="$display" fontSize={64} lineHeight={66} color="$accentText">
                      {me.trainingDays?.filter(Boolean).length ?? 0}
                    </Text>
                    <Text fontFamily="$semibold" fontSize={17} color="$muted">
                      days a week
                    </Text>
                  </XStack>
                  <WeekBuilder days={me.trainingDays ?? NO_DAYS} onToggle={toggleDay} />
                </YStack>
              )}

              {step === 'level' && (
                <YStack gap={12}>
                  {LEVELS.map((l) => (
                    <OptionCard
                      key={l.id}
                      illo={l.illo}
                      title={l.label}
                      subtitle={l.detail}
                      selected={me.level === l.id}
                      onPress={() => updateMe({ level: l.id })}
                    />
                  ))}
                </YStack>
              )}

              {step === 'goal' && (
                <YStack gap={12}>
                  {upcomingRaces().map((r) => {
                    const n = athletesTrainingFor(r.id).length;
                    return (
                      <OptionCard
                        key={r.id}
                        illo={r.illo}
                        title={r.name}
                        subtitle={`${formatRaceDate(r.date)} · ${r.city}${n ? ` · ${n} pacer${n === 1 ? '' : 's'}` : ''}`}
                        selected={me.goalRaceId === r.id}
                        onPress={() => updateMe({ goalRaceId: r.id })}
                      />
                    );
                  })}
                  <OptionCard
                    illo="seedling"
                    title="Nothing specific right now"
                    subtitle="Just training for the love of it"
                    selected={me.goalRaceId === ''}
                    onPress={() => updateMe({ goalRaceId: '' })}
                  />
                </YStack>
              )}

              {step === 'time' && (
                <YStack gap={12}>
                  {TIMES.map((t) => (
                    <OptionCard
                      key={t.id}
                      illo={t.illo}
                      title={t.title}
                      subtitle={t.subtitle}
                      selected={me.times.includes(t.id)}
                      onPress={() => toggleTime(t.id)}
                    />
                  ))}
                </YStack>
              )}

              {step === 'basics' && (
                <Input
                  placeholder="Age"
                  value={me.age}
                  onChangeText={(v) => updateMe({ age: v.replace(/[^0-9]/g, '').slice(0, 2) })}
                  keyboardType="numeric"
                />
              )}

              {step === 'lifestyle' && (
                <YStack gap={22}>
                  <YStack gap={10}>
                    <Text fontFamily="$semibold" fontSize={15} color="$text">
                      Drinking
                    </Text>
                    <PickRow
                      options={DRINKS.map((d) => d.id)}
                      value={me.lifestyle.drinks}
                      onChange={(v) => updateMe({ lifestyle: { ...me.lifestyle, drinks: v } })}
                      render={(v) => DRINKS.find((d) => d.id === v)!.label}
                    />
                  </YStack>
                  <YStack gap={10}>
                    <Text fontFamily="$semibold" fontSize={15} color="$text">
                      How you eat
                    </Text>
                    <PickRow
                      options={DIETS.map((d) => d.id)}
                      value={me.lifestyle.diet}
                      onChange={(v) => updateMe({ lifestyle: { ...me.lifestyle, diet: v } })}
                      render={(v) => DIETS.find((d) => d.id === v)!.label}
                    />
                  </YStack>
                  <YStack gap={10}>
                    <Text fontFamily="$semibold" fontSize={15} color="$text">
                      Rest day energy
                    </Text>
                    <YStack gap={10}>
                      {REST_DAYS.map((r) => (
                        <OptionCard
                          key={r.id}
                          title={r.label}
                          subtitle={r.detail}
                          selected={me.lifestyle.restDay === r.id}
                          onPress={() =>
                            updateMe({ lifestyle: { ...me.lifestyle, restDay: r.id } })
                          }
                        />
                      ))}
                    </YStack>
                  </YStack>
                </YStack>
              )}

              {step === 'photos' && (
                <PhotoGrid
                  max={MAX_PHOTOS}
                  photos={me.photos}
                  labels={me.photoLabels}
                  onPick={pickPhotos}
                  onLabel={(i, l) => {
                    const labels = [...me.photoLabels];
                    labels[i] = l;
                    updateMe({ photoLabels: labels });
                  }}
                  onRemove={(i) => {
                    forgetPhoto(me.photos[i]);
                    updateMe({
                      photos: me.photos.filter((_, k) => k !== i),
                      photoLabels: me.photoLabels.filter((_, k) => k !== i),
                      photoFaces: me.photoFaces.filter((_, k) => k !== i),
                    });
                  }}
                />
              )}

              {step === 'sync' && (
                <YStack gap={12}>
                  {availableProviders().map((p) => (
                    <SyncRow
                      key={p}
                      icon={PROVIDER_INFO[p].icon}
                      label={PROVIDER_LABEL[p]}
                      connected={me.connected.includes(p)}
                      onPress={() => router.push(`/connect/${p}`)}
                    />
                  ))}
                </YStack>
              )}

              {step === 'verify' && (
                <YStack items="center" gap={18} py={10}>
                  <YStack
                    width={150}
                    height={150}
                    rounded={75}
                    borderWidth={3}
                    bg={me.verified ? '$successSoft' : '$surface'}
                    borderColor={me.verified ? '$success' : '$accentBorder'}
                    items="center"
                    justify="center"
                  >
                    <Icon
                      name="shield-check"
                      size={56}
                      color={me.verified ? colors.success : colors.muted}
                      strokeWidth={1.6}
                    />
                  </YStack>
                  <Button
                    variant={me.verified ? 'secondary' : 'primary'}
                    icon={me.verified ? 'check' : 'camera'}
                    onPress={() => router.push('/verify')}
                    style={{ width: '100%' }}
                    disabled={me.verified}
                  >
                    {me.verified ? 'Selfie checked' : 'Start selfie check'}
                  </Button>
                  <Text fontSize={13} color="$muted" text="center">
                    Takes 10 seconds.
                  </Text>
                </YStack>
              )}

              {step === 'account' && (
                <YStack gap={14}>
                  <DisplayTitle size={34}>Save your *profile*</DisplayTitle>
                  <AnswerSummary rows={answerSummary(me)} onEdit={editAnswer} />
                  {appleAvailable ? (
                    <AppleButton dark={scheme === 'dark'} onPress={() => socialAccount('apple')} />
                  ) : null}
                  {googleEnabled ? (
                    <Button
                      variant="secondary"
                      disabled={busy}
                      onPress={() => socialAccount('google')}
                      style={{ width: '100%' }}
                    >
                      Continue with Google
                    </Button>
                  ) : null}
                  {appleAvailable || googleEnabled ? (
                    <Text fontSize={13} color="$muted" text="center">
                      or use email
                    </Text>
                  ) : null}
                  <Input
                    placeholder="Email"
                    value={email}
                    onChangeText={(v) => {
                      setEmail(v);
                      setAccountError(null);
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    returnKeyType="next"
                  />
                  <Input
                    placeholder={`Password (${MIN_PASSWORD}+ characters)`}
                    value={password}
                    onChangeText={(v) => {
                      setPassword(v);
                      setAccountError(null);
                    }}
                    secureTextEntry
                    autoCapitalize="none"
                    autoComplete="new-password"
                    returnKeyType="go"
                    onSubmitEditing={() => canContinue && submitAccount()}
                  />
                  {accountError ? (
                    <Text fontFamily="$medium" fontSize={14} color="$accentText" lineHeight={20}>
                      {accountError}
                    </Text>
                  ) : null}
                </YStack>
              )}

              {step === 'building' && <BuildingStep text={pip.text} onDone={next} />}

              {step === 'paywall' && <PaywallStep onDone={next} />}

              {step === 'reveal' && <RevealStep me={me} rhythm={myRhythm} />}

              {step === 'launch' && (
                <LaunchStep
                  profileStrength={profileStrength}
                  badgeTierLabel={badgeTierLabel}
                  me={me}
                  rhythm={myRhythm}
                />
              )}
            </StepEnter>
          )}
        </ScrollView>

        {step === 'building' || step === 'paywall' ? null : (
          <YStack
            px={20}
            pt={14}
            bg="$canvas"
            borderTopWidth={step === 'welcome' ? 0 : 1}
            borderTopColor="$border"
            style={{ paddingBottom: insets.bottom + 16 }}
          >
            <Button
              style={CTA_STYLE}
              disabled={!canContinue}
              onPress={async () => {
                if (step === 'launch') {
                  successHaptic();
                  // Only a first run seeds; re-running onboarding keeps real matches.
                  if (!onboarded) await seedDemoFor(me.gender);
                  saveProfileStep(step, signedIn);
                  await completeOnboarding();
                  track('onboarding_completed');
                  router.replace('/(tabs)/today');
                } else if (step === 'account') {
                  await submitAccount();
                } else {
                  next();
                }
              }}
            >
              {ctaLabel}
            </Button>
            {step === 'welcome' ? (
              <YStack gap={10} mt={12}>
                <XStack justify="center" gap={4} py={4} onPress={() => router.push('/sign-in')}>
                  <Text fontSize={15} color="$muted">
                    Already have an account?
                  </Text>
                  <Text fontFamily="$semibold" fontSize={15} color="$accentText">
                    Log in
                  </Text>
                </XStack>
                <Text fontSize={12} lineHeight={17} color="$muted" text="center">
                  By continuing, you agree to Pace&apos;s <LegalLink doc="terms">Terms</LegalLink>,{' '}
                  <LegalLink doc="community">Community Code</LegalLink> and{' '}
                  <LegalLink doc="privacy">Privacy Policy</LegalLink>.
                </Text>
              </YStack>
            ) : null}
          </YStack>
        )}
      </YStack>
    </KeyboardAvoidingView>
  );
}

function LegalLink({ doc, children }: { doc: LegalDoc; children: string }) {
  const router = useRouter();
  return (
    <Text
      fontSize={12}
      fontFamily="$semibold"
      color="$text"
      textDecorationLine="underline"
      accessibilityRole="link"
      onPress={() => router.push({ pathname: '/legal/[doc]', params: { doc } })}
    >
      {children}
    </Text>
  );
}

// Soft paywall after Reveal: shown once, easy to skip. Loads the
// RevenueCat offering for the "onboarding_end" placement; with no offering
// (keys not set, web, nothing configured) it steps aside silently.
type Offering = NonNullable<Awaited<ReturnType<typeof offeringFor>>>;

function PaywallStep({ onDone }: { onDone: () => void }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [offering, setOffering] = useState<Offering | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    const account = getAccount();
    (account ? offeringFor(ONBOARDING_PLACEMENT, account.userId) : Promise.resolve(null)).then(
      (o) => {
        if (!live) return;
        markPaywallSeen();
        if (!o) {
          onDone();
          return;
        }
        track('paywall_viewed');
        setOffering(o);
      }
    );
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!offering) return null;
  const pkg = offering.availablePackages[0];

  async function purchase() {
    setBusy(true);
    setError(null);
    const result = await buy(pkg);
    setBusy(false);
    if (result === 'purchased') {
      track('purchase_completed', { product: pkg.product.identifier });
      successHaptic();
      onDone();
    } else if (result === 'failed') {
      setError('That didn’t go through. You haven’t been charged.');
    }
  }

  return (
    <YStack flex={1} gap={20} style={{ paddingBottom: insets.bottom }}>
      <DisplayTitle size={40}>Go *Pro*</DisplayTitle>
      <YStack gap={12}>
        {PRO_FEATURES.map((f) => (
          <XStack key={f} gap={10} items="center">
            <Icon name="check" size={18} color={colors.accentText} strokeWidth={2.4} />
            <Text flex={1} fontSize={16} color="$text">
              {f}
            </Text>
          </XStack>
        ))}
      </YStack>
      <YStack flex={1} />
      {error ? (
        <Text fontSize={14} color="$accentText" text="center">
          {error}
        </Text>
      ) : null}
      <Button onPress={purchase} disabled={busy} style={CTA_STYLE}>
        {busy ? 'One moment…' : `Start Pro · ${pkg.product.priceString}`}
      </Button>
      <XStack justify="center">
        <Text
          fontFamily="$semibold"
          fontSize={16}
          color="$muted"
          py={8}
          accessibilityRole="button"
          onPress={() => {
            track('paywall_skipped');
            onDone();
          }}
        >
          Not now
        </Text>
      </XStack>
    </YStack>
  );
}

// Account screen: what they're about to save. Tap a row to change it.
function AnswerSummary({ rows, onEdit }: { rows: SummaryRow[]; onEdit: (step: StepId) => void }) {
  const colors = useColors();
  return (
    <YStack rounded={20} borderWidth={1} borderColor="$border" bg="$card" px={16} py={4}>
      {rows.map((r, i) => (
        <XStack
          key={r.step}
          items="center"
          gap={12}
          py={11}
          borderBottomWidth={i === rows.length - 1 ? 0 : 1}
          borderBottomColor="$border"
          pressStyle={{ opacity: 0.6 }}
          accessibilityRole="button"
          accessibilityLabel={`Change ${r.label}`}
          onPress={() => onEdit(r.step)}
        >
          <Text width={72} fontSize={14} color="$muted">
            {r.label}
          </Text>
          <Text flex={1} fontFamily="$semibold" fontSize={15} color="$text" numberOfLines={1}>
            {r.value || '—'}
          </Text>
          <Icon name="pencil" size={14} color={colors.muted} />
        </XStack>
      ))}
    </YStack>
  );
}

function MeetStep({ text }: { text: string }) {
  return (
    <YStack flex={1} items="center" justify="center" gap={28} py={20}>
      <Mascot size={180} mood="excited" reactKey="meet" />
      <YStack width="100%" items="center" px={8}>
        <YStack
          bg="$card"
          borderWidth={1.5}
          borderColor="$border"
          rounded={24}
          px={20}
          py={18}
          style={shadow.card}
        >
          <Text fontFamily="$semibold" fontSize={19} lineHeight={27} color="$text" text="center">
            {text}
          </Text>
        </YStack>
      </YStack>
      <Text fontSize={14} color="$muted" text="center">
        A few minutes
      </Text>
    </YStack>
  );
}

// "Building your matches" — a short, satisfying checklist that ticks
// through, then hands off to the reveal on its own.
const BUILD_STEPS = [
  'Reading your weekly rhythm',
  'Finding athletes nearby',
  'Calculating sync scores',
];

function BuildingStep({ text, onDone }: { text: string; onDone: () => void }) {
  const [done, setDone] = useState(0);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const timers = BUILD_STEPS.map((_, i) => setTimeout(() => setDone(i + 1), 900 * (i + 1)));
    const finish = setTimeout(
      () => {
        successHaptic();
        onDoneRef.current();
      },
      900 * BUILD_STEPS.length + 700
    );
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(finish);
    };
  }, []);

  return (
    <YStack flex={1} items="center" justify="center" gap={24} py={20}>
      <Mascot size={150} mood="thinking" />
      <DisplayTitle size={36} center>
        Building your *matches*
      </DisplayTitle>
      <YStack width={220}>
        <PulseLine width={220} height={36} />
      </YStack>
      <YStack width="100%" gap={12} px={8}>
        {BUILD_STEPS.map((label, i) => {
          const complete = i < done;
          const active = i === done;
          return (
            <XStack key={label} items="center" gap={12} opacity={complete || active ? 1 : 0.4}>
              <XStack
                width={28}
                height={28}
                rounded={14}
                items="center"
                justify="center"
                bg={complete ? '$success' : '$surface'}
              >
                {complete ? <Icon name="check" size={16} color="#FFFFFF" strokeWidth={3} /> : null}
              </XStack>
              <Text fontFamily={active ? '$semibold' : '$medium'} fontSize={16} color="$text">
                {label}
                {active ? '…' : ''}
              </Text>
            </XStack>
          );
        })}
      </YStack>
      <Text fontSize={14} color="$muted" text="center">
        {text}
      </Text>
    </YStack>
  );
}

// The payoff: people who already move like you, before the card is even
// finished.
function RevealStep({ me, rhythm }: { me: MeProfile; rhythm: Rhythm }) {
  const ranked = useMemo(
    () =>
      ATHLETES.filter(
        (a) =>
          a.name !== me.name.trim().split(' ')[0] &&
          isEligible(a) &&
          wantEachOther(me, a) &&
          distanceTo(me.city, a.city, depthFor(a).nearKm) <= DEFAULT_RADIUS_KM
      )
        .map((a) => ({ a, sync: compatibility(me, a).score }))
        .sort((x, y) => y.sync - x.sync),
    [me]
  );
  const top = ranked.slice(0, 3);
  const inSync = ranked.filter((r) => r.sync >= 60).length || ranked.length;

  useEffect(() => {
    track('reveal_viewed', { match_count: ranked.length });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const city = me.city.trim() || 'you';

  const count = useRef(new Animated.Value(0)).current;
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const id = count.addListener(({ value }) => setShown(Math.round(value)));
    Animated.timing(count, {
      toValue: inSync,
      duration: 1100,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    return () => count.removeListener(id);
  }, [count, inSync]);

  return (
    <YStack flex={1} items="center" justify="center" gap={18} py={16}>
      <Mascot size={110} mood="excited" reactKey="reveal" />
      <YStack items="center">
        <Text fontFamily="$display" fontSize={96} lineHeight={98} color="$accentText">
          {shown}
        </Text>
        <DisplayTitle size={30} center>
          {`athletes near ${city}`}
        </DisplayTitle>
        <DisplayTitle size={30} center>
          *move like you*
        </DisplayTitle>
      </YStack>

      <XStack mt={8}>
        {top.map(({ a }, i) => (
          <YStack key={a.id} ml={i === 0 ? 0 : -18} z={3 - i} p={3} rounded={40} bg="$canvas">
            <PhotoSlot
              label={a.name}
              shape="circle"
              source={ATHLETE_PHOTOS[a.slotId]}
              style={{ width: 72, height: 72 }}
            />
          </YStack>
        ))}
      </XStack>
      {top.length ? (
        <Text fontSize={15} color="$muted" text="center" maxW={300}>
          {top.map((t) => t.a.name).join(', ')}
          {ranked.length > top.length ? ' and more' : ''} train on your days. Your best match is{' '}
          <Text fontFamily="$bold" color="$accentText">
            {top[0].sync}% in sync
          </Text>
          .
        </Text>
      ) : (
        <Text fontSize={15} color="$muted" text="center" maxW={300}>
          We’re still growing in {city}. Try a singles run club this week.
        </Text>
      )}
    </YStack>
  );
}

// Actual pixel dimensions of `hero_runners.png` — used to size the hero by
// its real aspect ratio instead of a fraction of screen height, so `cover`
// never has to crop the sides (which used to slice off the left runner).
const HERO_ASPECT_RATIO = 1536 / 1024;

function WelcomeStep() {
  const colors = useColors();
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

  const archWidth = width - 56;
  const archHeight = Math.min(heroHeight + 40, Math.round(height * 0.44));

  return (
    <YStack flex={1}>
      <Aurora height={archHeight + insets.top + 120} />
      <Animated.View style={{ opacity: heroOpacity }}>
        <YStack mt={insets.top + 20} items="center">
          {/* Arch-framed hero — the rounded top reads like a finish-line
              gate. Floating product chips hint at what's inside. */}
          <YStack
            width={archWidth}
            height={archHeight}
            overflow="hidden"
            bg="$surface"
            style={{
              borderTopLeftRadius: archWidth / 2,
              borderTopRightRadius: archWidth / 2,
              borderBottomLeftRadius: 28,
              borderBottomRightRadius: 28,
            }}
          >
            <RNImage
              source={HERO_RUNNERS}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          </YStack>
          <YStack
            position="absolute"
            t={archHeight * 0.52}
            l={8}
            style={{ transform: [{ rotate: '-4deg' }] }}
          >
            <XStack
              items="center"
              gap={8}
              px={14}
              height={44}
              rounded="$full"
              bg="$card"
              borderWidth={1}
              borderColor="$border"
              style={shadow.raised}
            >
              <Icon name="activity" size={18} color={colors.accentText} strokeWidth={2.2} />
              <Text fontFamily="$bold" fontSize={15} color="$text">
                94% in sync
              </Text>
            </XStack>
          </YStack>
          <YStack
            position="absolute"
            t={archHeight - 56}
            r={8}
            p={12}
            gap={8}
            rounded={20}
            bg="$card"
            borderWidth={1}
            borderColor="$border"
            width={176}
            style={{ ...shadow.raised, transform: [{ rotate: '3deg' }] }}
          >
            <Text fontFamily="$semibold" fontSize={12} color="$muted">
              You both train Tue & Sat
            </Text>
            <RhythmStrip
              mine={[false, true, false, true, false, true, true]}
              theirs={[true, true, false, false, false, true, false]}
              height={24}
            />
          </YStack>
        </YStack>
      </Animated.View>

      <Animated.View
        style={{ flex: 1, opacity: bodyOpacity, transform: [{ translateY: bodyTranslate }] }}
      >
        <YStack flex={1} px={24} pt={36} justify="center">
          <DisplayTitle size={50}>Date someone who *moves* like you.</DisplayTitle>
          <YStack mt={14} mb={6} width={180}>
            <PulseLine width={180} height={30} />
          </YStack>
          <Text fontSize={17} lineHeight={26} color="$muted" maxW={340}>
            Pace matches you on the rhythm of your week — not just your photos.
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
  icon: IconName;
  label: string;
  connected: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  const tint = connected ? colors.accentText : colors.text;
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
        <Text fontFamily="$semibold" fontSize={15} color="$accentText">
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
  me,
  rhythm,
}: {
  profileStrength: number;
  badgeTierLabel: string;
  me: MeProfile;
  rhythm: Rhythm;
}) {
  const colors = useColors();
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

  return (
    <YStack items="center" pt={20}>
      <Badge tone="accent" icon="zap">{`Profile strength ${profileStrength}%`}</Badge>
      <YStack mt={14} mb={4}>
        <DisplayTitle size={42} center>
          Welcome to *Pace*
        </DisplayTitle>
      </YStack>
      <Text color="$muted" fontSize={15} lineHeight={22} text="center">
        Your profile card, as others see it.
      </Text>

      <Confetti pieces={CONFETTI_PIECES} />

      <YStack width="100%" mt={20}>
        <MyCard
          me={me}
          rhythm={rhythm}
          height={500}
          topRight={
            <Animated.View
              style={{
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
          }
        />
      </YStack>
      <Text color="$muted" fontSize={14} lineHeight={20} mt={16} text="center">
        Tap the sides to flip through.
      </Text>
    </YStack>
  );
}

// First question: where you train. Cape Town carries on; anywhere else
// gets a friendly "coming soon" and a way to join that city's waitlist.
function CityStep() {
  const me = useMe();
  const waitlist = useWaitlist();
  const known = (CITIES as readonly string[]).includes(me.city);
  const [other, setOther] = useState(!known && me.city.trim().length > 0);
  const [emailEdit, setEmail] = useState<string | null>(null);
  const email = emailEdit ?? me.email;
  const [error, setError] = useState<string | null>(null);

  const choice = other ? OTHER_CITY : known ? me.city : null;
  const city = me.city.trim();
  const outside = !!city && !isLaunchCity(city);
  const joined = outside && isOnWaitlist(email || me.email, city, waitlist);

  // Typed cities change per keystroke: log once the name settles.
  useEffect(() => {
    if (!outside) return;
    const t = setTimeout(() => track('city_blocked', { city }), 1200);
    return () => clearTimeout(t);
  }, [outside, city]);

  async function join() {
    const res = await joinWaitlist(email, city);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setError(null);
    successHaptic();
  }

  return (
    <YStack gap={16}>
      <PickRow
        options={HOME_CITY_OPTIONS}
        value={choice}
        onChange={(v) => {
          setError(null);
          if (v === OTHER_CITY) {
            setOther(true);
            updateMe({ city: '' });
          } else {
            setOther(false);
            updateMe({ city: v });
          }
        }}
      />
      {other ? (
        <Input
          placeholder="Which city?"
          value={me.city}
          onChangeText={(v) => updateMe({ city: v })}
          autoCapitalize="words"
        />
      ) : null}

      {outside ? (
        <YStack p={16} gap={12} rounded={20} bg="$card" borderWidth={1} borderColor="$border">
          <Text fontFamily="$semibold" fontSize={17} color="$text">
            {`Coming soon to ${city}`}
          </Text>
          <Text fontSize={14} lineHeight={20} color="$muted">
            {`We’re only in ${LAUNCH_CITY} for now. Leave your email and we’ll tell you when we launch.`}
          </Text>
          {joined ? (
            <Callout icon="check" title="You’re on the list">
              {`We’ll email ${email.trim().toLowerCase()}. Train in Cape Town? Pick it above.`}
            </Callout>
          ) : (
            <>
              <Input
                placeholder="Your email"
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  setError(null);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
              {error ? (
                <Text fontFamily="$medium" fontSize={13} color="$accentText">
                  {error}
                </Text>
              ) : null}
              <Button icon="mail" onPress={join} style={{ width: '100%' }}>
                Let me know
              </Button>
            </>
          )}
        </YStack>
      ) : null}
    </YStack>
  );
}
