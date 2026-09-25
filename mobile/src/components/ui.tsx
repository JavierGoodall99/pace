import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Input as TInput, Text, XStack, YStack } from 'tamagui';
import { Icon, IconName } from './Icon';
import { colors, formatLabel, shadow } from '../theme/tokens';

// The app's small design system, built on Tamagui primitives so every
// screen shares one styling vocabulary. Note: this Tamagui config sets
// `onlyAllowShorthands`, so props like `bg`, `px`, `rounded` are used
// instead of the RN longhands.
//
// Type scale (Plus Jakarta Sans):
//   Title      $bold 28/34      — screen titles
//   Section    $semibold 17/24  — section headings inside a screen
//   Body       $body 15/22      — paragraphs, list subtitles
//   Label      $medium 13/18    — captions, meta, timestamps
// Everything is sentence case; no tracked-out capitals.

export function Badge({
  children,
  tone = 'neutral',
  icon,
  style,
}: {
  children: React.ReactNode;
  tone?: 'neutral' | 'accent' | 'success';
  icon?: IconName;
  style?: ViewStyle;
}) {
  const fg = tone === 'accent' ? '$accent' : tone === 'success' ? '$success' : '$text';
  const bg = tone === 'accent' ? '$accentSoft' : tone === 'success' ? '$successSoft' : '$surface';
  const iconColor =
    tone === 'accent' ? colors.accent : tone === 'success' ? colors.success : colors.muted;
  return (
    <XStack items="center" gap={5} rounded="$full" px={12} py={6} bg={bg} style={style}>
      {icon ? <Icon name={icon} size={13} color={iconColor} strokeWidth={2} /> : null}
      <Text fontFamily="$semibold" fontSize={13} lineHeight={16} color={fg}>
        {typeof children === 'string' ? formatLabel(children) : children}
      </Text>
    </XStack>
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
  const active = !!selected;
  return (
    <XStack
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      pressStyle={{ opacity: 0.8 }}
      height={40}
      px={16}
      rounded="$full"
      borderWidth={1}
      items="center"
      justify="center"
      bg={active ? '$accent' : '$card'}
      borderColor={active ? '$accent' : '$border'}
    >
      <Text fontFamily="$semibold" fontSize={14} color={active ? '$onAccent' : '$text'}>
        {formatLabel(label)}
      </Text>
    </XStack>
  );
}

export function Button({
  children,
  onPress,
  variant = 'primary',
  disabled = false,
  icon,
  style,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  // primary: filled accent. secondary: quiet filled. ghost: outlined.
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  icon?: IconName;
  style?: ViewStyle;
}) {
  const primary = variant === 'primary';
  const bg = disabled
    ? '$surface'
    : primary
      ? '$accent'
      : variant === 'secondary'
        ? '$surface'
        : 'transparent';
  const fg = disabled ? '$muted' : primary ? '$onAccent' : '$text';
  const iconColor = disabled ? colors.muted : primary ? colors.onAccent : colors.text;
  return (
    <XStack
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      onPress={disabled ? undefined : onPress}
      height={54}
      rounded="$full"
      items="center"
      justify="center"
      gap={8}
      px={24}
      pressStyle={disabled ? undefined : { opacity: 0.85, scale: 0.98 }}
      bg={bg}
      borderWidth={variant === 'ghost' ? 1 : 0}
      borderColor="$borderStrong"
      style={style}
    >
      {icon ? <Icon name={icon} size={18} color={iconColor} strokeWidth={2} /> : null}
      <Text fontFamily="$semibold" fontSize={16} color={fg}>
        {children}
      </Text>
    </XStack>
  );
}

export function IconButton({
  children,
  onPress,
  tone = 'neutral',
  size = 44,
  accessibilityLabel,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  tone?: 'neutral' | 'accent' | 'solid';
  size?: number;
  accessibilityLabel?: string;
}) {
  return (
    <XStack
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      pressStyle={{ opacity: 0.7 }}
      hitSlop={6}
      width={size}
      height={size}
      rounded={size / 2}
      items="center"
      justify="center"
      borderWidth={tone === 'neutral' ? 1 : 0}
      borderColor="$border"
      bg={tone === 'solid' ? '$accent' : tone === 'accent' ? '$accentSoft' : '$card'}
    >
      {children}
    </XStack>
  );
}

export function Input({
  placeholder,
  value,
  onChangeText,
  onFocus,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  autoComplete,
  onSubmitEditing,
  returnKeyType,
  style,
}: {
  placeholder?: string;
  value?: string;
  onChangeText?: (v: string) => void;
  onFocus?: () => void;
  secureTextEntry?: boolean;
  keyboardType?: 'email-address' | 'default' | 'numeric';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: 'email' | 'name' | 'password' | 'new-password' | 'off';
  onSubmitEditing?: () => void;
  returnKeyType?: 'done' | 'next' | 'go' | 'send';
  style?: ViewStyle;
}) {
  return (
    <TInput
      unstyled
      placeholder={placeholder}
      placeholderTextColor="$muted"
      value={value}
      onChangeText={onChangeText}
      onFocus={onFocus}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      autoComplete={autoComplete}
      onSubmitEditing={onSubmitEditing}
      returnKeyType={returnKeyType}
      width="100%"
      height={52}
      bg="$card"
      color="$text"
      borderWidth={1}
      borderColor="$border"
      focusStyle={{ borderColor: '$accent' }}
      rounded={14}
      px={16}
      fontFamily="$body"
      fontSize={16}
      style={style}
    />
  );
}

// iOS-style segmented control: a quiet track with a raised white pill
// on the selected option.
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
    <XStack bg="$surface" rounded={14} p={4} gap={4}>
      {options.map((opt) => {
        const active = opt === value;
        return (
          <XStack
            key={opt}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(opt)}
            flex={1}
            height={40}
            rounded={10}
            items="center"
            justify="center"
            px={8}
            bg={active ? '$card' : 'transparent'}
            style={active ? shadow.card : undefined}
          >
            <Text
              fontFamily={active ? '$semibold' : '$medium'}
              fontSize={14}
              color={active ? '$text' : '$muted'}
              numberOfLines={1}
            >
              {formatLabel(opt)}
            </Text>
          </XStack>
        );
      })}
    </XStack>
  );
}

