import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PhotoSlot } from '../../src/components/PhotoSlot';
import { Badge, Button, Chip, Input } from '../../src/components/ui';
import {
  athleteById,
  DISCIPLINES,
  Discipline,
  PLANNER_PARTNER_IDS,
  SESSIONS,
} from '../../src/data/mockData';
import { colors, fonts } from '../../src/theme/tokens';

export default function PlannerScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ partnerId?: string }>();

  const [discipline, setDiscipline] = useState<Discipline>('CROSSFIT');
  const [partnerId, setPartnerId] = useState<number>(5);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (params.partnerId) {
      const id = Number(params.partnerId);
      if (!Number.isNaN(id)) {
        setPartnerId(id);
        setSent(false);
      }
    }
  }, [params.partnerId]);

  const partner = athleteById(partnerId);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 24 }}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Planner</Text>
        <Text style={styles.subtitle}>
          Turn a match into a session. Pick a sport, time and place.
        </Text>
      </View>

      {sent ? (
        <View style={styles.sentBanner}>
          <Text style={styles.sentTitle}>Invite Sent</Text>
          <Text style={styles.sentBody}>
            {partner?.name ?? 'They'} will get your session invite. You&apos;ll be notified when
            they respond.
          </Text>
        </View>
      ) : null}

      <View style={styles.form}>
        <View>
          <Text style={styles.label}>ACTIVITY</Text>
          <View style={styles.chipWrap}>
            {DISCIPLINES.map((d) => (
              <Chip key={d} label={d} selected={d === discipline} onPress={() => setDiscipline(d)} />
            ))}
          </View>
        </View>

        <View>
          <Text style={styles.label}>WITH</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            {PLANNER_PARTNER_IDS.map((id) => {
              const a = athleteById(id);
              if (!a) return null;
              const active = id === partnerId;
              return (
                <Pressable
                  key={id}
                  onPress={() => {
                    setPartnerId(id);
                    setSent(false);
                  }}
                  style={styles.partner}
                >
                  <PhotoSlot
                    label={a.name}
                    shape="circle"
                    style={[
                      styles.partnerAvatar,
                      { borderWidth: 2, borderColor: active ? colors.ember : colors.line },
                    ]}
                  />
                  <Text style={[styles.partnerName, { color: active ? colors.ember : colors.fog }]}>
                    {a.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View>
          <Text style={styles.label}>WHEN</Text>
          <View style={{ marginTop: 8 }}>
            <Input placeholder="SAT · 06:00" />
          </View>
        </View>

        <View>
          <Text style={styles.label}>WHERE</Text>
          <View style={{ marginTop: 8 }}>
            <Input placeholder="SEA POINT PROMENADE" />
          </View>
        </View>

        <Button onPress={() => setSent(true)} style={{ width: '100%', marginTop: 4 }}>
          Send Invite
        </Button>
      </View>

      <View style={styles.upcoming}>
        <Text style={styles.upcomingLabel}>UPCOMING SESSIONS</Text>
        <View style={{ gap: 10, marginTop: 12 }}>
          {SESSIONS.map((s) => {
            const a = athleteById(s.athleteId);
            return (
              <View key={s.id} style={styles.sessionRow}>
                <View>
                  <Text style={styles.sessionTitle}>
                    {s.activity} · {a?.name}
                  </Text>
                  <Text style={styles.sessionMeta}>
                    {s.when} · {s.location}
                  </Text>
                </View>
                <Badge tone={s.status === 'CONFIRMED' ? 'accent' : 'neutral'}>{s.status}</Badge>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink },
  header: { paddingHorizontal: 20, paddingBottom: 4 },
  title: {
    fontFamily: fonts.display,
    fontSize: 32,
    color: colors.bone,
    textTransform: 'uppercase',
    lineHeight: 32,
  },
  subtitle: { color: colors.fog, fontSize: 12, marginTop: 8, marginBottom: 16 },
  sentBanner: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 18,
    borderRadius: 16,
    backgroundColor: colors.emberSoft,
    borderWidth: 1,
    borderColor: colors.emberBorder,
  },
  sentTitle: { fontFamily: fonts.display, fontSize: 16, color: colors.bone, textTransform: 'uppercase' },
  sentBody: { fontSize: 12, color: colors.fog, marginTop: 6 },
  form: { paddingHorizontal: 20, gap: 18 },
  label: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 2, color: colors.bone },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  partner: { alignItems: 'center', gap: 6 },
  partnerAvatar: { width: 52, height: 52 },
  partnerName: { fontFamily: fonts.mono, fontSize: 9 },
  upcoming: { paddingHorizontal: 20, paddingTop: 28 },
  upcomingLabel: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 2, color: colors.fog },
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.ash,
  },
  sessionTitle: { fontFamily: fonts.mono, fontSize: 12, color: colors.bone, letterSpacing: 0.5 },
  sessionMeta: { fontSize: 12, color: colors.fog, marginTop: 4 },
});
