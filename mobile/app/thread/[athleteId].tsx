import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
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
} from '../../src/data/mockData';
import { ATHLETE_PHOTOS } from '../../src/data/photos';
import { colors, fonts } from '../../src/theme/tokens';

export default function ThreadScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { athleteId } = useLocalSearchParams<{ athleteId: string }>();
  const athlete = athleteById(Number(athleteId));

  const [messages, setMessages] = useState<ThreadMessage[]>(
    () => THREAD_MESSAGES[Number(athleteId)] ?? []
  );
  const [text, setText] = useState('');
  const [planning, setPlanning] = useState(false);
  const [activity, setActivity] = useState<Discipline>(athlete?.discipline ?? 'RUNNING');
  const [when, setWhen] = useState('');
  const [location, setLocation] = useState('');

  if (!athlete) {
    return (
      <View style={styles.screen}>
        <Text style={styles.missing}>Conversation not found.</Text>
      </View>
    );
  }

  const planReady = when.trim().length > 0 && location.trim().length > 0;

  const sendText = () => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { from: 'me', text: text.trim() }]);
    setText('');
  };

  const attachPlan = () => {
    if (!planReady) return;
    const plan: PlanCard = { activity, when: when.trim(), location: location.trim() };
    setMessages((prev) => [...prev, { from: 'me', text: text.trim(), plan }]);
    addSession(athlete.id, activity, plan.when, plan.location);
    setText('');
    setWhen('');
    setLocation('');
    setPlanning(false);
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

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.messages}>
        {messages.map((m, i) => {
          const mine = m.from === 'me';
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
                {m.plan ? (
                  <View
                    style={[
                      styles.planCard,
                      { marginTop: m.text ? 10 : 0 },
                    ]}
                  >
                    <View style={styles.planHeader}>
                      <Text style={styles.planActivity}>{m.plan.activity}</Text>
                      <Text style={styles.planStatus}>INVITE</Text>
                    </View>
                    <View style={styles.planRow}>
                      <Icon name="zap" size={12} color={colors.ember} />
                      <Text style={styles.planMeta}>{m.plan.when}</Text>
                    </View>
                    <View style={styles.planRow}>
                      <Icon name="map-pin" size={12} color={colors.ember} />
                      <Text style={styles.planMeta}>{m.plan.location}</Text>
                    </View>
                  </View>
                ) : null}
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={[styles.composer, { paddingBottom: insets.bottom + 16 }]}>
        {planning ? (
          <View style={styles.planForm}>
            <View style={styles.planFormHeader}>
              <Text style={styles.planFormLabel}>PLAN A SESSION</Text>
              <IconButton size={28} onPress={() => setPlanning(false)}>
                <Icon name="x" size={12} color={colors.fog} />
              </IconButton>
            </View>
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
            <View style={{ gap: 10 }}>
              <Input placeholder="WHEN · SAT 06:00" value={when} onChangeText={setWhen} />
              <Input placeholder="WHERE · SEA POINT PROMENADE" value={location} onChangeText={setLocation} />
            </View>
            <Button onPress={attachPlan} disabled={!planReady} style={{ marginTop: 4 }}>
              Send Invite
            </Button>
          </View>
        ) : null}

        <View style={styles.composerRow}>
          <View style={{ flex: 1 }}>
            <Input
              placeholder={planning ? 'ADD A NOTE (OPTIONAL)' : 'MESSAGE'}
              value={text}
              onChangeText={setText}
            />
          </View>
          <IconButton size={44} onPress={() => setPlanning((p) => !p)}>
            <Icon name="zap" size={14} color={planning ? colors.ember : colors.bone} />
          </IconButton>
          <IconButton tone="accent" size={48} onPress={planning ? attachPlan : sendText}>
            <Icon name="arrow-right" size={16} color={colors.ember} />
          </IconButton>
        </View>
      </View>
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
    color: colors.ember,
    fontWeight: '700',
  },
  planRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  planMeta: { fontSize: 11, color: colors.fog },
  composer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    gap: 10,
  },
  composerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  planForm: {
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: colors.coal,
    borderWidth: 1,
    borderColor: colors.line,
  },
  planFormHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  planFormLabel: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 2, color: colors.bone },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});