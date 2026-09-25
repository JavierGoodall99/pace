import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, XStack, YStack } from 'tamagui';
import { Icon } from '../src/components/Icon';
import { PhotoSlot } from '../src/components/PhotoSlot';
import {
  Button,
  Callout,
  Chip,
  Input,
  ScreenHeader,
  SectionTitle,
  TextAction,
} from '../src/components/ui';
import { DISCIPLINES, Discipline } from '../src/data/mockData';
import { ME_AVATAR } from '../src/data/photos';
import { updateMe, useMe } from '../src/data/session';
import { colors } from '../src/theme/tokens';

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const me = useMe();

  const [name, setName] = useState(me.name);
  const [age, setAge] = useState(me.age);
  const [city, setCity] = useState(me.city);
  const [bio, setBio] = useState(me.bio);
  const [disciplines, setDisciplines] = useState<Discipline[]>(me.disciplines);
  const [avatar, setAvatar] = useState<string | null>(me.photos[0] ?? null);

  function toggleDiscipline(d: Discipline) {
    setDisciplines((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  }

  async function pickAvatar() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: false,
      quality: 0.8,
    });
    if (result.canceled) return;
    setAvatar(result.assets[0].uri);
  }

  async function save() {
    await updateMe({
      name: name.trim() || me.name,
      age: age.trim(),
      city: city.trim(),
      bio: bio.trim(),
      disciplines,
      photos: avatar
        ? me.photos[0] === avatar
          ? me.photos
          : [avatar, ...me.photos.slice(1)]
        : me.photos,
    });
    router.back();
  }

  return (
    <YStack flex={1} bg="$canvas">
      <ScreenHeader
        title="Edit profile"
        onBack={() => router.back()}
        action={<TextAction onPress={save}>Save</TextAction>}
      />

      <ScrollView
        flex={1}
        contentContainerStyle={{ p: 20, gap: 28, pb: insets.bottom + 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <YStack items="center" gap={10}>
          <XStack
            onPress={pickAvatar}
            pressStyle={{ opacity: 0.85 }}
            accessibilityRole="button"
            accessibilityLabel="Change photo"
          >
            <PhotoSlot
              label={name || 'You'}
              shape="circle"
              source={avatar ? { uri: avatar } : ME_AVATAR}
              style={{ width: 104, height: 104 }}
            />
            <YStack
              position="absolute"
              r={0}
              b={0}
              width={34}
              height={34}
              rounded={17}
              bg="$accent"
              borderWidth={3}
              borderColor="$canvas"
              items="center"
              justify="center"
            >
              <Icon name="camera" size={16} color={colors.onAccent} strokeWidth={2} />
            </YStack>
          </XStack>
          <TextAction onPress={pickAvatar}>Change photo</TextAction>
        </YStack>

        <YStack>
          <SectionTitle>About you</SectionTitle>
          <YStack gap={12}>
            <Input placeholder="Name" value={name} onChangeText={setName} autoCapitalize="words" />
            <XStack gap={10}>
              <YStack flex={1}>
                <Input placeholder="Age" value={age} onChangeText={setAge} keyboardType="numeric" />
              </YStack>
              <YStack flex={2}>
                <Input
                  placeholder="City"
                  value={city}
                  onChangeText={setCity}
                  autoCapitalize="words"
                />
              </YStack>
            </XStack>
            <Input placeholder="Bio — one line is plenty" value={bio} onChangeText={setBio} />
          </YStack>
        </YStack>

        <YStack>
          <SectionTitle>What you train</SectionTitle>
          <XStack flexWrap="wrap" gap={8}>
            {DISCIPLINES.map((d) => (
              <Chip
                key={d}
                label={d}
                selected={disciplines.includes(d)}
                onPress={() => toggleDiscipline(d)}
              />
            ))}
          </XStack>
        </YStack>

        <Callout icon="mail" title={`Signed in as ${me.email}`}>
          Your email is tied to your account and can&apos;t be changed here yet.
        </Callout>

        <Button onPress={save} style={{ width: '100%' }}>
          Save changes
        </Button>
      </ScrollView>
    </YStack>
  );
}
