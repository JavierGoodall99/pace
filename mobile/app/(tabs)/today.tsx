import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { Illo } from '../../src/components/Illustrations';
import { Icon } from '../../src/components/Icon';
import { ConditionsCard } from '../../src/components/Explore';
import { MomentsRow } from '../../src/components/Moments';
import { PipTip, showPip } from '../../src/components/PipKit';
import { GoalCard } from '../../src/components/Proof';
import { CheckInCard, SessionCard } from '../../src/components/Sessions';
import { useTabBarSpace } from '../../src/components/TabBar';
import { Button, DisplayTitle, IconButton } from '../../src/components/ui';
import { dayIndex, startOfDay } from '../../src/data/dates';
import { athleteById } from '../../src/data/mockData';
import {
  checkIn,
  checkInOutcome,
  effectiveStatus,
  respondToInvite,
  usePlans,
} from '../../src/data/plans';
import { usePacerDeck } from '../../src/data/deck';
import { activityText, SOURCE_LABEL, useMyTraining } from '../../src/data/training';
import { todayLine } from '../../src/data/pip';
import { athletesTrainingFor, raceById } from '../../src/data/races';
import { rhythmForMe, WEEK_DAY_NAMES } from '../../src/data/rhythm';
import { useMe } from '../../src/data/session';
import { useColors } from '../../src/theme/appearance';
import { useNow } from '../../src/lib/useNow';
import { formatLabel } from '../../src/theme/tokens';

// Home. Pace is built around sessions, so Today answers "what am I
// training this week, and with whom?" — plus anything waiting on you.

