import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import type { ScrollView as RNScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { Icon } from '../../src/components/Icon';
import { PhotoSlot } from '../../src/components/PhotoSlot';
import { Badge, Button, Chip, IconButton, Input } from '../../src/components/ui';
import {
  addSession,
  athleteById,
  DISCIPLINES,
  Discipline,
  PlanCard,
  THREAD_MESSAGES,
  ThreadMessage,
  updateSessionStatus,
} from '../../src/data/mockData';
import { ATHLETE_PHOTOS } from '../../src/data/photos';
import { useColors } from '../../src/theme/appearance';
import { formatLabel, shadow } from '../../src/theme/tokens';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Tapping instead of typing a time — the slots users most often train in.
const TIME_SLOTS = ['06:00', '07:00', '08:00', '12:00', '17:00', '18:00', '19:00', '20:00'];

// Next `count` days as tappable chips — Today / Tomorrow for the first
// two, then weekday + day number (e.g. Sat 19).
function upcomingDates(count: number): { key: string; label: string }[] {
  const now = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    if (i === 0) return { key: `d${i}`, label: 'Today' };
    if (i === 1) return { key: `d${i}`, label: 'Tomorrow' };
    return { key: `d${i}`, label: `${DAY_LABELS[d.getDay()]} ${d.getDate()}` };
  });
}

