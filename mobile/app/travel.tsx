import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { Illo } from '../src/components/Illustrations';
import { showPip } from '../src/components/PipKit';
import { PickRow } from '../src/components/Sessions';
import { Button, Callout, ScreenHeader, SectionTitle } from '../src/components/ui';
import { CITIES } from '../src/data/places';
import { formatRaceDate, upcomingRaces } from '../src/data/races';
import { isTravelling, updateMe, useMe } from '../src/data/session';
import { successHaptic } from '../src/lib/haptics';

// Travel & race-weekend mode: match with people in another city for a
// few days — a work trip, a holiday, or the weekend of a big race.

const LENGTHS = ['Weekend', '1 week', '2 weeks'];
const LENGTH_DAYS: Record<string, number> = { Weekend: 3, '1 week': 7, '2 weeks': 14 };

export default function TravelScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const me = useMe();
  const now = useMemo(() => new Date(), []);
  const travelling = isTravelling(me, now);
  const [city, setCity] = useState<string>(
    me.travel?.city ?? CITIES.find((c) => c !== me.city) ?? CITIES[0]
  );
  const [length, setLength] = useState('Weekend');
  const races = upcomingRaces(now).slice(0, 4);

  function start(input: { city: string; until: Date; raceId?: string; label: string }) {
    updateMe({
      travel: { city: input.city, until: input.until.toISOString(), raceId: input.raceId },
    });
    successHaptic();
    showPip(`Travel mode on! You’ll see pacers in ${input.city} ${input.label}.`, 'excited');
    router.back();
  }

  return (
    <YStack flex={1} bg="$canvas">
      <ScreenHeader
        title="Travel *mode*"
        subtitle="Match with athletes where you’re headed. Your home matches stay put."
        onBack={() => router.back()}
      />
      <ScrollView flex={1} contentContainerStyle={{ p: 20, gap: 26, pb: insets.bottom + 24 }}>
        {travelling ? (
          <Callout icon="plane" title={`Matching in ${me.travel!.city}`}>
            Until{' '}
            {new Date(me.travel!.until).toLocaleDateString('en-ZA', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
            . Turn it off any time.
          </Callout>
        ) : null}

        <YStack gap={10}>
          <SectionTitle hint="Meet people racing too — shake-out runs, expo coffee, recovery swims.">
            Race weekends
          </SectionTitle>
          {races.map((r) => {
            const until = new Date(r.date);
            until.setDate(until.getDate() + 1);
            return (
              <XStack
                key={r.id}
                accessibilityRole="button"
                onPress={() =>
                  start({ city: r.city, until, raceId: r.id, label: `for ${r.name} weekend` })
                }
                items="center"
                gap={12}
                p={14}
                rounded={18}
                bg="$card"
                borderWidth={1}
                borderColor={me.travel?.raceId === r.id ? '$accent' : '$border'}
              >
                <Illo name={r.illo} size={34} />
                <YStack flex={1}>
                  <Text fontFamily="$semibold" fontSize={15} color="$text">
                    {r.name}
                  </Text>
                  <Text fontSize={13} color="$muted">
                    {r.city} · {formatRaceDate(r.date)}
                  </Text>
                </YStack>
                <Text fontFamily="$semibold" fontSize={13} color="$accentText">
                  Go
                </Text>
              </XStack>
            );
          })}
        </YStack>

        <YStack gap={14}>
          <SectionTitle>Or pick a city</SectionTitle>
          <PickRow options={CITIES.filter((c) => c !== me.city)} value={city} onChange={setCity} />
          <PickRow options={LENGTHS} value={length} onChange={setLength} />
          <Button
            icon="plane"
            onPress={() => {
              const until = new Date(now);
              until.setDate(until.getDate() + LENGTH_DAYS[length]);
              start({
                city,
                until,
                label: length === 'Weekend' ? 'this weekend' : `for ${length}`,
              });
            }}
            style={{ width: '100%' }}
          >
            {`Match in ${city}`}
          </Button>
        </YStack>

        {travelling ? (
          <Button
            variant="secondary"
            onPress={() => {
              updateMe({ travel: null });
              showPip(`Welcome home! Back to pacers in ${me.city}.`, 'happy');
              router.back();
            }}
            style={{ width: '100%' }}
          >
            Turn off travel mode
          </Button>
        ) : null}
      </ScrollView>
    </YStack>
  );
}
