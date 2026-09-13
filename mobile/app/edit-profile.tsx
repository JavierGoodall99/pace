import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { Icon } from '../src/components/Icon';
import { PhotoSlot } from '../src/components/PhotoSlot';
import { Button, Chip, IconButton, Input } from '../src/components/ui';
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
      photos: avatar ? (me.photos[0] === avatar ? me.photos : [avatar, ...me.photos.slice(1)]) : me.photos,
    });
    router.back();
  }

  return (
    <YStack flex={1} bg="$ink">
      <XStack
        items="center"
        gap={12}
        px={20}
        pb={12}
        pt={insets.top + 8}
        borderBottomWidth={1}
        borderBottomColor="$line"
      >
        <IconButton size={40} onPress={() => router.back()}>
          <Icon name="chevron-left" size={14} color={colors.bone} />
        </IconButton>
        <Text flex={1} fontFamily="$display" fontSize={30} color="$bone" textTransform="uppercase" lineHeight={30}>
          Edit Profile
        </Text>
        <XStack onPress={save} py={6} px={4} hitSlop={8}>
          <Text fontFamily="$mono" fontSize={11} letterSpacing={2} color="$ember" textTransform="uppercase" fontWeight="700">
            Save
          </Text>
        </XStack>
      </XStack>

      <ScrollView
        flex={1}
        contentContainerStyle={{ p: 20, gap: 22, pb: insets.bottom + 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <YStack items="center" gap={10}>
          <XStack onPress={pickAvatar} pressStyle={{ opacity: 0.85 }}>
            <PhotoSlot
              label={name || 'You'}
              shape="circle"
              source={avatar ? { uri: avatar } : ME_AVATAR}
              style={{ width: 96, height: 96 }}
            />
            <YStack
              position="absolute"
              r={-2}
              b={-2}
              width={30}
              height={30}
              rounded={15}
              bg="$ember"
              borderWidth={2}
              borderColor="$ink"
              items="center"
              justify="center"
            >
              <Icon name="upload" size={13} color={colors.ink} />
            </YStack>
          </XStack>
          <XStack onPress={pickAvatar} py={4}>
            <Text fontFamily="$mono" fontSize={9} letterSpacing={1.5} color="$ember" textTransform="uppercase">
              CHANGE PHOTO
            </Text>
          </XStack>
        </YStack>

        <YStack gap={14}>
          <Input placeholder="NAME" value={name} onChangeText={setName} autoCapitalize="words" />
          <XStack gap={10}>
            <YStack flex={1}>
              <Input placeholder="AGE" value={age} onChangeText={setAge} keyboardType="numeric" />
            </YStack>
            <YStack flex={2}>
              <Input placeholder="CITY" value={city} onChangeText={setCity} autoCapitalize="words" />
            </YStack>
          </XStack>
          <Input placeholder="BIO — one line is plenty" value={bio} onChangeText={setBio} />
        </YStack>

        <YStack>
          <Text fontFamily="$mono" fontSize={10} letterSpacing={2} color="$bone" mb={10}>
            WHAT YOU TRAIN
          </Text>
          <XStack flexWrap="wrap" gap={10}>
            {DISCIPLINES.map((d) => (
              <Chip key={d} label={d} selected={disciplines.includes(d)} onPress={() => toggleDiscipline(d)} />
            ))}
          </XStack>
        </YStack>

        <YStack p={16} rounded={16} bg="rgba(255,77,46,0.06)" borderWidth={1} borderColor="rgba(255,77,46,0.25)">
          <Text fontFamily="$mono" fontSize={10} letterSpacing={1.5} color="$ember">
            SIGNED IN AS {me.email.toUpperCase()}
          </Text>
          <Text fontSize={12} color="$fog" mt={6} lineHeight={18}>
            Email lives on your account and can&apos;t be changed from here yet.
          </Text>
        </YStack>

        <Button onPress={save} style={{ width: '100%' }}>
          Save Changes
        </Button>
      </ScrollView>
    </YStack>
  );
}