function greeting(now: Date) {
  const h = now.getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

export default function TodayScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const tabBarSpace = useTabBarSpace();
  const router = useRouter();
  const me = useMe();
  const state = usePlans();
  const now = useNow();

  const rhythm = rhythmForMe(me.cadence, me.trainingDays);
  const first = me.name.trim().split(' ')[0] || 'you';

  // Sessions still waiting on your check-in, plus any you just answered
  // (so the mutual result shows before the card goes away).
  const [answered, setAnswered] = useState<string[]>([]);
  const toCheckIn = state.plans.filter((p) => {
    if (effectiveStatus(p, now) !== 'done') return false;
    const outcome = checkInOutcome(p);
    return outcome === null || outcome === 'waiting' || answered.includes(p.id);
  });
  const received = state.plans.filter((p) => p.status === 'received');
  const upcoming = state.plans
    .filter(
      (p) => (p.status === 'confirmed' || p.status === 'sent') && effectiveStatus(p, now) !== 'done'
    )
    .sort((a, b) => a.date.localeCompare(b.date));
  const joined = state.open.filter((o) => o.joined.includes('me') || o.hostId === 'me');

  // This week, Monday first, with a dot for each session.
  const monday = startOfDay(now);
  monday.setDate(monday.getDate() - dayIndex(now));
  const week = WEEK_DAY_NAMES.map((name, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const sessions = [...upcoming.map((p) => p.date), ...joined.map((o) => o.date)].filter(
      (iso) => startOfDay(new Date(iso)).getTime() === d.getTime()
    ).length;
    return { name, date: d.getDate(), today: i === dayIndex(now), training: rhythm[i], sessions };
  });

  const goal = raceById(me.goalRaceId);
  const pacersLeft = usePacerDeck(now).deck.length;

  return (
    <ScrollView
      flex={1}
      bg="$canvas"
      contentContainerStyle={{ pt: insets.top + 8, pb: tabBarSpace + 16 }}
    >
      <XStack px={20} items="flex-start" justify="space-between">
        <YStack flex={1}>
          <Text fontFamily="$medium" fontSize={14} color="$muted">
            {greeting(now)}
          </Text>
          <DisplayTitle size={42}>{`Ready to move, *${first}*?`}</DisplayTitle>
        </YStack>
        <IconButton
          size={40}
          onPress={() => router.push('/notifications')}
          accessibilityLabel="Notifications"
          aria-label="Notifications"
        >
          <Icon name="bell" size={18} color={colors.text} />
        </IconButton>
      </XStack>

      <YStack mt={18}>
        <MomentsRow />
      </YStack>

      {/* This week */}
      <XStack
        mx={20}
        mt={18}
        p={10}
        gap={4}
        rounded={22}
        bg="$card"
        borderWidth={1}
        borderColor="$border"
      >
        {week.map((d) => (
          <YStack
            key={d.name}
            flex={1}
            items="center"
            py={10}
            gap={4}
            rounded={16}
            bg={d.today ? '$accent' : 'transparent'}
          >
            <Text fontFamily="$medium" fontSize={11} color={d.today ? '$onAccent' : '$muted'}>
              {d.name}
            </Text>
            <Text fontFamily="$bold" fontSize={17} color={d.today ? '$onAccent' : '$text'}>
              {d.date}
            </Text>
            <XStack gap={3} height={6}>
              {d.sessions > 0 ? (
                Array.from({ length: Math.min(d.sessions, 3) }).map((_, i) => (
                  <YStack
                    key={i}
                    width={6}
                    height={6}
                    rounded={3}
                    bg={d.today ? '$onAccent' : '$accent'}
                  />
                ))
              ) : d.training ? (
                <YStack
                  width={6}
                  height={6}
                  rounded={3}
                  bg={d.today ? 'rgba(255,255,255,0.5)' : '$borderStrong'}
                />
              ) : null}
            </XStack>
          </YStack>
        ))}
      </XStack>
      <XStack mx={24} mt={8} gap={14}>
        <Legend dotBg="$accent" label="Session planned" />
        <Legend dotBg="$borderStrong" label="Your training day" />
      </XStack>

      <TrainedTodayCard now={now} onLog={() => router.push('/log-training')} />

      <YStack px={20} mt={20} gap={14}>
        <PipTip line={todayLine(me, state.plans, pacersLeft, now)} />
        <ConditionsCard compact />
      </YStack>

      <YStack px={20} gap={14} mt={20}>
        {toCheckIn.map((p) => (
          <CheckInCard
            key={p.id}
            plan={p}
            onAnswer={(c) => {
              setAnswered((prev) => [...prev, p.id]);
              checkIn(p.id, c);
            }}
          />
        ))}

        {received.length > 0 ? <SectionLabel>Invites for you</SectionLabel> : null}
        {received.map((p) => {
          const a = athleteById(p.athleteId);
          return (
            <SessionCard
              key={p.id}
              title={`${formatLabel(p.activity)} with ${a?.name ?? 'someone'}`}
              activity={p.activity}
              date={p.date}
              place={p.place}
              athleteId={p.athleteId}
              status="received"
              meta={p.note ? `“${p.note}”` : undefined}
              onPress={() =>
                router.push({ pathname: '/athlete/[id]', params: { id: String(p.athleteId) } })
              }
            >
              <XStack gap={10}>
                <Button
                  variant="secondary"
                  onPress={() => respondToInvite(p.id, false)}
                  style={{ flex: 1, height: 44 }}
                >
                  Decline
                </Button>
                <Button
                  icon="check"
                  onPress={() => {
                    respondToInvite(p.id, true);
                    showPip(`It’s on! ${a?.name ?? 'Your session'} is in your week.`);
                  }}
                  style={{ flex: 1, height: 44 }}
                >
                  I’m in
                </Button>
              </XStack>
            </SessionCard>
          );
        })}

        <SectionLabel>Coming up</SectionLabel>
        {upcoming.length === 0 && joined.length === 0 ? (
          <YStack
            p={18}
            gap={12}
            rounded={22}
            bg="$card"
            borderWidth={1}
            borderColor="$border"
            items="flex-start"
          >
            <Text fontSize={15} color="$muted">
              Nothing planned yet. Invite one of this week’s pacers, or join an open session.
            </Text>
            <Button
              icon="sparkles"
              onPress={() => router.push('/(tabs)/discover')}
              style={{ height: 44 }}
            >
              See your pacers
            </Button>
          </YStack>
        ) : null}
        {upcoming.map((p) => {
          const a = athleteById(p.athleteId);
          return (
            <SessionCard
              key={p.id}
              title={`${formatLabel(p.activity)} with ${a?.name ?? 'someone'}`}
              activity={p.activity}
              date={p.date}
              place={p.place}
              athleteId={p.athleteId}
              status={p.status}
              meta={
                p.status === 'sent'
                  ? `Waiting for ${a?.name ?? 'them'} to reply`
                  : p.shareWithFriend
                    ? 'Shared with a friend'
                    : undefined
              }
              onPress={() =>
                router.push({
                  pathname: '/thread/[athleteId]',
                  params: { athleteId: String(p.athleteId) },
                })
              }
            />
          );
        })}
        {joined.map((o) => (
          <SessionCard
            key={o.id}
            title={o.title}
            activity={o.activity}
            date={o.date}
            place={o.place}
            meta={
              o.hostId === 'me'
                ? `You’re hosting · ${o.joined.length} joined`
                : `Group · ${o.joined.length + 1} going`
            }
            onPress={() => router.push({ pathname: '/session/[id]', params: { id: o.id } })}
          />
        ))}

        {goal ? (
          <>
            <SectionLabel>Race countdown</SectionLabel>
            <GoalCard
              race={goal}
              others={athletesTrainingFor(goal.id).length}
              mine
              onPress={() => router.push({ pathname: '/race/[id]', params: { id: goal.id } })}
            />
          </>
        ) : (
          <XStack
            onPress={() => router.push('/races')}
            items="center"
            gap={12}
            p={16}
            rounded={22}
            bg="$card"
            borderWidth={1}
            borderColor="$border"
          >
            <Illo name="flag" size={40} />
            <YStack flex={1}>
              <Text fontFamily="$semibold" fontSize={15} color="$text">
                Training for a race?
              </Text>
              <Text fontSize={13} color="$muted">
                See who’s running the same start line.
              </Text>
            </YStack>
            <Icon name="chevron-right" size={18} color={colors.muted} />
          </XStack>
        )}

        <XStack
          onPress={() => router.push('/safety')}
          items="center"
          gap={12}
          p={16}
          rounded={22}
          bg="$successSoft"
        >
          <Icon name="shield-check" size={22} color={colors.success} strokeWidth={2} />
          <YStack flex={1}>
            <Text fontFamily="$semibold" fontSize={15} color="$text">
              Safety centre
            </Text>
            <Text fontSize={13} color="$muted">
              Public spots, check-in timers and first-meet tips.
            </Text>
          </YStack>
          <Icon name="chevron-right" size={18} color={colors.muted} />
        </XStack>
      </YStack>
    </ScrollView>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <Text fontFamily="$semibold" fontSize={17} color="$text" mt={6}>
      {children}
    </Text>
  );
}