export function ProgressBar({ pct }: { pct: number }) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <YStack width="100%" height={6} rounded={3} bg="$surface" overflow="hidden">
      <XStack height="100%" bg="$accent" rounded={3} width={`${clamped}%`} />
    </YStack>
  );
}

export function ToggleRow({
  label,
  hint,
  value,
  onChange,
  last = false,
}: {
  label: string;
  hint?: string;
  value: boolean;
  onChange: (v: boolean) => void;
  last?: boolean;
}) {
  return (
    <XStack
      items="center"
      gap={12}
      py={14}
      borderBottomWidth={last ? 0 : 1}
      borderBottomColor="$border"
    >
      <YStack flex={1}>
        <Text fontFamily="$semibold" fontSize={15} color="$text">
          {label}
        </Text>
        {hint ? (
          <Text fontSize={13} color="$muted" mt={2} lineHeight={18}>
            {hint}
          </Text>
        ) : null}
      </YStack>
      <Toggle value={value} onChange={onChange} label={label} />
    </XStack>
  );
}

// Simple on/off switch. Hand-rolled rather than Tamagui's Switch so the
// "on" track reliably takes the accent color on every platform.
export function Toggle({
  value,
  onChange,
  label,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <XStack
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      onPress={() => onChange(!value)}
      hitSlop={8}
      width={50}
      height={30}
      rounded={15}
      p={3}
      bg={value ? '$accent' : '$borderStrong'}
      justify={value ? 'flex-end' : 'flex-start'}
    >
      <YStack width={24} height={24} rounded={12} bg="$card" style={shadow.card} />
    </XStack>
  );
}

