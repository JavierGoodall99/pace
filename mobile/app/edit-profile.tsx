import { useNavigation, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { Icon } from '../src/components/Icon';
import { PhotoGrid } from '../src/components/PhotoGrid';
import { PickRow } from '../src/components/Sessions';
import {
  Button,
  Callout,
  Chip,
  IconButton,
  Input,
  ScreenHeader,
  SectionTitle,
  TextAction,
} from '../src/components/ui';
import type { Prompt } from '../src/data/athleteDepth';
import {
  daysSince,
  DIETS,
  DRINKS,
  freshnessLabel,
  Gender,
  GENDERS,
  INTENT_OPTIONS,
  Lifestyle,
  MAX_PROMPTS,
  PhotoLabel,
  photoProblem,
  PROMPT_QUESTIONS,
  REST_DAYS,
} from '../src/data/identity';
import { daysPerWeek } from '../src/data/rhythm';
import { Intent, updateMe, useMe } from '../src/data/session';
import { confirmAction } from '../src/lib/dialogs';
import { forgetPhoto, keepPhotos } from '../src/lib/photoStore';
import { useColors } from '../src/theme/appearance';
import { formatLabel } from '../src/theme/tokens';

const MAX_PHOTOS = 6;

// Everything on your card. Edits are a draft until Save; leaving with
// unsaved changes asks first.
export default function EditProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const navigation = useNavigation();
  const me = useMe();
  // The profile as it was when the screen opened, to spot changes.
  const [original] = useState(me);

  const [name, setName] = useState(me.name);
  const [age, setAge] = useState(me.age);
  const [bio, setBio] = useState(me.bio);
  const [gender, setGender] = useState<Gender | null>(me.gender);
  const [intent, setIntent] = useState<Intent | null>(me.intent);
  const [lifestyle, setLifestyle] = useState<Lifestyle>(me.lifestyle);
  const [photos, setPhotos] = useState<string[]>(me.photos);
  const [labels, setLabels] = useState<PhotoLabel[]>(me.photoLabels);
  const [prompts, setPrompts] = useState<Prompt[]>(me.prompts);
  const [choosingPrompt, setChoosingPrompt] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const photosChanged =
    JSON.stringify([photos, labels]) !== JSON.stringify([original.photos, original.photoLabels]);
  const dirty =
    photosChanged ||
    name !== original.name ||
    age !== original.age ||
    bio !== original.bio ||
    gender !== original.gender ||
    intent !== original.intent ||
    JSON.stringify(lifestyle) !== JSON.stringify(original.lifestyle) ||
    JSON.stringify(prompts) !== JSON.stringify(original.prompts);

  // Set once Save succeeds so leaving doesn't ask about discarding.
  const saved = useRef(false);

  // Catch every way out (back button, swipe down, hardware back) while
  // there are unsaved edits.
  useEffect(() => {
    return navigation.addListener('beforeRemove', (e) => {
      if (!dirty || saved.current) return;
      e.preventDefault();
      confirmAction({
        title: 'Discard changes?',
        message: 'You have unsaved edits to your profile.',
        confirmLabel: 'Discard',
        destructive: true,
      }).then((ok) => {
        if (!ok) return;
        // Photos picked in this draft were copied in; drop them again.
        photos.filter((p) => !original.photos.includes(p)).forEach(forgetPhoto);
        navigation.dispatch(e.data.action);
      });
    });
  }, [navigation, dirty, photos, original.photos]);

  const days = daysSince(original.photosUpdatedAt);
  const photoIssue = photos.length > 0 ? photoProblem(photos, labels) : null;
  const usedQuestions = prompts.map((p) => p.q);

  async function pickPhotos() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: Math.max(1, MAX_PHOTOS - photos.length),
      quality: 0.8,
    });
    if (result.canceled) return;
    const picked = keepPhotos(result.assets.map((a) => a.uri));
    setPhotos((p) => [...p, ...picked].slice(0, MAX_PHOTOS));
  }

  async function save() {
    const ageNum = Number(age.trim());
    if (!Number.isInteger(ageNum) || ageNum < 18 || ageNum > 99) {
      setError('Pace is for adults only. Enter your age (18 or older).');
      return;
    }
    const problem = photoProblem(photos, labels);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    original.photos.filter((p) => !photos.includes(p)).forEach(forgetPhoto);
    await updateMe({
      name: name.trim() || me.name,
      age: age.trim(),
      bio: bio.trim(),
      gender,
      intent,
      lifestyle,
      photos,
      photoLabels: labels.slice(0, photos.length),
      ...(photosChanged ? { photosUpdatedAt: new Date().toISOString() } : null),
      // Drop prompts left without an answer.
      prompts: prompts.map((p) => ({ q: p.q, a: p.a.trim() })).filter((p) => p.a),
    });
    saved.current = true;
    router.back();
  }

  return (
    <YStack flex={1} bg="$canvas">
      <ScreenHeader
        title="Edit *profile*"
        onBack={() => router.back()}
        action={<TextAction onPress={save}>Save</TextAction>}
      />

      <ScrollView
        flex={1}
        contentContainerStyle={{ p: 20, gap: 28, pb: insets.bottom + 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <YStack gap={10}>
          <SectionTitle
            hint={days === null ? 'Faces first. Mix training with off-duty.' : freshnessLabel(days)}
          >
            Photos
          </SectionTitle>
          <PhotoGrid
            max={MAX_PHOTOS}
            photos={photos}
            labels={labels}
            onPick={pickPhotos}
            onLabel={(i, l) =>
              setLabels((prev) => {
                const next = [...prev];
                next[i] = l;
                return next;
              })
            }
            onRemove={(i) => {
              setPhotos((p) => p.filter((_, k) => k !== i));
              setLabels((l) => l.filter((_, k) => k !== i));
            }}
          />
          {photoIssue ? <Callout icon="camera" title={photoIssue} /> : null}
        </YStack>

        <YStack>
          <SectionTitle>About you</SectionTitle>
          <YStack gap={12}>
            <Input placeholder="Name" value={name} onChangeText={setName} autoCapitalize="words" />
            <Input
              placeholder="Age"
              value={age}
              onChangeText={(v) => setAge(v.replace(/[^0-9]/g, '').slice(0, 2))}
              keyboardType="numeric"
            />
            <Input placeholder="Bio — one line is plenty" value={bio} onChangeText={setBio} />
          </YStack>
        </YStack>

        <YStack>
          <SectionTitle>I am a</SectionTitle>
          <XStack flexWrap="wrap" gap={8}>
            {GENDERS.map((g) => (
              <Chip
                key={g.id}
                label={g.label}
                selected={gender === g.id}
                onPress={() => setGender(g.id)}
              />
            ))}
          </XStack>
        </YStack>

        <YStack gap={8}>
          <SectionTitle>Here for</SectionTitle>
          <PickRow
            options={INTENT_OPTIONS.map((i) => i.id)}
            value={intent}
            onChange={setIntent}
            render={(v) => INTENT_OPTIONS.find((i) => i.id === v)!.label}
          />
          <Text fontSize={13} color="$muted">
            {INTENT_OPTIONS.find((i) => i.id === intent)?.subtitle ??
              'Pick one so we show you the right people.'}
          </Text>
        </YStack>

        <YStack gap={12}>
          <SectionTitle hint={`${prompts.length} of ${MAX_PROMPTS}`}>Prompts</SectionTitle>
          {prompts.map((p, i) => (
            <YStack
              key={p.q}
              gap={10}
              p={14}
              rounded={20}
              borderWidth={1}
              borderColor="$border"
              bg="$card"
            >
              <XStack items="center" gap={8}>
                <Text flex={1} fontFamily="$semibold" fontSize={15} color="$text">
                  {p.q}
                </Text>
                <IconButton
                  size={32}
                  onPress={() => setPrompts((all) => all.filter((_, k) => k !== i))}
                  accessibilityLabel={`Remove prompt ${p.q}`}
                >
                  <Icon name="x" size={16} color={colors.muted} />
                </IconButton>
              </XStack>
              <Input
                placeholder="Your answer"
                value={p.a}
                onChangeText={(a) =>
                  setPrompts((all) =>
                    all.map((x, k) => (k === i ? { ...x, a: a.slice(0, 120) } : x))
                  )
                }
              />
            </YStack>
          ))}
          {choosingPrompt ? (
            <XStack flexWrap="wrap" gap={8}>
              {PROMPT_QUESTIONS.filter((q) => !usedQuestions.includes(q)).map((q) => (
                <Chip
                  key={q}
                  label={q}
                  onPress={() => {
                    setPrompts((all) => [...all, { q, a: '' }]);
                    setChoosingPrompt(false);
                  }}
                />
              ))}
            </XStack>
          ) : prompts.length < MAX_PROMPTS ? (
            <Button variant="ghost" icon="plus" onPress={() => setChoosingPrompt(true)}>
              Add a prompt
            </Button>
          ) : null}
        </YStack>

        <YStack gap={14}>
          <SectionTitle>Lifestyle</SectionTitle>
          <YStack gap={8}>
            <Text fontFamily="$medium" fontSize={14} color="$muted">
              Drinking
            </Text>
            <PickRow
              options={DRINKS.map((d) => d.id)}
              value={lifestyle.drinks}
              onChange={(v) => setLifestyle((l) => ({ ...l, drinks: v }))}
              render={(v) => DRINKS.find((d) => d.id === v)!.label}
            />
          </YStack>
          <YStack gap={8}>
            <Text fontFamily="$medium" fontSize={14} color="$muted">
              How you eat
            </Text>
            <PickRow
              options={DIETS.map((d) => d.id)}
              value={lifestyle.diet}
              onChange={(v) => setLifestyle((l) => ({ ...l, diet: v }))}
              render={(v) => DIETS.find((d) => d.id === v)!.label}
            />
          </YStack>
          <YStack gap={8}>
            <Text fontFamily="$medium" fontSize={14} color="$muted">
              Rest day energy
            </Text>
            <PickRow
              options={REST_DAYS.map((d) => d.id)}
              value={lifestyle.restDay}
              onChange={(v) => setLifestyle((l) => ({ ...l, restDay: v }))}
              render={(v) => REST_DAYS.find((d) => d.id === v)!.label}
            />
          </YStack>
        </YStack>

        <YStack gap={10}>
          <SectionTitle>Your training</SectionTitle>
          <Text fontSize={15} color="$muted">
            {me.disciplines.length
              ? `${me.disciplines.map(formatLabel).join(', ')} · ${daysPerWeek(me.cadence, me.trainingDays)}× a week`
              : 'No sports picked yet'}
          </Text>
          <Button variant="ghost" onPress={() => router.push('/settings-preferences')}>
            Edit sports, week, level & race
          </Button>
        </YStack>

        <YStack gap={10}>
          <SectionTitle>Personal bests & routes</SectionTitle>
          <Text fontSize={15} color="$muted">
            {`${me.pbs.length} PB${me.pbs.length === 1 ? '' : 's'} · ${me.routes.length} route${me.routes.length === 1 ? '' : 's'}`}
          </Text>
          <Button variant="ghost" onPress={() => router.push('/edit-highlights')}>
            Edit PBs & favourite routes
          </Button>
        </YStack>

        <Callout icon="mail" title={`Signed in as ${me.email}`} />

        {error ? (
          <Text fontFamily="$medium" fontSize={14} color="$accentText">
            {error}
          </Text>
        ) : null}

        <Button onPress={save} style={{ width: '100%' }}>
          Save changes
        </Button>
      </ScrollView>
    </YStack>
  );
}
