import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Slider, Text, XStack, YStack } from 'tamagui';
import {
  Button,
  Card,
  Chip,
  ScreenHeader,
  SectionTitle,
  TextAction,
  Callout,
} from '../src/components/ui';
import {
  AGE_RANGE,
  AVAILABILITY_OPTIONS,
  RADIUS_OPTIONS,
  resetFilters,
  setFilters,
  ageWindow,
  useFilters,
} from '../src/data/filters';
import { useMe } from '../src/data/session';
import { ACTIVE_DAYS } from '../src/data/trust';

export default function DiscoverFiltersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const f = useFilters();
  const me = useMe();
  const [autoMin, autoMax] = ageWindow(f, me.age);
  const ageMinValue = useMemo(() => [autoMin], [autoMin]);
  const ageMaxValue = useMemo(() => [autoMax], [autoMax]);

  // Moving a slider takes the range off "around my age".
  function setAgeMin(v: number) {
    const next = Math.min(v, autoMax);
    if (f.ageAuto || next !== f.ageMin)
      setFilters({ ageAuto: false, ageMin: next, ageMax: autoMax });
  }

  function setAgeMax(v: number) {
    const next = Math.max(v, autoMin);
    if (f.ageAuto || next !== f.ageMax)
      setFilters({ ageAuto: false, ageMin: autoMin, ageMax: next });
  }

  function toggleTime(t: string) {
    setFilters({
      times: f.times.includes(t) ? f.times.filter((x) => x !== t) : [...f.times, t],
    });
  }

  return (
    <YStack flex={1} bg="$canvas">
      <ScreenHeader
        title="Refine your *search*"
        onBack={() => router.back()}
        action={<TextAction onPress={resetFilters}>Reset</TextAction>}
      />

      <ScrollView
        flex={1}
        contentContainerStyle={{ p: 20, gap: 28, pb: insets.bottom + 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <YStack>
          <XStack items="baseline" justify="space-between">
            <SectionTitle hint="They also only see you if you’re in their range.">
              Age range
            </SectionTitle>
            <Text fontFamily="$semibold" fontSize={15} color="$accentText">
              {autoMin} – {autoMax}
            </Text>
          </XStack>
          <XStack mb={10}>
            <Chip
              label="Around my age"
              selected={f.ageAuto}
              onPress={() => setFilters({ ageAuto: true })}
            />
          </XStack>
          <Card py={14}>
            <YStack gap={14}>
              <AgeSlider label="Youngest" value={ageMinValue} onChange={setAgeMin} />
              <AgeSlider label="Oldest" value={ageMaxValue} onChange={setAgeMax} />
            </YStack>
          </Card>
        </YStack>

        <YStack>
          <SectionTitle hint="Nearby first, so a first session is easy.">Distance</SectionTitle>
          <XStack flexWrap="wrap" gap={8}>
            <Chip
              label="Anywhere"
              selected={f.radiusKm == null}
              onPress={() => setFilters({ radiusKm: null })}
            />
            {RADIUS_OPTIONS.map((o) => (
              <Chip
                key={o.km}
                label={`Within ${o.km} km`}
                selected={f.radiusKm === o.km}
                onPress={() => setFilters({ radiusKm: o.km })}
              />
            ))}
          </XStack>
        </YStack>

        <YStack>
          <SectionTitle hint="Only show people who train at these times.">
            Availability
          </SectionTitle>
          <XStack flexWrap="wrap" gap={8}>
            {AVAILABILITY_OPTIONS.map((t) => (
              <Chip
                key={t}
                label={t}
                selected={f.times.includes(t)}
                onPress={() => toggleTime(t)}
              />
            ))}
          </XStack>
        </YStack>

        <Callout icon="shield-check" title="Always on">
          {`Everyone you see is selfie-verified and has trained in the last ${ACTIVE_DAYS} days. Inactive profiles drop out automatically.`}
        </Callout>

        <Button icon="check" onPress={() => router.back()} style={{ width: '100%' }}>
          Show results
        </Button>
      </ScrollView>
    </YStack>
  );
}

function AgeSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number[];
  onChange: (v: number) => void;
}) {
  return (
    <YStack gap={10}>
      <XStack justify="space-between">
        <Text fontFamily="$medium" fontSize={14} color="$muted">
          {label}
        </Text>
        <Text fontFamily="$semibold" fontSize={14} color="$text">
          {value[0]}
        </Text>
      </XStack>
      <Slider
        value={value}
        min={AGE_RANGE.min}
        max={AGE_RANGE.max}
        step={1}
        onValueChange={([v]) => onChange(v)}
      >
        <Slider.Track bg="$surface" height={6}>
          <Slider.TrackActive bg="$accent" />
        </Slider.Track>
        <Slider.Thumb
          index={0}
          size="$1.5"
          circular
          bg="$card"
          borderWidth={2}
          borderColor="$accent"
        />
      </Slider>
    </YStack>
  );
}
