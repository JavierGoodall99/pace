import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { colors, fonts, radius } from '../../src/theme/tokens';

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
  const scrollRef = useRef<ScrollView>(null);

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
      <View style={styles.screen}>
        <Text style={styles.missing}>Conversation not found.</Text>
      </View>
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
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <IconButton onPress={() => router.back()}>
          <Icon name="chevron-left" size={14} color={colors.bone} />
        </IconButton>
        <PhotoSlot
          label={athlete.name}
          shape="circle"
          source={ATHLETE_PHOTOS[athlete.slotId]}
          style={styles.avatar}
        />
        <Text style={styles.name}>{athlete.name}</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={[
            styles.messages,
            { paddingBottom: planning ? insets.bottom + 24 : 24 },
          ]}
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
              <View key={i} style={{ alignItems: mine ? 'flex-end' : 'flex-start' }}>
                <View
                  style={[
                    styles.bubble,
                    { backgroundColor: mine ? colors.ember : colors.ash },
                  ]}
                >
                  {m.text ? (
                    <Text style={{ color: mine ? colors.ink : colors.bone, fontSize: 13, lineHeight: 18 }}>
                      {m.text}
                    </Text>
                  ) : null}
                  {plan ? (
                    <View style={[styles.planCard, { marginTop: m.text ? 10 : 0 }]}>
                      <View style={styles.planHeader}>
                        <Text style={styles.planActivity}>{plan.activity}</Text>
                        <Text style={[styles.planStatus, { color: statusColor }]}>{plan.status}</Text>
                      </View>
                      <View style={styles.planRow}>
                        <Icon name="zap" size={12} color={colors.ember} />
                        <Text style={styles.planMeta}>{plan.when}</Text>
                      </View>
                      <View style={styles.planRow}>
                        <Icon name="map-pin" size={12} color={colors.ember} />
                        <Text style={styles.planMeta}>{plan.location}</Text>
                      </View>
                      {!mine && plan.status === 'INVITE' ? (
                        <View style={styles.planActions}>
                          <Pressable
                            style={[
                              styles.planAction,
                              { backgroundColor: colors.emberSoft, borderColor: colors.emberBorder },
                            ]}
                            onPress={() => respondTo(i, 'CONFIRMED')}
                          >
                            <Text style={[styles.planActionText, { color: colors.ember }]}>ACCEPT</Text>
                          </Pressable>
                          <Pressable
                            style={[
                              styles.planAction,
                              { backgroundColor: colors.coal, borderColor: colors.line },
                            ]}
                            onPress={() => respondTo(i, 'DECLINED')}
                          >
                            <Text style={[styles.planActionText, { color: colors.fog }]}>DECLINE</Text>
                          </Pressable>
                        </View>
                      ) : null}
                    </View>
                  ) : null}
                </View>
              </View>
            );
          })}

          {planning ? (
            <View style={styles.planForm}>
              <View style={styles.planFormHeader}>
                <Text style={styles.planFormLabel}>PLAN A SESSION</Text>
                <IconButton size={28} onPress={() => setPlanning(false)}>
                  <Icon name="x" size={12} color={colors.fog} />
                </IconButton>
              </View>

              <View>
                <Text style={styles.fieldLabel}>ACTIVITY</Text>
                <View style={styles.chipWrap}>
                  {DISCIPLINES.map((d) => (
                    <Chip
                      key={d}
                      label={d}
                      selected={d === activity}
                      onPress={() => setActivity(d)}
                    />
                  ))}
                </View>
              </View>

              <View>
                <Text style={styles.fieldLabel}>DATE</Text>
                <View style={styles.chipWrap}>
                  {dates.map((d) => (
                    <Chip
                      key={d.key}
                      label={d.label}
                      selected={date?.key === d.key}
                      onPress={() => setDate(d)}
                    />
                  ))}
                </View>
              </View>

              <View>
                <Text style={styles.fieldLabel}>TIME</Text>
                <View style={styles.chipWrap}>
                  {TIME_SLOTS.map((t) => (
                    <Chip
                      key={t}
                      label={t}
                      selected={time === t}
                      onPress={() => setTime(t)}
                    />
                  ))}
                </View>
              </View>

              <View>
                <Text style={styles.fieldLabel}>WHERE</Text>
                <View style={{ marginTop: 8 }}>
                  <Input
                    placeholder="SEA POINT PROMENADE"
                    value={location}
                    onChangeText={setLocation}
                    onFocus={scrollToEnd}
                  />
                </View>
              </View>

              <View>
                <Text style={styles.fieldLabel}>NOTE (OPTIONAL)</Text>
                <View style={{ marginTop: 8 }}>
                  <Input
                    placeholder="BRING WATER · COFFEE AFTER"
                    value={note}
                    onChangeText={setNote}
                    onFocus={scrollToEnd}
                  />
                </View>
              </View>

              <Button onPress={attachPlan} disabled={!planReady} style={{ marginTop: 4 }}>
                Send Invite
              </Button>
            </View>
          ) : null}
        </ScrollView>

        {planning ? null : (
          <View style={[styles.composer, { paddingBottom: insets.bottom + 16 }]}>
            <View style={{ flex: 1 }}>
              <Input placeholder="MESSAGE" value={note} onChangeText={setNote} />
            </View>
            <IconButton size={44} onPress={() => setPlanning(true)}>
              <Icon name="zap" size={14} color={colors.bone} />
            </IconButton>
            <IconButton tone="accent" size={48} onPress={sendText}>
              <Icon name="arrow-right" size={16} color={colors.ember} />
            </IconButton>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink },
  missing: { color: colors.fog, textAlign: 'center', marginTop: 100 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  avatar: { width: 36, height: 36 },
  name: { fontFamily: fonts.mono, fontSize: 13, letterSpacing: 0.5, color: colors.bone, textTransform: 'uppercase' },
  messages: { padding: 20, gap: 10 },
  bubble: { maxWidth: '78%', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 18 },
  planCard: {
    minWidth: 180,
    gap: 6,
    padding: 12,
    borderRadius: 14,
    backgroundColor: colors.ink,
    borderWidth: 1,
    borderColor: colors.emberBorder,
  },
  planHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  planActivity: {
    fontFamily: fonts.display,
    fontSize: 15,
    letterSpacing: 0.5,
    color: colors.bone,
    textTransform: 'uppercase',
  },
  planStatus: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  planRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  planMeta: { fontSize: 11, color: colors.fog },
  planActions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  planAction: {
    flex: 1,
    height: 36,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planActionText: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.5, fontWeight: '700' },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  planForm: {
    gap: 16,
    padding: 14,
    borderRadius: 16,
    backgroundColor: colors.coal,
    borderWidth: 1,
    borderColor: colors.line,
  },
  planFormHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  planFormLabel: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 2, color: colors.bone },
  fieldLabel: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 2, color: colors.fog },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
});