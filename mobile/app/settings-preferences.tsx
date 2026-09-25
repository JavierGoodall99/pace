import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, XStack, YStack } from 'tamagui';
import { Callout, Chip, ScreenHeader, SectionTitle, SegmentedControl } from '../src/components/ui';
import { DISCIPLINES, Discipline } from '../src/data/mockData';
import { formatLabel } from '../src/theme/tokens';

const CADENCE_OPTIONS = ['2-3X/WK', '4-5X/WK', '6+X/WK'];
const TIME_OPTIONS = ['EARLY MORNING', 'EVENING', 'WEEKENDS'];

export default function SettingsPreferencesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [disciplines, setDisciplines] = useState<Discipline[]>(['CROSSFIT', 'RUNNING']);
  const [cadence, setCadence] = useState<string>('4-5X/WK');
  const [times, setTimes] = useState<string[]>(['EARLY MORNING']);

  function toggleDiscipline(d: Discipline) {
    setDisciplines((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  }
  function toggleTime(t: string) {
    setTimes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  return (
    <ScrollView flex={1} bg="$canvas" contentContainerStyle={{ pb: insets.bottom + 32 }}>
      <ScreenHeader
        title="Training"
        subtitle="What you train, and when. This is what we match on."
        onBack={() => router.back()}
      />

      <YStack px={20} pt={20} gap={28}>
        <YStack>
          <SectionTitle>Sports</SectionTitle>
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

        <YStack>
          <SectionTitle>How often</SectionTitle>
          <SegmentedControl options={CADENCE_OPTIONS} value={cadence} onChange={setCadence} />
        </YStack>

        <YStack>
          <SectionTitle>Time of day</SectionTitle>
          <XStack flexWrap="wrap" gap={8}>
            {TIME_OPTIONS.map((t) => (
              <Chip key={t} label={t} selected={times.includes(t)} onPress={() => toggleTime(t)} />
            ))}
          </XStack>
        </YStack>

        <Callout icon="sparkles">
          {disciplines.length > 0
            ? `Matching on ${disciplines.map(formatLabel).join(', ')} · ${formatLabel(cadence)}`
            : 'Pick at least one sport to stay visible in Discover.'}
        </Callout>
      </YStack>
    </ScrollView>
  );
}
