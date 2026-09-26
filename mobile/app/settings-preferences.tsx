import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, XStack, YStack } from 'tamagui';
import { OptionCard, WeekBuilder } from '../src/components/OnboardingKit';
import { Callout, Chip, ScreenHeader, SectionTitle } from '../src/components/ui';
import { LEVELS } from '../src/data/athleteDepth';
import { DISCIPLINES, Discipline } from '../src/data/mockData';
import { athletesTrainingFor, formatRaceDate, upcomingRaces } from '../src/data/races';
import { NO_DAYS, toggleTrainingDay, TRAINING_TIMES } from '../src/data/rhythm';
import { updateMe, useMe } from '../src/data/session';
import { formatLabel } from '../src/theme/tokens';

// Everything Pace matches on: sports, your week, time of day, effort and
// goal race. Each change saves straight to your profile, the same fields
// onboarding sets and Discover reads.
export default function SettingsPreferencesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const me = useMe();

  const days = me.trainingDays && me.trainingDays.length === 7 ? me.trainingDays : NO_DAYS;
  const dayCount = days.filter(Boolean).length;

  function toggleDiscipline(d: Discipline) {
    updateMe({
      disciplines: me.disciplines.includes(d)
        ? me.disciplines.filter((x) => x !== d)
        : [...me.disciplines, d],
    });
  }
  function toggleTime(t: string) {
    updateMe({ times: me.times.includes(t) ? me.times.filter((x) => x !== t) : [...me.times, t] });
  }

  const missing = [
    me.disciplines.length === 0 && 'a sport',
    dayCount === 0 && 'your training days',
    me.times.length === 0 && 'a time of day',
  ].filter(Boolean) as string[];

  return (
    <ScrollView flex={1} bg="$canvas" contentContainerStyle={{ pb: insets.bottom + 32 }}>
      <ScreenHeader
        title="Your *training*"
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
                selected={me.disciplines.includes(d)}
                onPress={() => toggleDiscipline(d)}
              />
            ))}
          </XStack>
        </YStack>

        <YStack gap={12}>
          <SectionTitle hint={`${dayCount} day${dayCount === 1 ? '' : 's'} a week`}>
            Your week
          </SectionTitle>
          <WeekBuilder
            days={days}
            onToggle={(i) => updateMe(toggleTrainingDay(me.trainingDays, i))}
          />
        </YStack>

        <YStack>
          <SectionTitle>Time of day</SectionTitle>
          <XStack flexWrap="wrap" gap={8}>
            {TRAINING_TIMES.map((t) => (
              <Chip
                key={t.id}
                label={t.title}
                selected={me.times.includes(t.id)}
                onPress={() => toggleTime(t.id)}
              />
            ))}
          </XStack>
        </YStack>

        <YStack gap={12}>
          <SectionTitle>How hard you go</SectionTitle>
          {LEVELS.map((l) => (
            <OptionCard
              key={l.id}
              illo={l.illo}
              title={l.label}
              subtitle={l.detail}
              selected={me.level === l.id}
              onPress={() => updateMe({ level: l.id })}
            />
          ))}
        </YStack>

        <YStack gap={12}>
          <SectionTitle>Training for</SectionTitle>
          {upcomingRaces().map((r) => {
            const n = athletesTrainingFor(r.id).length;
            return (
              <OptionCard
                key={r.id}
                illo={r.illo}
                title={r.name}
                subtitle={`${formatRaceDate(r.date)} · ${r.city}${n ? ` · ${n} pacer${n === 1 ? '' : 's'}` : ''}`}
                selected={me.goalRaceId === r.id}
                onPress={() => updateMe({ goalRaceId: r.id })}
              />
            );
          })}
          <OptionCard
            illo="seedling"
            title="Nothing specific right now"
            subtitle="Just training for the love of it"
            selected={me.goalRaceId === ''}
            onPress={() => updateMe({ goalRaceId: '' })}
          />
        </YStack>

        <Callout icon="sparkles">
          {missing.length > 0
            ? `Add ${missing.join(', ')} to stay visible in Discover.`
            : `Matching on ${me.disciplines.map(formatLabel).join(', ')} · ${dayCount}× a week`}
        </Callout>
      </YStack>
    </ScrollView>
  );
}
