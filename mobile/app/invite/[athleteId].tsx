import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { Icon } from '../../src/components/Icon';
import { PhotoSlot } from '../../src/components/PhotoSlot';
import { showPip } from '../../src/components/PipKit';
import { SyncBadge } from '../../src/components/Rhythm';
import { PickRow, SafetyPanel } from '../../src/components/Sessions';
import { Mascot } from '../../src/components/Mascot';
import { Badge, Button, Input, ScreenHeader, SectionTitle } from '../../src/components/ui';
import { compatibility } from '../../src/data/compat';
import { dayIndex, formatTime, formatWhen, shortDay, startOfDay } from '../../src/data/dates';
import { athleteById, Discipline, SPORT_ILLO } from '../../src/data/mockData';
import { suggestSession } from '../../src/data/pacers';
import { ATHLETE_PHOTOS } from '../../src/data/photos';
import { spotsFor } from '../../src/data/places';
import { sendInvite } from '../../src/data/plans';
import { useMe } from '../../src/data/session';
import { isActiveMatch, useChat } from '../../src/data/chat';
import { useSocial } from '../../src/data/social';
import { successHaptic, tapHaptic } from '../../src/lib/haptics';
import { useColors } from '../../src/theme/appearance';
import { formatLabel } from '../../src/theme/tokens';

// Invite to train. Only for matches (you both liked each other). Pre-filled
// from both of your weeks, public spots only, with safety options built in.

const TIMES = ['06:00', '06:30', '07:00', '08:00', '12:30', '17:30', '18:30'];

