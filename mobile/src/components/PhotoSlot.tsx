import React from 'react';
import { Image, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { Text, YStack } from 'tamagui';
import { colors } from '../theme/tokens';

// Stand-in for the design mockup's <image-slot>. Renders a real photo when
// a `source` is supplied (see `src/data/photos.ts`), falling back to a
// soft tile with the subject's initial otherwise.
interface PhotoSlotProps {
  label: string;
  shape?: 'rect' | 'circle' | 'rounded';
  radius?: number;
  source?: Image['props']['source'];
  style?: StyleProp<ViewStyle>;
}

const BASE_STYLE = {
  backgroundColor: colors.surface,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  overflow: 'hidden' as const,
};

export function PhotoSlot({
  label,
  shape = 'rounded',
  radius = 16,
  source,
  style,
}: PhotoSlotProps) {
  const initial = label.trim().charAt(0).toUpperCase() || '?';
  const shapeStyle: ViewStyle =
    shape === 'circle'
      ? { borderRadius: 9999 }
      : shape === 'rect'
        ? { borderRadius: 0 }
        : { borderRadius: radius };
  // Flatten so callers can pass style arrays — Tamagui on web can't take
  // nested arrays.
  const frame = StyleSheet.flatten([BASE_STYLE, shapeStyle, style]);

  if (source) {
    return (
      <YStack style={frame}>
        <Image source={source} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
      </YStack>
    );
  }

  return (
    <YStack style={frame}>
      <Text fontFamily="$bold" fontSize={24} color="$muted">
        {initial}
      </Text>
    </YStack>
  );
}
