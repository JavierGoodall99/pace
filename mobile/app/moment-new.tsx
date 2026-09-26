import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { Icon } from '../src/components/Icon';
import { showPip } from '../src/components/PipKit';
import { PickRow } from '../src/components/Sessions';
import { Button, Input, ScreenHeader, SectionTitle } from '../src/components/ui';
import { DISCIPLINES, Discipline, SPORT_ILLO } from '../src/data/mockData';
import { postMoment } from '../src/data/moments';
import { MOMENT_PHOTOS } from '../src/data/photos';
import { useMe } from '../src/data/session';
import { successHaptic } from '../src/lib/haptics';
import { useColors } from '../src/theme/appearance';
import { formatLabel } from '../src/theme/tokens';

// Post a session moment: one photo from today's training, visible to
// your matches for 24 hours.
export default function NewMomentScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const me = useMe();
  const [source, setSource] = useState<number | { uri: string } | null>(null);
  const [caption, setCaption] = useState('');
  const [stat, setStat] = useState('');
  const [activity, setActivity] = useState<Discipline>(me.disciplines[0] ?? 'RUNNING');

  async function pick() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;
    setSource({ uri: result.assets[0].uri });
  }

  function post() {
    if (!source) return;
    postMoment({ source, caption: caption.trim(), activity, stat: stat.trim() || undefined });
    successHaptic();
    showPip('Moment posted! Your matches can see it for 24 hours.', 'excited');
    router.back();
  }

  return (
    <YStack flex={1} bg="$canvas">
      <ScreenHeader
        title="Post a *moment*"
        subtitle="One photo from today’s session. Matches only, gone in 24 hours."
        onBack={() => router.back()}
      />
      <ScrollView
        flex={1}
        contentContainerStyle={{ p: 20, gap: 22, pb: insets.bottom + 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <YStack
          height={340}
          rounded={24}
          overflow="hidden"
          bg="$surface"
          borderWidth={source ? 0 : 2}
          borderStyle="dashed"
          borderColor="$borderStrong"
          items="center"
          justify="center"
          onPress={pick}
          accessibilityRole="button"
          accessibilityLabel="Choose a photo"
          aria-label="Choose a photo"
        >
          {source ? (
            <Image
              source={source}
              resizeMode="cover"
              style={{ position: 'absolute', width: '100%', height: '100%' }}
            />
          ) : (
            <YStack items="center" gap={10}>
              <XStack
                width={52}
                height={52}
                rounded={26}
                bg="$accent"
                items="center"
                justify="center"
              >
                <Icon name="camera" size={24} color={c.onAccent} />
              </XStack>
              <Text fontFamily="$semibold" fontSize={15} color="$text">
                Add a photo from your session
              </Text>
            </YStack>
          )}
        </YStack>

        <YStack gap={8}>
          <Text fontSize={13} color="$muted">
            Or try one of these
          </Text>
          <XStack gap={10}>
            {MOMENT_PHOTOS.map((p, i) => (
              <YStack
                key={i}
                flex={1}
                height={76}
                rounded={14}
                overflow="hidden"
                borderWidth={source === p ? 3 : 0}
                borderColor="$accent"
                onPress={() => setSource(p)}
                accessibilityRole="button"
                accessibilityLabel={`Sample photo ${i + 1}`}
                aria-label={`Sample photo ${i + 1}`}
              >
                <Image source={p} resizeMode="cover" style={{ width: '100%', height: '100%' }} />
              </YStack>
            ))}
          </XStack>
        </YStack>

        <YStack>
          <SectionTitle>What did you do?</SectionTitle>
          <PickRow
            options={DISCIPLINES}
            value={activity}
            onChange={setActivity}
            render={(a) => formatLabel(a)}
            illo={(a) => SPORT_ILLO[a]}
          />
        </YStack>

        <YStack gap={12}>
          <Input
            placeholder="Caption — how did it feel?"
            value={caption}
            onChangeText={(v) => setCaption(v.slice(0, 120))}
          />
          <Input
            placeholder="Stat (optional) e.g. 10 km · 5:12/km"
            value={stat}
            onChangeText={(v) => setStat(v.slice(0, 40))}
          />
        </YStack>

        <Button icon="zap" disabled={!source} onPress={post} style={{ width: '100%' }}>
          Post for 24 hours
        </Button>
      </ScrollView>
    </YStack>
  );
}
