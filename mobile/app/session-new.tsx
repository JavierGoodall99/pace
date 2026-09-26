import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, YStack } from 'tamagui';
import { showPip } from '../src/components/PipKit';
import { PickRow } from '../src/components/Sessions';
import {
  Button,
  Callout,
  Card,
  Input,
  ScreenHeader,
  SectionTitle,
  ToggleRow,
} from '../src/components/ui';
import { Level, LEVELS } from '../src/data/athleteDepth';
import { formatWhen, shortDay, startOfDay } from '../src/data/dates';
import { DISCIPLINES, Discipline, SPORT_ILLO } from '../src/data/mockData';
import { spotsFor } from '../src/data/places';
import { hostOpen } from '../src/data/plans';
import { useMe } from '../src/data/session';
import { successHaptic } from '../src/lib/haptics';
import { formatLabel } from '../src/theme/tokens';

// Host an open session others can join.

const TIMES = ['06:00', '06:30', '07:00', '08:00', '12:30', '17:30', '18:30'];
const SIZES = ['1-on-1', 'Small group · 4', 'Group · 8'];
const SIZE_SPOTS: Record<string, number> = { '1-on-1': 1, 'Small group · 4': 4, 'Group · 8': 8 };

export default function NewSessionScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const me = useMe();
  const now = useMemo(() => new Date(), []);
  const city = me.city.trim() || 'Pretoria';

  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = startOfDay(now);
        d.setDate(d.getDate() + i + 1);
        return d.toISOString();
      }),
    [now]
  );

  const [activity, setActivity] = useState<Discipline>(me.disciplines[0] ?? 'RUNNING');
  const [title, setTitle] = useState('');
  const [day, setDay] = useState(days[0]);
  const [time, setTime] = useState('06:00');
  const [place, setPlace] = useState(spotsFor(city, activity)[0]?.name ?? '');
  const [distance, setDistance] = useState('');
  const [level, setLevel] = useState<Level>(me.level ?? 2);
  const [size, setSize] = useState(SIZES[1]);
  const [note, setNote] = useState('');
  const [singles, setSingles] = useState(false);

  const when = new Date(day);
  const [h, m] = time.split(':').map(Number);
  when.setHours(h, m, 0, 0);

  function post() {
    const s = hostOpen({
      title: title.trim() || `${formatLabel(activity)} at ${place}`,
      activity,
      date: when.toISOString(),
      place,
      city,
      distance: distance.trim() || 'Distance TBC',
      level,
      spots: singles ? Math.max(SIZE_SPOTS[size], 7) : SIZE_SPOTS[size],
      note: note.trim() || undefined,
      singles: singles || undefined,
      balance: singles
        ? {
            women: Math.ceil((Math.max(SIZE_SPOTS[size], 7) + 1) / 2),
            men: Math.ceil((Math.max(SIZE_SPOTS[size], 7) + 1) / 2),
          }
        : undefined,
    });
    successHaptic();
    showPip('Session posted! I’ll tell you when people join.');
    router.replace({ pathname: '/session/[id]', params: { id: s.id } });
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <YStack flex={1} bg="$canvas">
        <ScrollView flex={1} contentContainerStyle={{ pb: 24 }} keyboardShouldPersistTaps="handled">
          <ScreenHeader
            title="Host a *session*"
            subtitle={`People training in ${city} will see it.`}
            onBack={() => router.back()}
          />
          <YStack px={20} gap={22} mt={14}>
            <YStack>
              <SectionTitle>Activity</SectionTitle>
              <PickRow
                options={DISCIPLINES}
                value={activity}
                onChange={(a) => {
                  setActivity(a);
                  setPlace(spotsFor(city, a)[0]?.name ?? place);
                }}
                render={(a) => formatLabel(a)}
                illo={(a) => SPORT_ILLO[a]}
              />
            </YStack>
            <YStack>
              <SectionTitle>Name it</SectionTitle>
              <Input
                placeholder={`${formatLabel(activity)} at ${place}`}
                value={title}
                onChangeText={setTitle}
              />
            </YStack>
            <YStack>
              <SectionTitle>Day</SectionTitle>
              <PickRow
                options={days}
                value={day}
                onChange={setDay}
                render={(iso) => shortDay(new Date(iso))}
              />
            </YStack>
            <YStack>
              <SectionTitle>Time</SectionTitle>
              <PickRow options={TIMES} value={time} onChange={setTime} />
            </YStack>
            <YStack>
              <SectionTitle hint="Public spots only — safer for everyone.">Where</SectionTitle>
              <PickRow
                options={spotsFor(city, activity)
                  .slice(0, 4)
                  .map((s) => s.name)}
                value={place}
                onChange={setPlace}
              />
            </YStack>
            <YStack>
              <SectionTitle>Distance or duration</SectionTitle>
              <Input
                placeholder="e.g. 10 km easy · 2 hours"
                value={distance}
                onChangeText={setDistance}
              />
            </YStack>
            <YStack>
              <SectionTitle>Effort level</SectionTitle>
              <PickRow
                options={LEVELS.map((l) => String(l.id))}
                value={String(level)}
                onChange={(v) => setLevel(Number(v) as Level)}
                render={(v) => LEVELS.find((x) => String(x.id) === v)!.label}
                illo={(v) => LEVELS.find((x) => String(x.id) === v)!.illo}
              />
            </YStack>
            <YStack>
              <SectionTitle>Who can join</SectionTitle>
              <PickRow options={SIZES} value={size} onChange={setSize} />
            </YStack>
            <Card>
              <ToggleRow
                label="Singles run club"
                hint="Singles only, with equal spots for women and men"
                last
                value={singles}
                onChange={setSingles}
              />
            </Card>
            <YStack>
              <SectionTitle>Note</SectionTitle>
              <Input
                placeholder="e.g. No-drop pace, coffee after"
                value={note}
                onChangeText={setNote}
              />
            </YStack>
            <Callout icon="users" title="Tip">
              Small groups are the easiest first meet. You can always plan a 1-on-1 afterwards.
            </Callout>
          </YStack>
        </ScrollView>
        <YStack
          px={20}
          pt={12}
          gap={6}
          bg="$card"
          borderTopWidth={1}
          borderTopColor="$border"
          style={{ paddingBottom: insets.bottom + 12 }}
        >
          <Text fontSize={13} color="$muted" text="center">
            {formatWhen(when.toISOString())} · {place}
          </Text>
          <Button icon="plus" disabled={!place} onPress={post} style={{ width: '100%' }}>
            Post session
          </Button>
        </YStack>
      </YStack>
    </KeyboardAvoidingView>
  );
}
