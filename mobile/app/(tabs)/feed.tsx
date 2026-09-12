import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActivityPanel } from '../../src/components/ActivityPanel';
import { PhotoSlot } from '../../src/components/PhotoSlot';
import { athleteById, Discipline, FEED_ITEMS, tagsForDiscipline } from '../../src/data/mockData';
import { ACTIVITY_PHOTO, ATHLETE_PHOTOS, ME_AVATAR } from '../../src/data/photos';
import { colors, fonts } from '../../src/theme/tokens';

// Feed post types map onto the discipline vocabulary so the stats
// panel's activity tiles stay consistent with the Discover cards.
const TYPE_DISCIPLINE: Record<string, Discipline> = {
  RUN: 'RUNNING',
  CROSSFIT: 'CROSSFIT',
  CLIMB: 'CLIMBING',
  'TRI BRICK': 'TRIATHLON',
};

export default function FeedScreen() {
  const insets = useSafeAreaInsets();
  const [liked, setLiked] = useState<Record<number, boolean>>({});

  function toggleLike(id: number) {
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));
  }

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
          const photo = f.hasPhoto ? ACTIVITY_PHOTO : who ? ATHLETE_PHOTOS[who.slotId] : ME_AVATAR;
          const discipline = TYPE_DISCIPLINE[f.type];

          return (
            <View key={f.id} style={styles.card}>
              <PhotoSlot label={who ? who.name : 'You'} shape="rect" source={photo} style={styles.photo} />
              <View style={styles.panel}>
                <View style={styles.identity}>
                  <Text style={styles.who}>{f.who}</Text>
                  <Text style={styles.time}>{f.time}</Text>
                </View>
                <Text style={styles.statLine}>{f.stat}</Text>
                <ActivityPanel
                  tags={discipline ? tagsForDiscipline(discipline) : []}
                  statLabel="KUDOS"
                  statValue={f.kudos + (liked[f.id] ? 1 : 0)}
                  liked={!!liked[f.id]}
                  onLike={() => toggleLike(f.id)}
                  likeLabel={`Kudos ${f.who}`}
                />
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
    borderRadius: 24,
    backgroundColor: colors.ash,
    overflow: 'hidden',
  },
  photo: { width: '100%', height: 230, borderRadius: 0 },
  panel: {
    backgroundColor: colors.coal,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  who: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.bone,
    textTransform: 'uppercase',
    lineHeight: 18,
  },
  time: { fontFamily: fonts.mono, fontSize: 8.5, letterSpacing: 1, color: colors.fog },
  statLine: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 0.5, color: colors.fog, marginTop: 6, marginBottom: 10 },
});