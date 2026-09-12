import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { colors, fonts, radius } from '../theme/tokens';

// Small design-system components ported from
// `../_ds/pace-design-system-.../_ds_bundle.js` (Badge, Chip, Button,
// IconButton, Input).

export function Badge({
  children,
  tone = 'neutral',
  style,
}: {
  children: React.ReactNode;
  tone?: 'neutral' | 'accent';
  style?: ViewStyle;
}) {
  const accent = tone === 'accent';
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: accent ? colors.emberSoft : colors.coal,
          borderColor: accent ? colors.emberBorder : colors.line,
        },
        style,
      ]}
    >
      <Text style={[styles.badgeText, { color: accent ? colors.ember : colors.fog }]}>
        {children}
      </Text>
    </View>
  );
}

export function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? colors.ember : colors.coal,
          borderColor: selected ? colors.ember : colors.line,
        },
      ]}
    >
      <Text
        style={[
          styles.chipText,
          { color: selected ? colors.ink : colors.fog, fontWeight: selected ? '700' : '500' },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function Button({
  children,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'ghost';
  disabled?: boolean;
  style?: ViewStyle;
}) {
  const ghost = variant === 'ghost';
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: disabled ? colors.ash : ghost ? 'transparent' : colors.ember,
          borderWidth: ghost ? 1 : 0,
          borderColor: colors.line,
          opacity: pressed && !disabled ? 0.85 : 1,
        },
        style,
      ]}
    >
      <Text style={[styles.buttonText, { color: disabled ? colors.fog : ghost ? colors.fog : colors.ink }]}>
        {children}
      </Text>
    </Pressable>
  );
}

export function IconButton({
  children,
  onPress,
  tone = 'neutral',
  size = 44,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  tone?: 'neutral' | 'accent';
  size?: number;
}) {
  const accent = tone === 'accent';
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.iconButton,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: accent ? colors.emberSoft : colors.ash,
          borderColor: colors.line,
        },
      ]}
    >
      {children}
    </Pressable>
  );
}

export function Input({
  placeholder,
  value,
  onChangeText,
  style,
}: {
  placeholder?: string;
  value?: string;
  onChangeText?: (v: string) => void;
  style?: ViewStyle;
}) {
  return (
    <TextInput
      placeholder={placeholder}
      placeholderTextColor={colors.fog}
      value={value}
      onChangeText={onChangeText}
      style={[styles.input, style]}
    />
  );
}

export function SegmentedControl({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string | null;
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.segmentedRow}>
      {options.map((opt) => {
        const active = opt === value;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            style={[
              styles.segment,
              { backgroundColor: active ? colors.ember : colors.coal, borderColor: active ? colors.ember : colors.line },
            ]}
          >
            <Text style={[styles.segmentText, { color: active ? colors.ink : colors.fog, fontWeight: active ? '700' : '500' }]}>
              {opt}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function ProgressBar({ pct }: { pct: number }) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${clamped}%` }]} />
    </View>
  );
}

export function ScreenHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.heading}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const textStyle: TextStyle = {
  fontFamily: fonts.mono,
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  badgeText: {
    ...textStyle,
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  chip: {
    height: 44,
    paddingHorizontal: 18,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    ...textStyle,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  button: {
    height: 52,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  buttonText: {
    ...textStyle,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  input: {
    width: '100%',
    height: 48,
    backgroundColor: colors.coal,
    color: colors.bone,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.full,
    paddingHorizontal: 24,
    fontFamily: fonts.mono,
    fontSize: 14,
    letterSpacing: 1,
  },
  heading: {
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  eyebrow: {
    ...textStyle,
    fontSize: 10,
    letterSpacing: 4,
    color: colors.ember,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 32,
    color: colors.bone,
    textTransform: 'uppercase',
    lineHeight: 32,
    marginTop: 8,
  },
  subtitle: {
    color: colors.fog,
    fontSize: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  segmentedRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  segment: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  segmentText: {
    ...textStyle,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  progressTrack: {
    width: '100%',
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.line,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.ember,
    borderRadius: 2,
  },
});
