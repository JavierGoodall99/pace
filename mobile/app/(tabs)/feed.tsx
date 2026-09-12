import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../../src/components/Icon';
import { PhotoSlot } from '../../src/components/PhotoSlot';
import { athleteById, FEED_ITEMS } from '../../src/data/mockData';
import { colors, fonts } from '../../src/theme/tokens';

export default function FeedScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 24 }}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Activity</Text>
        <Text style={styles.subtitle}>Your training log and your matches&apos;, together.</Text>
      </View>

      <View style={styles.list}>
        {FEED_ITEMS.map((f) => {
          const who = f.athleteId === 'me' ? null : athleteById(f.athleteId);
          return (
            <View key={f.id} style={styles.card}>
              <View style={styles.cardHead}>
                <PhotoSlot label={f.who} shape="circle" style={styles.avatar} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.who}>{f.who}</Text>
                  <Text style={styles.time}>{f.time}</Text>
                </View>
                <Icon name={f.icon} size={14} color={colors.ember} />
                <Text style={styles.type}>{f.type}</Text>
              </View>
              <Text style={styles.stat}>{f.stat}</Text>
              {f.hasPhoto ? (
                <PhotoSlot label="Activity photo" shape="rect" style={styles.photo} />
              ) : null}
              <View style={styles.kudosRow}>
                <Icon name="heart" size={14} color={colors.fog} />
                <Text style={styles.kudos}>{f.kudos} KUDOS</Text>
              </View>
            </View>
          );
        })}
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
  list: { paddingHorizontal: 20, gap: 14 },
  card: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    backgroundColor: colors.ash,
    overflow: 'hidden',
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  avatar: { width: 32, height: 32 },
  who: { fontFamily: fonts.mono, fontSize: 11, color: colors.bone, letterSpacing: 0.5, textTransform: 'uppercase' },
  time: { fontFamily: fonts.mono, fontSize: 9, color: colors.fog, marginTop: 2 },
  type: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.5, color: colors.ember },
  stat: { paddingHorizontal: 16, paddingBottom: 12, fontSize: 13, color: colors.bone },
  photo: { width: '100%', height: 160, borderRadius: 0 },
  kudosRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 12 },
  kudos: { fontFamily: fonts.mono, fontSize: 11, color: colors.fog },
});
