import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Icon } from './Icon';
import { colors, fonts } from '../theme/tokens';

// The stats cluster from the app's card mockup: a column of colored
// activity tiles on the left, a headline stat with a heartbeat line
// behind it in the middle, and a round heart button bottom-right.
// Shared by the Discover cards and the Activity feed cards.

const DISCIPLINE_ABBR: Record<string, string> = {
  RUNNING: 'RUN',
  CYCLING: 'RIDE',
  TRAIL: 'TRA',
  SWIMMING: 'SWM',
  CROSSFIT: 'CFX',
  CLIMBING: 'CLB',
  TRIATHLON: 'TRI',
};

const DISCIPLINE_COLOR: Record<string, string> = {
  RUNNING: '#f6c445',
  CYCLING: '#4fa3ff',
  TRAIL: '#6fbf73',
  SWIMMING: '#3fd0c9',
  CROSSFIT: '#ff7a45',
  CLIMBING: '#b78bff',
  TRIATHLON: '#ff5d73',
};

interface ActivityPanelProps {
  tags: string[];
  statLabel: string;
  statValue: string | number;
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
          {tags.slice(0, 3).map((t) => (
            <View key={t} style={[styles.tile, { backgroundColor: DISCIPLINE_COLOR[t] ?? colors.ember }]}>
              <Text style={styles.tileText}>{DISCIPLINE_ABBR[t] ?? t.slice(0, 3)}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.statBlock}>
        <Svg width={116} height={30} viewBox="0 0 116 30" style={styles.beat}>
          <Path
            d="M2 15h22l4-8 7 16 5-10 4 10 5-8h67"
            fill="none"
            stroke={colors.mint}
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
        <Text style={styles.statLabel}>{statLabel}</Text>
        <Text style={styles.statValue}>{statValue}</Text>
      </View>

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
    alignItems: 'flex-end',
  },
  tags: { gap: 4 },
  tile: {
    width: 30,
    height: 30,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileText: { fontFamily: fonts.monoBold, fontSize: 8.5, letterSpacing: 0.5, color: colors.ink },
  statBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 2,
  },
  beat: {
    position: 'absolute',
    top: 0,
    opacity: 0.45,
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