export default function InviteScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const me = useMe();
  const params = useLocalSearchParams<{
    athleteId: string;
    date?: string;
    place?: string;
    activity?: string;
  }>();
  const athlete = athleteById(Number(params.athleteId));
  const social = useSocial();
  const chat = useChat();

  const now = useMemo(() => new Date(), []);
  const compat = useMemo(() => (athlete ? compatibility(me, athlete) : null), [me, athlete]);
  const suggestion = useMemo(
    () => (athlete && compat ? suggestSession(me, athlete, compat, now) : null),
    [me, athlete, compat, now]
  );

  const initialDate = params.date ? new Date(params.date) : (suggestion?.date ?? now);
  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = startOfDay(now);
        d.setDate(d.getDate() + i);
        return d;
      }),
    [now]
  );

  const [activity, setActivity] = useState<Discipline>(
    (params.activity as Discipline) || athlete?.discipline || 'RUNNING'
  );
  const [dayKey, setDayKey] = useState(startOfDay(initialDate).toISOString());
  const [time, setTime] = useState(
    TIMES.includes(formatTime(initialDate)) ? formatTime(initialDate) : '06:00'
  );
  const [place, setPlace] = useState(params.place || suggestion?.place || '');
  const [note, setNote] = useState('');
  const [share, setShare] = useState(false);
  const [timer, setTimer] = useState(true);

  if (!athlete || !compat) {
    return (
      <YStack flex={1} bg="$canvas">
        <ScreenHeader title="Invite" onBack={() => router.back()} />
      </YStack>
    );
  }

  if (!isActiveMatch(athlete.id, social, chat, now)) {
    return (
      <YStack flex={1} bg="$canvas">
        <ScreenHeader title={`Invite *${athlete.name}*`} onBack={() => router.back()} />
        <YStack flex={1} items="center" justify="center" px={32} gap={12}>
          <Mascot size={110} mood="thinking" />
          <Text fontFamily="$semibold" fontSize={18} color="$text" text="center">
            Match first, then train
          </Text>
          <Text fontSize={15} lineHeight={22} color="$muted" text="center">
            {`Invites to train are only for matches. Like ${athlete.name}, and if they like you back you can plan a session together.`}
          </Text>
          <Button
            icon="heart"
            style={{ width: '100%', marginTop: 8 }}
            onPress={() =>
              router.replace({ pathname: '/athlete/[id]', params: { id: String(athlete.id) } })
            }
          >
            {`View ${athlete.name}’s profile`}
          </Button>
        </YStack>
      </YStack>
    );
  }

  const activities = Array.from(new Set<Discipline>([athlete.discipline, ...me.disciplines]));
  const spots = spotsFor(athlete.city, activity);
  const shared = new Set(compat.sharedDayIdx);
  const when = new Date(dayKey);
  const [h, m] = time.split(':').map(Number);
  when.setHours(h, m, 0, 0);
  const inPast = when.getTime() < now.getTime();
  const summary = `${formatLabel(activity)} with ${athlete.name} · ${formatWhen(when.toISOString())} · ${place}`;

  function send() {
    if (!athlete) return;
    const plan = sendInvite({
      athleteId: athlete.id,
      activity,
      date: when.toISOString(),
      place,
      note: note.trim() || undefined,
      shareWithFriend: share,
      checkInTimer: timer,
    });
    if (!plan) return;
    successHaptic();
    showPip(`Invite sent! I’ll let you know when ${athlete.name} replies.`);
    router.back();
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <YStack flex={1} bg="$canvas">
        <ScrollView flex={1} contentContainerStyle={{ pb: 24 }} keyboardShouldPersistTaps="handled">
          <ScreenHeader title={`Invite *${athlete.name}*`} onBack={() => router.back()} />

          <YStack px={20} gap={22} mt={14}>
            <XStack
              items="center"
              gap={12}
              p={12}
              rounded={20}
              bg="$card"
              borderWidth={1}
              borderColor="$border"
            >
              <PhotoSlot
                label={athlete.name}
                shape="circle"
                source={ATHLETE_PHOTOS[athlete.slotId]}
                style={{ width: 48, height: 48 }}
              />
              <YStack flex={1}>
                <Text fontFamily="$semibold" fontSize={15} color="$text">
                  {athlete.name} · {formatLabel(athlete.discipline)}
                </Text>
                <Text fontSize={13} color="$muted" numberOfLines={1}>
                  {compat.factors[0].detail}
                </Text>
              </YStack>
              <SyncBadge pct={compat.score} />
            </XStack>

            <YStack>
              <SectionTitle>Activity</SectionTitle>
              <PickRow
                options={activities}
                value={activity}
                onChange={setActivity}
                render={(a) => formatLabel(a)}
                illo={(a) => SPORT_ILLO[a]}
              />
            </YStack>

            <YStack>
              <SectionTitle hint="✦ = a day you both usually train">Day</SectionTitle>
              <PickRow
                options={days.map((d) => d.toISOString())}
                value={dayKey}
                onChange={setDayKey}
                render={(iso) => {
                  const d = new Date(iso);
                  const label = d.getTime() === startOfDay(now).getTime() ? 'Today' : shortDay(d);
                  return shared.has(dayIndex(d)) ? `${label} ✦` : label;
                }}
              />
            </YStack>

            <YStack>
              <SectionTitle>Time</SectionTitle>
              <PickRow options={TIMES} value={time} onChange={setTime} />
            </YStack>

            <YStack>
              <SectionTitle hint="Busy, public places">Where</SectionTitle>
              <YStack gap={8}>
                {spots.slice(0, 4).map((s) => {
                  const active = s.name === place;
                  return (
                    <XStack
                      key={s.name}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      onPress={() => {
                        tapHaptic();
                        setPlace(s.name);
                      }}
                      items="center"
                      gap={12}
                      p={14}
                      rounded={16}
                      borderWidth={active ? 2 : 1}
                      borderColor={active ? '$accent' : '$border'}
                      bg={active ? '$accentSoft' : '$card'}
                    >
                      <Icon
                        name="map-pin"
                        size={18}
                        color={active ? colors.accentText : colors.muted}
                      />
                      <YStack flex={1}>
                        <Text fontFamily="$semibold" fontSize={15} color="$text">
                          {s.name}
                        </Text>
                        <Text fontSize={12} color="$muted">
                          {s.city}
                        </Text>
                      </YStack>
                      <Badge tone="success" icon="shield-check">
                        Public
                      </Badge>
                    </XStack>
                  );
                })}
              </YStack>
            </YStack>

            <YStack>
              <SectionTitle>Add a note</SectionTitle>
              <Input
                placeholder="e.g. Easy pace, coffee after?"
                value={note}
                onChangeText={setNote}
              />
            </YStack>

            <SafetyPanel
              share={share}
              onShare={setShare}
              timer={timer}
              onTimer={setTimer}
              summary={summary}
            />
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
            {inPast ? 'That time has passed — pick a later slot.' : formatWhen(when.toISOString())}
          </Text>
          {me.verified ? (
            <Button
              icon="send"
              disabled={inPast || !place}
              onPress={send}
              style={{ width: '100%' }}
            >
              {`Invite ${athlete.name} to train`}
            </Button>
          ) : (
            <Button
              icon="shield-check"
              onPress={() => router.push('/verify')}
              style={{ width: '100%' }}
            >
              Verify to send invites
            </Button>
          )}
        </YStack>
      </YStack>
    </KeyboardAvoidingView>
  );
}
