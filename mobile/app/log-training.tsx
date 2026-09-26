import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { Icon } from '../src/components/Icon';
import { showPip } from '../src/components/PipKit';
import { PickRow } from '../src/components/Sessions';
import { Button, Callout, Card, Input, ScreenHeader, SectionTitle } from '../src/components/ui';
import { formatWhen, startOfDay } from '../src/data/dates';
import { DISCIPLINES, Discipline } from '../src/data/mockData';
import { useMe } from '../src/data/session';
import {
  activityText,
  logTraining,
  MAX_BACKFILL_DAYS,
  removeTraining,
  SOURCE_LABEL,
  useMyTraining,
} from '../src/data/training';
import { ACTIVE_DAYS } from '../src/data/trust';
import { successHaptic } from '../src/lib/haptics';
import { useColors } from '../src/theme/appearance';
import { formatLabel } from '../src/theme/tokens';

// Log a session. Pace only shows people who trained in the last
// ACTIVE_DAYS days, so this (or a Strava/Garmin sync, or a Pace session)
// keeps you visible.

const DURATIONS = ['20', '30', '45', '60', '90', '120'];

function dayLabel(offset: number, d: Date): string {
  if (offset === 0) return 'Today';
  if (offset === 1) return 'Yesterday';
  return d.toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric' });
}

export default function LogTrainingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const me = useMe();
  const now = useMemo(() => new Date(), []);
  const { all, activity } = useMyTraining(now);

  const days = useMemo(
    () =>
      Array.from({ length: MAX_BACKFILL_DAYS + 1 }, (_, i) => {
        const d = startOfDay(now);
        d.setDate(d.getDate() - i);
        return { key: String(i), label: dayLabel(i, d), date: d };
      }),
    [now]
  );
  const sports = me.disciplines.length
    ? [...me.disciplines, ...DISCIPLINES.filter((d) => !me.disciplines.includes(d))]
    : DISCIPLINES;

  // Follow the profile until the user picks, so a cold start (profile
  // still loading) doesn't lock in the wrong default.
  const [sportPick, setSport] = useState<Discipline | null>(null);
  const sport = sportPick ?? me.disciplines[0] ?? 'RUNNING';
  const [dayKey, setDayKey] = useState('0');
  const [minutes, setMinutes] = useState('45');
  const [km, setKm] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  function save() {
    const day = days.find((d) => d.key === dayKey)!;
    // Today: log it as now. Earlier days: early evening that day.
    const at = dayKey === '0' ? new Date() : new Date(day.date);
    if (dayKey !== '0') at.setHours(18, 0, 0, 0);
    const res = logTraining({
      at,
      sport,
      minutes: Number(minutes),
      km: km.trim() ? Number(km.replace(',', '.')) : undefined,
      note,
    });
    if (!res.ok) return setError(res.error);
    successHaptic();
    showPip(
      dayKey === '0' ? 'Logged! That keeps you in people’s decks.' : 'Logged. Nice work.',
      'excited'
    );
    router.back();
  }

  const recent = all.slice(0, 8);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <YStack flex={1} bg="$canvas">
        <ScreenHeader
          title="Log *training*"
          subtitle={activityText(activity)}
          onBack={() => router.back()}
        />
        <ScrollView
          flex={1}
          contentContainerStyle={{ p: 20, gap: 24, pb: insets.bottom + 24 }}
          keyboardShouldPersistTaps="handled"
        >
          <YStack>
            <SectionTitle>What</SectionTitle>
            <PickRow options={sports} value={sport} onChange={setSport} render={formatLabel} />
          </YStack>

          <YStack>
            <SectionTitle>When</SectionTitle>
            <PickRow
              options={days.map((d) => d.key)}
              value={dayKey}
              onChange={setDayKey}
              render={(k) => days.find((d) => d.key === k)!.label}
            />
          </YStack>

          <YStack>
            <SectionTitle>How long (minutes)</SectionTitle>
            <PickRow options={DURATIONS} value={minutes} onChange={setMinutes} />
          </YStack>

          <YStack gap={10}>
            <SectionTitle>Extras (optional)</SectionTitle>
            <Input
              placeholder="Distance in km"
              value={km}
              onChangeText={(v) => setKm(v.replace(/[^0-9.,]/g, '').slice(0, 5))}
              keyboardType="numeric"
            />
            <Input
              placeholder="Note, e.g. Tempo on the promenade"
              value={note}
              onChangeText={(v) => setNote(v.slice(0, 80))}
            />
          </YStack>

          {error ? (
            <Text fontFamily="$medium" fontSize={14} color="$accentText">
              {error}
            </Text>
          ) : null}

          <Button icon="check" onPress={save} style={{ width: '100%' }}>
            Save session
          </Button>

          <Callout icon="shield-check">
            {`Pace only shows people who trained in the last ${ACTIVE_DAYS} days. Logged sessions keep you visible; Strava, Garmin and Pace sessions count as verified.`}
          </Callout>

          {recent.length ? (
            <YStack gap={10}>
              <SectionTitle>Recent</SectionTitle>
              <Card>
                {recent.map((e, i) => (
                  <XStack
                    key={e.id}
                    items="center"
                    gap={12}
                    py={12}
                    borderBottomWidth={i === recent.length - 1 ? 0 : 1}
                    borderBottomColor="$border"
                  >
                    <YStack flex={1}>
                      <Text fontFamily="$semibold" fontSize={15} color="$text">
                        {formatLabel(e.sport)} · {e.minutes} min{e.km ? ` · ${e.km} km` : ''}
                      </Text>
                      <Text fontSize={13} color="$muted">
                        {formatWhen(e.at)} · {SOURCE_LABEL[e.source]}
                      </Text>
                    </YStack>
                    {e.source === 'manual' ? (
                      <XStack
                        accessibilityRole="button"
                        aria-label="Remove session"
                        accessibilityLabel="Remove session"
                        onPress={() => removeTraining(e.id)}
                        width={36}
                        height={36}
                        rounded={18}
                        items="center"
                        justify="center"
                        bg="$surface"
                      >
                        <Icon name="x" size={16} color={colors.muted} />
                      </XStack>
                    ) : (
                      <Icon name="shield-check" size={18} color={colors.success} />
                    )}
                  </XStack>
                ))}
              </Card>
            </YStack>
          ) : null}
        </ScrollView>
      </YStack>
    </KeyboardAvoidingView>
  );
}
