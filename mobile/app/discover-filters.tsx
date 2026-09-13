import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Slider, Text, XStack, YStack } from 'tamagui';
import { Icon } from '../src/components/Icon';
import { Chip, IconButton, ToggleRow } from '../src/components/ui';
import {
  AGE_RANGE,
  AVAILABILITY_OPTIONS,
  RADIUS_OPTIONS,
  resetFilters,
  setFilters,
  useFilters,
} from '../src/data/filters';
import { colors } from '../src/theme/tokens';

export default function DiscoverFiltersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const f = useFilters();

  function toggleTime(t: string) {
    setFilters({
      times: f.times.includes(t) ? f.times.filter((x) => x !== t) : [...f.times, t],
    });
  }

  return (
    <YStack flex={1} bg="$ink">
      <XStack items="center" gap={12} px={20} pb={12} pt={insets.top + 8} borderBottomWidth={1} borderBottomColor="$line">
        <IconButton size={40} onPress={() => router.back()}>
          <Icon name="chevron-left" size={14} color={colors.bone} />
        </IconButton>
        <Text flex={1} fontFamily="$display" fontSize={30} color="$bone" textTransform="uppercase" lineHeight={30}>
          Filters
        </Text>
        <XStack onPress={resetFilters} py={4} px={4} hitSlop={8}>
          <Text fontFamily="$mono" fontSize={10} letterSpacing={2} color="$ember" textTransform="uppercase">
            Reset
          </Text>
        </XStack>
      </XStack>

      <ScrollView flex={1} contentContainerStyle={{ p: 20, gap: 28, pb: insets.bottom + 24 }} keyboardShouldPersistTaps="handled">
        <YStack>
          <Text fontFamily="$mono" fontSize={10} letterSpacing={2} color="$bone" mb={10}>
            AGE RANGE
          </Text>
          <YStack gap={4}>
            <XStack justify="space-between">
              <Text fontFamily="$mono" fontSize={10} letterSpacing={1} color="$fog">
                MIN {f.ageMin}
              </Text>
              <Text fontFamily="$mono" fontSize={10} letterSpacing={1} color="$fog">
                MAX {f.ageMax}
              </Text>
            </XStack>
            <Slider
              value={[f.ageMin]}
              min={AGE_RANGE.min}
              max={AGE_RANGE.max}
              step={1}
              onValueChange={([v]) => setFilters({ ageMin: Math.min(v, f.ageMax) })}
            >
              <Slider.Track>
                <Slider.TrackActive />
              </Slider.Track>
              <Slider.Thumb index={0} />
            </Slider>
            <Slider
              value={[f.ageMax]}
              min={AGE_RANGE.min}
              max={AGE_RANGE.max}
              step={1}
              onValueChange={([v]) => setFilters({ ageMax: Math.max(v, f.ageMin) })}
            >
              <Slider.Track>
                <Slider.TrackActive />
              </Slider.Track>
              <Slider.Thumb index={0} />
            </Slider>
          </YStack>
        </YStack>

        <YStack>
          <Text fontFamily="$mono" fontSize={10} letterSpacing={2} color="$bone" mb={10}>
            MATCH RADIUS
          </Text>
          <XStack flexWrap="wrap" gap={8}>
            <Chip label="ANYWHERE" selected={f.radiusKm == null} onPress={() => setFilters({ radiusKm: null })} />
            {RADIUS_OPTIONS.map((o) => (
              <Chip
                key={o.km}
                label={o.label}
                selected={f.radiusKm === o.km}
                onPress={() => setFilters({ radiusKm: o.km })}
              />
            ))}
          </XStack>
          <Text fontSize={11} color="$fog" opacity={0.8} mt={8} lineHeight={16}>
            Demo map: radius is simulated from your city until real location data lands.
          </Text>
        </YStack>

        <YStack>
          <Text fontFamily="$mono" fontSize={10} letterSpacing={2} color="$bone" mb={10}>
            AVAILABILITY
          </Text>
          <XStack flexWrap="wrap" gap={8}>
            {AVAILABILITY_OPTIONS.map((t) => (
              <Chip key={t} label={t} selected={f.times.includes(t)} onPress={() => toggleTime(t)} />
            ))}
          </XStack>
        </YStack>

        <YStack rounded={16} borderWidth={1} borderColor="$line" bg="$ash" px={16} overflow="hidden">
          <ToggleRow
            label="Verified only"
            hint="Only show cards with the verified badge"
            value={f.verifiedOnly}
            onChange={(v) => setFilters({ verifiedOnly: v })}
          />
        </YStack>

        <ButtonRow onPress={() => router.back()} />
      </ScrollView>
    </YStack>
  );
}

function ButtonRow({ onPress }: { onPress: () => void }) {
  return (
    <XStack
      onPress={onPress}
      height={52}
      rounded="$full"
      items="center"
      justify="center"
      bg="$ember"
      pressStyle={{ opacity: 0.85 }}
    >
      <XStack items="center" gap={8}>
        <Icon name="check" size={14} color={colors.ink} />
        <Text fontFamily="$mono" fontSize={12} letterSpacing={2} color="$ink" textTransform="uppercase" fontWeight="700">
          Apply Filters
        </Text>
      </XStack>
    </XStack>
  );
}