import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { Icon } from '../src/components/Icon';
import { Chip, IconButton, SegmentedControl } from '../src/components/ui';
import { DISCIPLINES, Discipline } from '../src/data/mockData';
import { colors } from '../src/theme/tokens';

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
    <ScrollView
      flex={1}
      bg="$ink"
      contentContainerStyle={{ pt: insets.top + 8, pb: insets.bottom + 24 }}
    >
      <XStack items="center" gap={12} px={20} pb={2}>
        <IconButton size={40} onPress={() => router.back()}>
          <Icon name="chevron-left" size={14} color={colors.bone} />
        </IconButton>
        <Text fontFamily="$display" fontSize={30} color="$bone" textTransform="uppercase" lineHeight={30}>
          Training
        </Text>
      </XStack>
      <Text color="$fog" fontSize={12} mx={20} mt={8} mb={24} lineHeight={18}>
        What you train, and when. This is what we match on.
      </Text>

      <Text fontFamily="$mono" fontSize={10} letterSpacing={2} color="$bone" mx={20} mb={12}>
        DISCIPLINES
      </Text>
      <XStack flexWrap="wrap" gap={10} mx={20} mb={32}>
        {DISCIPLINES.map((d) => (
          <Chip key={d} label={d} selected={disciplines.includes(d)} onPress={() => toggleDiscipline(d)} />
        ))}
      </XStack>

      <Text fontFamily="$mono" fontSize={10} letterSpacing={2} color="$bone" mx={20} mb={12}>
        WEEKLY CADENCE
      </Text>
      <YStack mx={20} mb={32}>
        <SegmentedControl options={CADENCE_OPTIONS} value={cadence} onChange={setCadence} />
      </YStack>

      <Text fontFamily="$mono" fontSize={10} letterSpacing={2} color="$bone" mx={20} mb={12}>
        TIME OF DAY
      </Text>
      <XStack flexWrap="wrap" gap={10} mx={20} mb={32}>
        {TIME_OPTIONS.map((t) => (
          <Chip key={t} label={t} selected={times.includes(t)} onPress={() => toggleTime(t)} />
        ))}
      </XStack>

      <XStack
        items="center"
        gap={10}
        mx={20}
        p={14}
        rounded={16}
        bg="rgba(255,77,46,0.06)"
        borderWidth={1}
        borderColor="rgba(255,77,46,0.25)"
      >
        <Icon name="zap" size={14} color={colors.ember} />
        <Text flex={1} fontFamily="$mono" fontSize={10} letterSpacing={1} lineHeight={16} color="$fog">
          {disciplines.length > 0
            ? `Matching on ${disciplines.join(' · ')} · ${cadence}`
            : 'Pick at least one discipline to stay searchable.'}
        </Text>
      </XStack>
    </ScrollView>
  );
}