export default function ThreadScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { athleteId } = useLocalSearchParams<{ athleteId: string }>();
  const athlete = athleteById(Number(athleteId));

  const [messages, setMessages] = useState<ThreadMessage[]>(
    () => THREAD_MESSAGES[Number(athleteId)] ?? []
  );
  const [note, setNote] = useState('');
  const [planning, setPlanning] = useState(false);
  const [activity, setActivity] = useState<Discipline>(athlete?.discipline ?? 'RUNNING');
  const [date, setDate] = useState<{ key: string; label: string } | null>(null);
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const scrollRef = useRef<RNScrollView>(null);

  // The plan panel lives inside the scroll view; bring it into view above
  // the keyboard whenever it opens or a field gets focus.
  const scrollToEnd = () =>
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120);

  useEffect(() => {
    if (planning) {
      const t = scrollToEnd();
      return () => clearTimeout(t);
    }
  }, [planning]);

  if (!athlete) {
    return (
      <YStack flex={1} bg="$canvas">
        <Text color="$muted" text="center" mt={100}>
          Conversation not found.
        </Text>
      </YStack>
    );
  }

  const dates = upcomingDates(7);
  const planReady = !!date && time.length > 0 && location.trim().length > 0;

  const sendText = () => {
    if (!note.trim()) return;
    setMessages((prev) => [...prev, { from: 'me', text: note.trim() }]);
    setNote('');
  };

  const attachPlan = () => {
    if (!planReady || !date) return;
    const when = `${date.label} · ${time.trim()}`;
    const session = addSession(athlete.id, activity, when, location.trim());
    const plan: PlanCard = {
      id: session.id,
      activity,
      when,
      location: location.trim(),
      status: 'INVITE',
    };
    setMessages((prev) => [...prev, { from: 'me', text: note.trim(), plan }]);
    setNote('');
    setDate(null);
    setTime('');
    setLocation('');
    setPlanning(false);
  };

  const respondTo = (index: number, status: 'CONFIRMED' | 'DECLINED') => {
    const plan = messages[index]?.plan;
    if (!plan) return;
    updateSessionStatus(plan.id, status);
    setMessages((prev) =>
      prev.map((m, i) => (i === index && m.plan ? { ...m, plan: { ...m.plan, status } } : m))
    );
  };

  return (
    <YStack flex={1} bg="$canvas">
      <XStack
        items="center"
        gap={12}
        px={16}
        pb={12}
        pt={insets.top + 8}
        borderBottomWidth={1}
        borderBottomColor="$border"
        bg="$card"
      >
        <IconButton size={40} onPress={() => router.back()} accessibilityLabel="Back">
          <Icon name="chevron-left" size={20} color={colors.text} />
        </IconButton>
        <XStack
          flex={1}
          items="center"
          gap={10}
          onPress={() =>
            router.push({ pathname: '/athlete/[id]', params: { id: String(athlete.id) } })
          }
        >
          <PhotoSlot
            label={athlete.name}
            shape="circle"
            source={ATHLETE_PHOTOS[athlete.slotId]}
            style={{ width: 40, height: 40 }}
          />
          <YStack>
            <Text fontFamily="$semibold" fontSize={16} color="$text">
              {athlete.name}
            </Text>
            <Text fontSize={13} color="$muted">
              {formatLabel(athlete.discipline)} · {athlete.city}
            </Text>
          </YStack>
        </XStack>
      </XStack>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          flex={1}
          contentContainerStyle={{
            p: 20,
            gap: 10,
            pb: planning ? insets.bottom + 24 : 24,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((m, i) => {
            const mine = m.from === 'me';
            const plan = m.plan;
            return (
              <YStack key={i} items={mine ? 'flex-end' : 'flex-start'}>
                <YStack
                  bg={mine ? '$accent' : '$card'}
                  borderWidth={mine ? 0 : 1}
                  borderColor="$border"
                  maxW="80%"
                  px={14}
                  py={10}
                  rounded={20}
                  borderBottomRightRadius={mine ? 6 : 20}
                  borderBottomLeftRadius={mine ? 20 : 6}
                >
                  {m.text ? (
                    <Text color={mine ? '$onAccent' : '$text'} fontSize={15} lineHeight={21}>
                      {m.text}
                    </Text>
                  ) : null}
                  {plan ? (
                    <YStack
                      minW={220}
                      gap={8}
                      p={14}
                      rounded={16}
                      bg="$card"
                      borderWidth={mine ? 0 : 1}
                      borderColor="$border"
                      mt={m.text ? 10 : 0}
                    >
                      <XStack items="center" justify="space-between" gap={8}>
                        <Text fontFamily="$bold" fontSize={16} color="$text">
                          {formatLabel(plan.activity)}
                        </Text>
                        <Badge
                          tone={
                            plan.status === 'CONFIRMED'
                              ? 'success'
                              : plan.status === 'DECLINED'
                                ? 'neutral'
                                : 'accent'
                          }
                        >
                          {plan.status === 'INVITE' ? 'Invite' : plan.status}
                        </Badge>
                      </XStack>
                      <XStack items="center" gap={8}>
                        <Icon name="clock" size={15} color={colors.muted} />
                        <Text fontSize={14} color="$text">
                          {plan.when}
                        </Text>
                      </XStack>
                      <XStack items="center" gap={8}>
                        <Icon name="map-pin" size={15} color={colors.muted} />
                        <Text fontSize={14} color="$text">
                          {plan.location}
                        </Text>
                      </XStack>
                      {!mine && plan.status === 'INVITE' ? (
                        <XStack gap={8} mt={10}>
                          <XStack
                            flex={1}
                            height={40}
                            rounded="$full"
                            items="center"
                            justify="center"
                            bg="$surface"
                            pressStyle={{ opacity: 0.8 }}
                            onPress={() => respondTo(i, 'DECLINED')}
                          >
                            <Text fontFamily="$semibold" fontSize={14} color="$text">
                              Decline
                            </Text>
                          </XStack>
                          <XStack
                            flex={1}
                            height={40}
                            rounded="$full"
                            items="center"
                            justify="center"
                            bg="$accent"
                            pressStyle={{ opacity: 0.85 }}
                            onPress={() => respondTo(i, 'CONFIRMED')}
                          >
                            <Text fontFamily="$semibold" fontSize={14} color="$onAccent">
                              Accept
                            </Text>
                          </XStack>
                        </XStack>
                      ) : null}
                    </YStack>
                  ) : null}
                </YStack>
              </YStack>
            );
          })}

          {planning ? (
            <YStack
              gap={20}
              p={18}
              rounded={24}
              bg="$card"
              borderWidth={1}
              borderColor="$border"
              style={shadow.card}
            >
              <XStack items="center" justify="space-between">
                <Text fontFamily="$bold" fontSize={18} color="$text">
                  Plan a session
                </Text>
                <IconButton size={32} onPress={() => setPlanning(false)} accessibilityLabel="Close">
                  <Icon name="x" size={16} color={colors.muted} />
                </IconButton>
              </XStack>

              <YStack>
                <Text fontFamily="$semibold" fontSize={15} color="$text">
                  Activity
                </Text>
                <XStack flexWrap="wrap" gap={8} mt={10}>
                  {DISCIPLINES.map((d) => (
                    <Chip
                      key={d}
                      label={d}
                      selected={d === activity}
                      onPress={() => setActivity(d)}
                    />
                  ))}
                </XStack>
              </YStack>

              <YStack>
                <Text fontFamily="$semibold" fontSize={15} color="$text">
                  Date
                </Text>
                <XStack flexWrap="wrap" gap={8} mt={10}>
                  {dates.map((d) => (
                    <Chip
                      key={d.key}
                      label={d.label}
                      selected={date?.key === d.key}
                      onPress={() => setDate(d)}
                    />
                  ))}
                </XStack>
              </YStack>

              <YStack>
                <Text fontFamily="$semibold" fontSize={15} color="$text">
                  Time
                </Text>
                <XStack flexWrap="wrap" gap={8} mt={10}>
                  {TIME_SLOTS.map((t) => (
                    <Chip key={t} label={t} selected={time === t} onPress={() => setTime(t)} />
                  ))}
                </XStack>
              </YStack>

              <YStack>
                <Text fontFamily="$semibold" fontSize={15} color="$text">
                  Where
                </Text>
                <YStack mt={10}>
                  <Input
                    placeholder="e.g. Sea Point Promenade"
                    value={location}
                    onChangeText={setLocation}
                    onFocus={scrollToEnd}
                  />
                </YStack>
              </YStack>

              <YStack>
                <Text fontFamily="$semibold" fontSize={15} color="$text">
                  Note (optional)
                </Text>
                <YStack mt={10}>
                  <Input
                    placeholder="e.g. Coffee after?"
                    value={note}
                    onChangeText={setNote}
                    onFocus={scrollToEnd}
                  />
                </YStack>
              </YStack>

              <Button onPress={attachPlan} disabled={!planReady} icon="send">
                Send invite
              </Button>
            </YStack>
          ) : null}
        </ScrollView>

        {planning ? null : (
          <XStack
            items="center"
            gap={8}
            px={16}
            pt={10}
            borderTopWidth={1}
            borderTopColor="$border"
            bg="$card"
            style={{ paddingBottom: insets.bottom + 12 }}
          >
            <IconButton
              size={44}
              tone="accent"
              onPress={() => setPlanning(true)}
              accessibilityLabel="Plan a session"
            >
              <Icon name="calendar" size={20} color={colors.accentText} />
            </IconButton>
            <YStack flex={1}>
              <Input
                placeholder="Message"
                value={note}
                onChangeText={setNote}
                returnKeyType="send"
                onSubmitEditing={sendText}
                style={{
                  borderRadius: 22,
                  height: 44,
                  backgroundColor: colors.surface,
                  borderWidth: 0,
                }}
              />
            </YStack>
            <IconButton
              tone={note.trim() ? 'solid' : 'accent'}
              size={44}
              onPress={sendText}
              accessibilityLabel="Send"
            >
              <Icon
                name="send"
                size={18}
                color={note.trim() ? colors.onAccent : colors.accentText}
              />
            </IconButton>
          </XStack>
        )}
      </KeyboardAvoidingView>
    </YStack>
  );
}
