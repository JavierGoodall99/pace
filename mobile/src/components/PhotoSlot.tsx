import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, fonts } from '../theme/tokens';

// Stand-in for the design mockup's <image-slot> — a real app would wire
// this up to actual athlete photos. Renders a grayscale-styled tile with
// the subject's initial so every screen still reads correctly without
// photo assets.
interface PhotoSlotProps {
  label: string;
  shape?: 'rect' | 'circle' | 'rounded';
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

export function PhotoSlot({ label, shape = 'rounded', radius = 16, style }: PhotoSlotProps) {
  const initial = label.trim().charAt(0).toUpperCase() || '?';
  const shapeStyle: ViewStyle =
    shape === 'circle'
      ? { borderRadius: 9999 }
      : shape === 'rect'
      ? { borderRadius: 0 }
      : { borderRadius: radius };

  return (
    <View style={[styles.base, shapeStyle, style]}>
      <Text style={styles.initial}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.ash,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initial: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.fog,
  },
});
