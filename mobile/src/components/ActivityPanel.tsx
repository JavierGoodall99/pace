import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from './Icon';
import { colors, fonts, radius } from '../theme/tokens';

// The stats cluster from the app's card mockup: a row of activity
// tiles on the left and a round heart button on the right. When a
// stat is provided (kudos on feed cards) it sits between the tiles
// and the heart. Shared by the Discover cards and the Activity feed
// cards.
//
// Tiles follow the app's Badge/Chip neutral-vs-accent language rather
// than per-discipline hues, so the panel reads as one design system
// with the rest of the app: the athlete's primary discipline (first
// tag) gets the ember accent treatment, the rest stay neutral.

const DISCIPLINE_ABBR: Record<string, string> = {
  RUNNING: 'RUN',
  CYCLING: 'RIDE',
  TRAIL: 'TRA',
  SWIMMING: 'SWM',
  CROSSFIT: 'CFX',
  CLIMBING: 'CLB',
  TRIATHLON: 'TRI',
};

interface ActivityPanelProps {
  tags: string[];
  statLabel?: string;
  statValue?: string | number;
  liked?: boolean;
  onLike: () => void;
  likeLabel?: string;
}

export function ActivityPanel({
  tags,
  statLabel,
  statValue,
  liked = false,
  onLike,
  likeLabel = 'Like',
}: ActivityPanelProps) {
  return (
    <View style={styles.row}>
      {tags.length > 0 ? (
        <View style={styles.tags}>
          {tags.slice(0, 3).map((t, i) => {
            const accent = i === 0;
            return (
              <View
                key={t}
                style={[
                  styles.tile,
                  {
                    backgroundColor: accent ? colors.emberSoft : colors.coal,
                    borderColor: accent ? colors.emberBorder : colors.line,
                  },
                ]}
              >
                <Text style={[styles.tileText, { color: accent ? colors.ember : colors.bone }]}>
                  {DISCIPLINE_ABBR[t] ?? t.slice(0, 3)}
                </Text>
              </View>
            );
          })}
        </View>
      ) : null}

      {statValue != null ? (
        <View style={styles.statBlock}>
          <Text style={styles.statLabel}>{statLabel}</Text>
          <Text style={styles.statValue}>{statValue}</Text>
        </View>
      ) : null}

      <View style={styles.spacer} />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={likeLabel}
        onPress={onLike}
        hitSlop={6}
        style={({ pressed }) => [
          styles.heart,
          liked ? styles.heartLiked : null,
          pressed ? styles.heartPressed : null,
        ]}
      >
        <Icon name="heart" size={20} color={colors.ink} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tags: { flexDirection: 'row', gap: 6 },
  tile: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileText: { fontFamily: fonts.monoBold, fontSize: 12, letterSpacing: 1 },
  spacer: { flex: 1 },
  statBlock: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  statLabel: { fontFamily: fonts.mono, fontSize: 8, letterSpacing: 1.5, color: colors.fog },
  statValue: {
    fontFamily: fonts.display,
    fontSize: 34,
    lineHeight: 38,
    color: colors.bone,
    marginTop: 2,
  },
  heart: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.bone,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  heartLiked: { backgroundColor: colors.ember },
  heartPressed: { transform: [{ scale: 0.9 }] },
});