function Legend({ dotBg, label }: { dotBg: string; label: string }) {
  return (
    <XStack items="center" gap={6}>
      <YStack width={6} height={6} rounded={3} bg={dotBg as any} />
      <Text fontSize={12} color="$muted">
        {label}
      </Text>
    </XStack>
  );
}

// Did you train today? One tap to log it. Logging (or a sync, or a Pace
// session) is what keeps you in other people's decks.
function TrainedTodayCard({ now, onLog }: { now: Date; onLog: () => void }) {
  const colors = useColors();
  const { all, activity } = useMyTraining(now);
  const today = activity.trainedToday ? all[0] : undefined;
  return (
    <XStack
      mx={20}
      mt={14}
      p={14}
      gap={12}
      items="center"
      rounded={20}
      bg={today ? '$successSoft' : '$card'}
      borderWidth={1}
      borderColor={today ? '$success' : '$border'}
    >
      <XStack
        width={40}
        height={40}
        rounded={12}
        items="center"
        justify="center"
        bg={today ? '$card' : '$accentSoft'}
      >
        <Icon
          name={today ? 'check' : 'zap'}
          size={20}
          color={today ? colors.success : colors.accentText}
          strokeWidth={2.4}
        />
      </XStack>
      <YStack flex={1}>
        <Text fontFamily="$semibold" fontSize={15} color="$text">
          {today ? 'Trained today' : 'Did you train today?'}
        </Text>
        <Text fontSize={13} color="$muted" numberOfLines={1}>
          {today
            ? `${formatLabel(today.sport)} · ${today.minutes} min · ${SOURCE_LABEL[today.source]}`
            : activityText(activity)}
        </Text>
      </YStack>
      <Button
        variant={today ? 'ghost' : 'primary'}
        icon="plus"
        onPress={onLog}
        style={{ height: 40, paddingHorizontal: 14 }}
      >
        {today ? 'Add' : 'Log it'}
      </Button>
    </XStack>
  );
}
