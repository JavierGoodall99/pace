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
  ToggleRow,
} from '../src/components/ui';
import {
  AGE_RANGE,
  AVAILABILITY_OPTIONS,
  RADIUS_OPTIONS,
  resetFilters,
  setFilters,
  useFilters,
} from '../src/data/filters';

export default function DiscoverFiltersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const f = useFilters();
  const ageMinValue = useMemo(() => [f.ageMin], [f.ageMin]);
  const ageMaxValue = useMemo(() => [f.ageMax], [f.ageMax]);

  function setAgeMin(v: number) {
    const next = Math.min(v, f.ageMax);
    if (next !== f.ageMin) setFilters({ ageMin: next });
  }

  function setAgeMax(v: number) {
    const next = Math.max(v, f.ageMin);
    if (next !== f.ageMax) setFilters({ ageMax: next });
  }

  function toggleTime(t: string) {
    setFilters({
      times: f.times.includes(t) ? f.times.filter((x) => x !== t) : [...f.times, t],
    });
  }

  return (
    <YStack flex={1} bg="$canvas">
      <ScreenHeader
        title="Filters"
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
            <SectionTitle>Age range</SectionTitle>
            <Text fontFamily="$semibold" fontSize={15} color="$accent">
              {f.ageMin} – {f.ageMax}
            </Text>
          </XStack>
          <Card py={14}>
            <YStack gap={14}>
              <AgeSlider label="Youngest" value={ageMinValue} onChange={setAgeMin} />
              <AgeSlider label="Oldest" value={ageMaxValue} onChange={setAgeMax} />
            </YStack>
          </Card>
        </YStack>

        <YStack>
          <SectionTitle hint="Simulated from your city until real location data lands.">
            Distance
          </SectionTitle>
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
          <SectionTitle>Availability</SectionTitle>
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

        <Card>
          <ToggleRow
            label="Verified only"
            hint="Only show people with the verified badge"
            last
            value={f.verifiedOnly}
            onChange={(v) => setFilters({ verifiedOnly: v })}
          />
        </Card>

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
