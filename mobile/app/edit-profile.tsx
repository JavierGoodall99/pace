import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { PhotoGrid } from '../src/components/PhotoGrid';
import { PickRow } from '../src/components/Sessions';
import {
  Button,
  Callout,
  Chip,
  Input,
  ScreenHeader,
  SectionTitle,
  TextAction,
} from '../src/components/ui';
import {
  daysSince,
  DIETS,
  DRINKS,
  freshnessLabel,
  Gender,
  GENDERS,
  Lifestyle,
  REST_DAYS,
} from '../src/data/identity';
import { CITIES } from '../src/data/places';
import { daysPerWeek } from '../src/data/rhythm';
import { updateMe, useMe } from '../src/data/session';
import { formatLabel } from '../src/theme/tokens';

const MAX_PHOTOS = 6;

// Everything on your card. Photos save straight away (labels included);
// the rest saves with the Save button.
export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const me = useMe();

  const [name, setName] = useState(me.name);
  const [age, setAge] = useState(me.age);
  const [height, setHeight] = useState(me.heightCm ? String(me.heightCm) : '');
  const [city, setCity] = useState(me.city);
  const [bio, setBio] = useState(me.bio);
  const [gender, setGender] = useState<Gender | null>(me.gender);
  const [lifestyle, setLifestyle] = useState<Lifestyle>(me.lifestyle);
  const [error, setError] = useState<string | null>(null);

  const days = daysSince(me.photosUpdatedAt);
  const missingOffClock = me.photos.length > 0 && !me.photoLabels.includes('offclock');

  async function pickPhotos() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: Math.max(1, MAX_PHOTOS - me.photos.length),
      quality: 0.8,
    });
    if (result.canceled) return;
    await updateMe({
      photos: [...me.photos, ...result.assets.map((a) => a.uri)].slice(0, MAX_PHOTOS),
      photosUpdatedAt: new Date().toISOString(),
    });
  }

  async function save() {
    const ageNum = Number(age.trim());
    if (!Number.isInteger(ageNum) || ageNum < 18 || ageNum > 99) {
      setError('Pace is for adults only. Enter your age (18 or older).');
      return;
    }
    if (!city) {
      setError('Pick the city you train in.');
      return;
    }
    setError(null);
    await updateMe({
      name: name.trim() || me.name,
      age: age.trim(),
      heightCm: Number(height) || null,
      city,
      bio: bio.trim(),
      gender,
      lifestyle,
    });
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
            photos={me.photos}
            labels={me.photoLabels}
            onPick={pickPhotos}
            onLabel={(i, l) => {
              const labels = [...me.photoLabels];
              labels[i] = l;
              updateMe({ photoLabels: labels });
            }}
            onRemove={(i) =>
              updateMe({
                photos: me.photos.filter((_, k) => k !== i),
                photoLabels: me.photoLabels.filter((_, k) => k !== i),
                photosUpdatedAt: new Date().toISOString(),
              })
            }
          />
          {missingOffClock ? (
            <Callout icon="camera" title="Add an Off the clock photo">
              Profiles with one get far more likes. People want to see you dressed up too.
            </Callout>
          ) : null}
        </YStack>

        <YStack>
          <SectionTitle>About you</SectionTitle>
          <YStack gap={12}>
            <Input placeholder="Name" value={name} onChangeText={setName} autoCapitalize="words" />
            <XStack gap={10}>
              <YStack flex={1}>
                <Input
                  placeholder="Age"
                  value={age}
                  onChangeText={(v) => setAge(v.replace(/[^0-9]/g, '').slice(0, 2))}
                  keyboardType="numeric"
                />
              </YStack>
              <YStack flex={1}>
                <Input
                  placeholder="Height (cm)"
                  value={height}
                  onChangeText={(v) => setHeight(v.replace(/[^0-9]/g, '').slice(0, 3))}
                  keyboardType="numeric"
                />
              </YStack>
            </XStack>
            <Input placeholder="Bio — one line is plenty" value={bio} onChangeText={setBio} />
          </YStack>
        </YStack>

        <YStack>
          <SectionTitle>Where you train</SectionTitle>
          <PickRow options={[...CITIES] as string[]} value={city || null} onChange={setCity} />
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

        <Callout icon="mail" title={`Signed in as ${me.email}`}>
          Your email is tied to your account and can&apos;t be changed here yet.
        </Callout>

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
