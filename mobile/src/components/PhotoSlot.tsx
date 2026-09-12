import React from 'react';
import { Image, ImageSourcePropType, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, fonts } from '../theme/tokens';

// Stand-in for the design mockup's <image-slot>. Renders a real photo when
// a `source` is supplied (see `src/data/photos.ts`), falling back to a
// grayscale-styled tile with the subject's initial otherwise.
interface PhotoSlotProps {
  label: string;
  shape?: 'rect' | 'circle' | 'rounded';
  radius?: number;
  source?: ImageSourcePropType;
  style?: StyleProp<ViewStyle>;
}

export function PhotoSlot({ label, shape = 'rounded', radius = 16, source, style }: PhotoSlotProps) {
  const initial = label.trim().charAt(0).toUpperCase() || '?';
  const shapeStyle: ViewStyle =
    shape === 'circle'
      ? { borderRadius: 9999 }
      : shape === 'rect'
      ? { borderRadius: 0 }
      : { borderRadius: radius };

  if (source) {
    return (
      <View style={[styles.base, shapeStyle, style]}>
        <Image source={source} style={styles.image} resizeMode="cover" />
      </View>
    );
  }

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
  image: {
    width: '100%',
    height: '100%',
  },
});
