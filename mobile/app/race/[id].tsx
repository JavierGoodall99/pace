import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { Aurora } from '../../src/components/Motif';
import { PhotoSlot } from '../../src/components/PhotoSlot';
import { showPip } from '../../src/components/PipKit';
import { SyncBadge } from '../../src/components/Rhythm';
import { Button, Callout, DisplayTitle, ScreenHeader } from '../../src/components/ui';
import { compatibility } from '../../src/data/compat';
import { formatWhen, nextDateFor } from '../../src/data/dates';
import { ATHLETE_PHOTOS } from '../../src/data/photos';
import { isShowable } from '../../src/data/pacers';
import { hostOpen, usePlans } from '../../src/data/plans';
import {
  athletesTrainingFor,
  buildUpRuns,
  daysUntil,
  formatRaceDate,
  raceById,
} from '../../src/data/races';
import { updateMe, useMe } from '../../src/data/session';
import { useSocial } from '../../src/data/social';
import { successHaptic } from '../../src/lib/haptics';

export default function RaceScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const me = useMe();
  const { blocked } = useSocial();
  const { open } = usePlans();
  const [now] = useState(() => new Date());
  const { id } = useLocalSearchParams<{ id: string }>();
  const race = raceById(id);

  if (!race) {
    return (
      <YStack flex={1} bg="$canvas">
        <ScreenHeader title="Race" onBack={() => router.back()} />
      </YStack>
    );
  }

  const mine = me.goalRaceId === race.id;
  // Same start line: verified, active people you haven't blocked.
  const runners = athletesTrainingFor(race.id).filter(
    (a) => isShowable(a) && !blocked.includes(a.id)
  );
  const days = daysUntil(race.date);
  const buildUp = buildUpRuns(race, now);
  // A build-up run already posted for that Saturday.
  const postedFor = (date: Date) =>
    open.find(
      (o) =>
        o.title === `${race.name} long run` &&
        new Date(o.date).toDateString() === date.toDateString()
    );

  function hostLongRun(date: Date, weeksToGo: number) {
    if (!race) return;
    const s = hostOpen({
      title: `${race.name} long run`,
      activity: race.sport,
      date: date.toISOString(),
      place: race.meetup,
      city: race.city,
      distance: `${weeksToGo} ${weeksToGo === 1 ? 'week' : 'weeks'} to go · long run`,
      level: me.level ?? 2,
      spots: 10,
      note: `Build-up long run for ${race.name}. All paces welcome — we regroup.`,
    });
    successHaptic();
    router.push({ pathname: '/session/[id]', params: { id: s.id } });
  }

  function hostMeetup() {
    if (!race) return;
    // Race-weekend meetup the day before, at the expo / start village.
    const raceDay = new Date(`${race.date}T00:00:00`);
    const dayBefore = new Date(raceDay.getTime() - 86400000);
    const date = days > 7 ? nextDateFor(5, '08:00') : dayBefore;
    if (days <= 7) date.setHours(10, 0, 0, 0);
    const s = hostOpen({
      title: days > 7 ? `${race.name} training run` : `${race.name} shake-out & meetup`,
      activity: race.sport,
      date: date.toISOString(),
      place: race.meetup,
      city: race.city,
      distance: days > 7 ? 'Race-pace practice' : 'Easy 5 km shake-out',
      level: me.level ?? 2,
      spots: 8,
      note: `For everyone racing ${race.name}. All paces welcome.`,
    });
    successHaptic();
    showPip('Meetup posted! Everyone racing will see it.');
    router.push({ pathname: '/session/[id]', params: { id: s.id } });
  }

  return (
    <YStack flex={1} bg="$canvas">
      <Aurora height={420} />
      <ScrollView flex={1} contentContainerStyle={{ pb: 24 }}>
        <ScreenHeader title={race.name} onBack={() => router.back()} />
        <YStack px={20} mt={10} gap={18}>
          <XStack items="baseline" gap={10}>
            <Text fontFamily="$display" fontSize={88} lineHeight={90} color="$accentText">
              {Math.max(days, 0)}
            </Text>
            <Text fontFamily="$semibold" fontSize={17} color="$muted">
              days to go
            </Text>
          </XStack>
          <Text fontSize={15} color="$muted">
            {formatRaceDate(race.date)} · {race.city} · {race.distance}
          </Text>

          <YStack gap={12}>
            <DisplayTitle size={28}>{`On the same *start line*`}</DisplayTitle>
            {runners.length === 0 ? (
              <Text fontSize={15} color="$muted">
                Nobody you’ve met is training for this yet — host a meetup and they’ll find you.
              </Text>
            ) : null}
            {runners.map((a) => {
              const c = compatibility(me, a);
              return (
                <XStack
                  key={a.id}
                  onPress={() =>
                    router.push({ pathname: '/athlete/[id]', params: { id: String(a.id) } })
                  }
                  items="center"
                  gap={12}
                  p={12}
                  rounded={20}
                  bg="$card"
                  borderWidth={1}
                  borderColor="$border"
                >
                  <PhotoSlot
                    label={a.name}
                    shape="circle"
                    source={ATHLETE_PHOTOS[a.slotId]}
                    style={{ width: 52, height: 52 }}
                  />
                  <YStack flex={1}>
                    <Text fontFamily="$semibold" fontSize={16} color="$text">
                      {a.name}, {a.age}
                    </Text>
                    <Text fontSize={13} color="$muted">
                      {a.city}
                    </Text>
                  </YStack>
                  <SyncBadge pct={c.score} />
                </XStack>
              );
            })}
          </YStack>

          {buildUp.length ? (
            <YStack gap={10}>
              <DisplayTitle size={28}>{`Build-up *long runs*`}</DisplayTitle>
              {buildUp.map(({ date, weeksToGo }) => {
                const posted = postedFor(date);
                return (
                  <XStack
                    key={date.toISOString()}
                    items="center"
                    gap={12}
                    p={14}
                    rounded={20}
                    bg="$card"
                    borderWidth={1}
                    borderColor="$border"
                  >
                    <YStack flex={1}>
                      <Text fontFamily="$semibold" fontSize={15} color="$text">
                        {`${formatWhen(date.toISOString(), now)}`}
                      </Text>
                      <Text fontSize={13} color="$muted">
                        {posted
                          ? `${posted.joined.length + 1} going · ${weeksToGo} wk to go`
                          : `${weeksToGo} wk to go`}
                      </Text>
                    </YStack>
                    <Button
                      variant={posted ? 'primary' : 'secondary'}
                      onPress={() =>
                        posted
                          ? router.push({ pathname: '/session/[id]', params: { id: posted.id } })
                          : hostLongRun(date, weeksToGo)
                      }
                      style={{ height: 40, paddingHorizontal: 16 }}
                    >
                      {posted ? 'View' : 'Host'}
                    </Button>
                  </XStack>
                );
              })}
            </YStack>
          ) : null}

          <Callout icon="map-pin" title="Race-weekend meetup">
            {`Meet at ${race.meetup}.`}
          </Callout>
        </YStack>
      </ScrollView>
      <YStack
        px={20}
        pt={12}
        gap={10}
        bg="$card"
        borderTopWidth={1}
        borderTopColor="$border"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        {mine ? null : (
          <Button
            variant="secondary"
            icon="check"
            onPress={() => {
              updateMe({ goalRaceId: race.id });
              showPip(`Locked in! ${days} days to ${race.name}. Let’s find you pacers.`);
            }}
            style={{ width: '100%' }}
          >
            I’m training for this
          </Button>
        )}
        <Button icon="users" onPress={hostMeetup} style={{ width: '100%' }}>
          {days > 7 ? 'Host a group training run' : 'Host a race-weekend meetup'}
        </Button>
      </YStack>
    </YStack>
  );
}
