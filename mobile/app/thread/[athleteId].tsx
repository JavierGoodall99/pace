import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../../src/components/Icon';
import { PhotoSlot } from '../../src/components/PhotoSlot';
import { IconButton, Input } from '../../src/components/ui';
import { athleteById, THREAD_MESSAGES } from '../../src/data/mockData';
import { ATHLETE_PHOTOS } from '../../src/data/photos';
import { colors, fonts } from '../../src/theme/tokens';

export default function ThreadScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { athleteId } = useLocalSearchParams<{ athleteId: string }>();
  const athlete = athleteById(Number(athleteId));
  const messages = athlete ? THREAD_MESSAGES[athlete.id] ?? [] : [];

  if (!athlete) {
    return (
      <View style={styles.screen}>
        <Text style={styles.missing}>Conversation not found.</Text>
      </View>
    );
  }

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
                <Text style={{ color: mine ? colors.ink : colors.bone, fontSize: 13, lineHeight: 18 }}>
                  {m.text}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={[styles.composer, { paddingBottom: insets.bottom + 16 }]}>
        <View style={{ flex: 1 }}>
          <Input placeholder="MESSAGE" />
        </View>
        <IconButton tone="accent" size={48}>
          <Icon name="arrow-right" size={16} color={colors.ember} />
        </IconButton>
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
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
});