// Top of a pushed screen: back button and optional trailing action on
// one row, then an iOS-style large title with an optional subtitle.
export function ScreenHeader({
  title,
  subtitle,
  onBack,
  action,
  bordered = false,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  action?: React.ReactNode;
  bordered?: boolean;
}) {
  const insets = useSafeAreaInsets();
  return (
    <YStack
      px={20}
      pt={insets.top + 8}
      pb={bordered ? 14 : 4}
      borderBottomWidth={bordered ? 1 : 0}
      borderBottomColor="$border"
      bg="$canvas"
    >
      <XStack items="center" justify="space-between" minH={44}>
        {onBack ? (
          <IconButton size={40} onPress={onBack} accessibilityLabel="Back">
            <Icon name="chevron-left" size={20} color={colors.text} />
          </IconButton>
        ) : (
          <YStack />
        )}
        {action ?? null}
      </XStack>
      <Text
        fontFamily="$bold"
        fontSize={28}
        lineHeight={34}
        letterSpacing={-0.5}
        color="$text"
        mt={12}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text fontSize={15} lineHeight={22} color="$muted" mt={6}>
          {subtitle}
        </Text>
      ) : null}
    </YStack>
  );
}

// Plain text action for headers ("Save", "Reset", "Mark all read").
export function TextAction({
  children,
  onPress,
  tone = 'accent',
}: {
  children: React.ReactNode;
  onPress: () => void;
  tone?: 'accent' | 'muted';
}) {
  return (
    <XStack
      accessibilityRole="button"
      onPress={onPress}
      pressStyle={{ opacity: 0.6 }}
      hitSlop={10}
      py={6}
      px={4}
    >
      <Text fontFamily="$semibold" fontSize={15} color={tone === 'accent' ? '$accent' : '$muted'}>
        {children}
      </Text>
    </XStack>
  );
}

export function SectionTitle({
  children,
  hint,
  mt = 0,
}: {
  children: React.ReactNode;
  hint?: string;
  mt?: number;
}) {
  return (
    <YStack mt={mt} mb={12}>
      <Text fontFamily="$semibold" fontSize={17} lineHeight={24} color="$text">
        {children}
      </Text>
      {hint ? (
        <Text fontSize={13} lineHeight={18} color="$muted" mt={2}>
          {hint}
        </Text>
      ) : null}
    </YStack>
  );
}

// White rounded container for grouped rows and content blocks.
export function Card({
  children,
  px = 16,
  py = 0,
  style,
}: {
  children: React.ReactNode;
  px?: number;
  py?: number;
  style?: ViewStyle;
}) {
  return (
    <YStack
      bg="$card"
      rounded={20}
      borderWidth={1}
      borderColor="$border"
      px={px}
      py={py}
      overflow="hidden"
      style={StyleSheet.flatten([shadow.card, style])}
    >
      {children}
    </YStack>
  );
}

// Soft tinted note with a leading icon — tips, confirmations, privacy
// reassurances.
export function Callout({
  icon = 'sparkles',
  title,
  children,
  tone = 'accent',
}: {
  icon?: IconName;
  title?: string;
  children: React.ReactNode;
  tone?: 'accent' | 'success';
}) {
  const success = tone === 'success';
  return (
    <XStack
      gap={12}
      p={16}
      rounded={18}
      bg={success ? '$successSoft' : '$accentSoft'}
      items="flex-start"
    >
      <YStack width={20} height={20} shrink={0} mt={1}>
        <Icon
          name={icon}
          size={20}
          color={success ? colors.success : colors.accent}
          strokeWidth={2}
        />
      </YStack>
      <YStack flex={1} gap={2}>
        {title ? (
          <Text fontFamily="$semibold" fontSize={15} lineHeight={20} color="$text">
            {title}
          </Text>
        ) : null}
        <Text fontSize={14} lineHeight={20} color="$muted">
          {children}
        </Text>
      </YStack>
    </XStack>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: IconName;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <YStack items="center" px={32} gap={8}>
      <XStack
        width={64}
        height={64}
        rounded={32}
        bg="$accentSoft"
        items="center"
        justify="center"
        mb={8}
      >
        <Icon name={icon} size={28} color={colors.accent} />
      </XStack>
      <Text fontFamily="$bold" fontSize={20} lineHeight={26} color="$text" text="center">
        {title}
      </Text>
      <Text color="$muted" fontSize={15} lineHeight={22} text="center">
        {body}
      </Text>
      {action ? <YStack mt={16}>{action}</YStack> : null}
    </YStack>
  );
}
