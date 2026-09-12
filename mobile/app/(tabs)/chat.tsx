import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../../src/components/Icon';
import { PhotoSlot } from '../../src/components/PhotoSlot';
import { IconButton } from '../../src/components/ui';
import { athleteById, CHAT_THREADS } from '../../src/data/mockData';
import { ATHLETE_PHOTOS } from '../../src/data/photos';
import { colors, fonts } from '../../src/theme/tokens';

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 24 }}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Chat</Text>
        <View style={{ flex: 1 }} />
        <IconButton size={40} onPress={() => router.push('/notifications')}>
          <Icon name="bell" size={16} color={colors.bone} />
        </IconButton>
      </View>

      <View style={styles.list}>
        {CHAT_THREADS.map((t) => {
          const a = athleteById(t.athleteId);
          if (!a) return null;
          return (
            <Pressable
              key={t.id}
              style={styles.row}
              onPress={() =>
                router.push({ pathname: '/thread/[athleteId]', params: { athleteId: String(a.id) } })
              }
            >
              <PhotoSlot
                label={a.name}
                shape="circle"
                source={ATHLETE_PHOTOS[a.slotId]}
                style={styles.avatar}
              />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.name}>{a.name}</Text>
                <Text style={styles.lastMsg} numberOfLines={1}>
                  {t.lastMsg}
                </Text>
              </View>
              <View style={styles.right}>
                <Text style={styles.time}>{t.time}</Text>
                {t.unread ? <View style={styles.dot} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 32,
    color: colors.bone,
    textTransform: 'uppercase',
    lineHeight: 32,
  },
  list: { paddingHorizontal: 20, paddingTop: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  avatar: { width: 52, height: 52 },
  name: { fontFamily: fonts.mono, fontSize: 12, color: colors.bone, letterSpacing: 0.5, textTransform: 'uppercase' },
  lastMsg: { fontSize: 12, color: colors.fog, marginTop: 4 },
  right: { alignItems: 'flex-end' },
  time: { fontFamily: fonts.mono, fontSize: 10, color: colors.fog },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.ember, marginTop: 6 },
});
