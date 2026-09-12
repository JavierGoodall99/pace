import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../src/components/Icon';
import { PhotoSlot } from '../src/components/PhotoSlot';
import { IconButton } from '../src/components/ui';
import { athleteById, AppNotification, NOTIFICATIONS } from '../src/data/mockData';
import { ATHLETE_PHOTOS } from '../src/data/photos';
import { colors, fonts } from '../src/theme/tokens';

const GROUPS: AppNotification['group'][] = ['TODAY', 'EARLIER'];

function routeFor(n: AppNotification): Href {
  switch (n.kind) {
    case 'message':
      return { pathname: '/thread/[athleteId]', params: { athleteId: String(n.athleteId) } };
    case 'match':
      return { pathname: '/match/[athleteId]', params: { athleteId: String(n.athleteId) } };
    default:
      return { pathname: '/athlete/[id]', params: { id: String(n.athleteId) } };
  }
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [unread, setUnread] = useState<Record<number, boolean>>(
    Object.fromEntries(NOTIFICATIONS.filter((n) => n.unread).map((n) => [n.id, true]))
  );

  const unreadCount = Object.keys(unread).length;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 }}
    >
      <View style={styles.header}>
        <IconButton size={40} onPress={() => router.back()}>
          <Icon name="chevron-left" size={14} color={colors.bone} />
        </IconButton>
        <Text style={styles.title}>Notifications</Text>
        {unreadCount > 0 ? (
          <Pressable style={styles.markAll} onPress={() => setUnread({})} hitSlop={8}>
            <Text style={styles.markAllText}>MARK ALL READ</Text>
          </Pressable>
        ) : null}
      </View>

      {unreadCount > 0 ? (
        <View style={styles.summaryRow}>
          <View style={styles.summaryDot} />
          <Text style={styles.summaryText}>
            {unreadCount} new update{unreadCount === 1 ? '' : 's'}
          </Text>
        </View>
      ) : null}

      {GROUPS.map((group) => {
        const items = NOTIFICATIONS.filter((n) => n.group === group);
        if (items.length === 0) return null;
        return (
          <View key={group}>
            <Text style={styles.groupLabel}>{group}</Text>
            <View style={styles.group}>
              {items.map((n, i) => {
                const a = athleteById(n.athleteId);
                if (!a) return null;
                const isUnread = !!unread[n.id];
                return (
                  <Pressable
                    key={n.id}
                    style={({ pressed }) => [
                      styles.row,
                      i === items.length - 1 ? styles.lastRow : undefined,
                      pressed ? styles.rowPressed : undefined,
                    ]}
                    onPress={() => {
                      if (isUnread) {
                        setUnread((prev) => ({ ...prev, [n.id]: false }));
                      }
                      router.push(routeFor(n));
                    }}
                  >
                    <PhotoSlot label={a.name} shape="circle" source={ATHLETE_PHOTOS[a.slotId]} style={styles.avatar} />
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={styles.rowText} numberOfLines={2}>
                        <Text style={styles.rowName}>{a.name}</Text>
                        <Text style={{ color: colors.fog }}> {n.text}</Text>
                      </Text>
                    </View>
                    <View style={styles.rowRight}>
                      <Text style={styles.rowTime}>{n.time}</Text>
                      {isUnread ? <View style={styles.dot} /> : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      })}
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
    paddingBottom: 10,
  },
  title: {
    flex: 1,
    fontFamily: fonts.display,
    fontSize: 30,
    color: colors.bone,
    textTransform: 'uppercase',
    lineHeight: 30,
  },
  markAll: { paddingVertical: 4 },
  markAllText: { fontFamily: fonts.mono, fontSize: 9, letterSpacing: 1.5, color: colors.ember },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 6,
  },
  summaryDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.ember },
  summaryText: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.5, color: colors.fog, textTransform: 'uppercase' },
  groupLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 3,
    color: colors.ember,
    marginHorizontal: 20,
    marginTop: 18,
    marginBottom: 10,
  },
  group: {
    marginHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.ash,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  rowPressed: { opacity: 0.7 },
  lastRow: { borderBottomWidth: 0 },
  avatar: { width: 44, height: 44 },
  rowText: { fontSize: 13, lineHeight: 18 },
  rowName: { fontFamily: fonts.monoBold, fontSize: 12, letterSpacing: 0.5, color: colors.bone, textTransform: 'uppercase' },
  rowRight: { alignItems: 'flex-end', gap: 8 },
  rowTime: { fontFamily: fonts.mono, fontSize: 10, color: colors.fog },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.ember },
});