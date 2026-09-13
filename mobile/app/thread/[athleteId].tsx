import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import type { ScrollView as RNScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { Icon } from '../../src/components/Icon';
import { PhotoSlot } from '../../src/components/PhotoSlot';
import { Button, Chip, IconButton, Input } from '../../src/components/ui';
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
import { colors } from '../../src/theme/tokens';

const DAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

// Tapping instead of typing a time — the slots users most often train in.
const TIME_SLOTS = ['06:00', '07:00', '08:00', '12:00', '17:00', '18:00', '19:00', '20:00'];

// Next `count` days as tappable chips — TODAY / TOMORROW for the first
// two, then weekday + day number (e.g. SAT 19).
function upcomingDates(count: number): { key: string; label: string }[] {
  const now = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    if (i === 0) return { key: `d${i}`, label: 'TODAY' };
    if (i === 1) return { key: `d${i}`, label: 'TOMORROW' };
    return { key: `d${i}`, label: `${DAY_LABELS[d.getDay()]} ${d.getDate()}` };
  });
}

export default function ThreadScreen() {
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
      <YStack flex={1} bg="$ink">
        <Text color="$fog" text="center" mt={100}>
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
    <YStack flex={1} bg="$ink">
      <XStack
        items="center"
        gap={12}
        px={20}
        pb={12}
        pt={insets.top + 8}
        borderBottomWidth={1}
        borderBottomColor="$line"
      >
        <IconButton onPress={() => router.back()}>
          <Icon name="chevron-left" size={14} color={colors.bone} />
        </IconButton>
        <PhotoSlot
          label={athlete.name}
          shape="circle"
          source={ATHLETE_PHOTOS[athlete.slotId]}
          style={{ width: 36, height: 36 }}
        />
        <Text fontFamily="$mono" fontSize={13} letterSpacing={0.5} color="$bone" textTransform="uppercase">
          {athlete.name}
        </Text>
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
            const statusColor =
              plan?.status === 'CONFIRMED'
                ? colors.mint
                : plan?.status === 'DECLINED'
                  ? colors.fog
                  : colors.ember;
            return (
              <YStack key={i} items={mine ? 'flex-end' : 'flex-start'}>
                <YStack
                  bg={mine ? '$ember' : '$ash'}
                  maxW="78%"
                  px={16}
                  py={12}
                  rounded={18}
                >
                  {m.text ? (
                    <Text color={mine ? '$ink' : '$bone'} fontSize={13} lineHeight={18}>
                      {m.text}
                    </Text>
                  ) : null}
                  {plan ? (
                    <YStack
                      minW={180}
                      gap={6}
                      p={12}
                      rounded={14}
                      bg="$ink"
                      borderWidth={1}
                      borderColor="$emberBorder"
                      mt={m.text ? 10 : 0}
                    >
                      <XStack items="center" justify="space-between">
                        <Text fontFamily="$display" fontSize={15} letterSpacing={0.5} color="$bone" textTransform="uppercase">
                          {plan.activity}
                        </Text>
                        <Text fontFamily="$mono" fontSize={9} letterSpacing={1.5} fontWeight="700" color={statusColor}>
                          {plan.status}
                        </Text>
                      </XStack>
                      <XStack items="center" gap={6}>
                        <Icon name="zap" size={12} color={colors.ember} />
                        <Text fontSize={11} color="$fog">
                          {plan.when}
                        </Text>
                      </XStack>
                      <XStack items="center" gap={6}>
                        <Icon name="map-pin" size={12} color={colors.ember} />
                        <Text fontSize={11} color="$fog">
                          {plan.location}
                        </Text>
                      </XStack>
                      {!mine && plan.status === 'INVITE' ? (
                        <XStack gap={8} mt={10}>
                          <XStack
                            flex={1}
                            height={36}
                            rounded="$full"
                            borderWidth={1}
                            items="center"
                            justify="center"
                            bg="$emberSoft"
                            borderColor="$emberBorder"
                            onPress={() => respondTo(i, 'CONFIRMED')}
                          >
                            <Text fontFamily="$mono" fontSize={10} letterSpacing={1.5} fontWeight="700" color="$ember">
                              ACCEPT
                            </Text>
                          </XStack>
                          <XStack
                            flex={1}
                            height={36}
                            rounded="$full"
                            borderWidth={1}
                            items="center"
                            justify="center"
                            bg="$coal"
                            borderColor="$line"
                            onPress={() => respondTo(i, 'DECLINED')}
                          >
                            <Text fontFamily="$mono" fontSize={10} letterSpacing={1.5} fontWeight="700" color="$fog">
                              DECLINE
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
            <YStack gap={16} p={14} rounded={16} bg="$coal" borderWidth={1} borderColor="$line">
              <XStack items="center" justify="space-between">
                <Text fontFamily="$mono" fontSize={10} letterSpacing={2} color="$bone">
                  PLAN A SESSION
                </Text>
                <IconButton size={28} onPress={() => setPlanning(false)}>
                  <Icon name="x" size={12} color={colors.fog} />
                </IconButton>
              </XStack>

              <YStack>
                <Text fontFamily="$mono" fontSize={10} letterSpacing={2} color="$fog">
                  ACTIVITY
                </Text>
                <XStack flexWrap="wrap" gap={8} mt={8}>
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
                <Text fontFamily="$mono" fontSize={10} letterSpacing={2} color="$fog">
                  DATE
                </Text>
                <XStack flexWrap="wrap" gap={8} mt={8}>
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
                <Text fontFamily="$mono" fontSize={10} letterSpacing={2} color="$fog">
                  TIME
                </Text>
                <XStack flexWrap="wrap" gap={8} mt={8}>
                  {TIME_SLOTS.map((t) => (
                    <Chip
                      key={t}
                      label={t}
                      selected={time === t}
                      onPress={() => setTime(t)}
                    />
                  ))}
                </XStack>
              </YStack>

              <YStack>
                <Text fontFamily="$mono" fontSize={10} letterSpacing={2} color="$fog">
                  WHERE
                </Text>
                <YStack mt={8}>
                  <Input
                    placeholder="SEA POINT PROMENADE"
                    value={location}
                    onChangeText={setLocation}
                    onFocus={scrollToEnd}
                  />
                </YStack>
              </YStack>

              <YStack>
                <Text fontFamily="$mono" fontSize={10} letterSpacing={2} color="$fog">
                  NOTE (OPTIONAL)
                </Text>
                <YStack mt={8}>
                  <Input
                    placeholder="BRING WATER · COFFEE AFTER"
                    value={note}
                    onChangeText={setNote}
                    onFocus={scrollToEnd}
                  />
                </YStack>
              </YStack>

              <Button onPress={attachPlan} disabled={!planReady} style={{ marginTop: 4 }}>
                Send Invite
              </Button>
            </YStack>
          ) : null}
        </ScrollView>

        {planning ? null : (
          <XStack
            items="center"
            gap={10}
            px={20}
            pt={12}
            borderTopWidth={1}
            borderTopColor="$line"
            style={{ paddingBottom: insets.bottom + 16 }}
          >
            <YStack flex={1}>
              <Input placeholder="MESSAGE" value={note} onChangeText={setNote} />
            </YStack>
            <IconButton size={44} onPress={() => setPlanning(true)}>
              <Icon name="zap" size={14} color={colors.bone} />
            </IconButton>
            <IconButton tone="accent" size={48} onPress={sendText}>
              <Icon name="arrow-right" size={16} color={colors.ember} />
            </IconButton>
          </XStack>
        )}
      </KeyboardAvoidingView>
    </YStack>
  );
}