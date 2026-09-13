import React from 'react';
import { ViewStyle } from 'react-native';
import { Input as TInput, Switch as TSwitch, Text, XStack, YStack } from 'tamagui';

// Small design-system components ported from
// `../_ds/pace-design-system-.../_ds_bundle.js` (Badge, Chip, Button,
// IconButton, Input), rebuilt on Tamagui primitives so the whole app
// shares one styling system. Note: this Tamagui config sets
// `onlyAllowShorthands`, so props like `bg`, `px`, `rounded` are used
// instead of the RN longhands.

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
    <XStack
      items="center"
      borderWidth={1}
      rounded="$full"
      px={14}
      py={6}
      bg={accent ? '$emberSoft' : '$coal'}
      borderColor={accent ? '$emberBorder' : '$line'}
      style={style}
    >
      <Text
        fontFamily="$mono"
        fontSize={10}
        letterSpacing={2}
        textTransform="uppercase"
        fontWeight="700"
        color={accent ? '$ember' : '$fog'}
      >
        {children}
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
      onPress={onPress}
      height={44}
      px={18}
      rounded="$full"
      borderWidth={1}
      items="center"
      justify="center"
      bg={active ? '$ember' : '$coal'}
      borderColor={active ? '$ember' : '$line'}
    >
      <Text
        fontFamily="$mono"
        fontSize={11}
        letterSpacing={1.5}
        textTransform="uppercase"
        fontWeight={active ? '700' : '500'}
        color={active ? '$ink' : '$fog'}
      >
        {label}
      </Text>
    </XStack>
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
    <XStack
      onPress={onPress}
      disabled={disabled}
      height={52}
      rounded="$full"
      items="center"
      justify="center"
      px={24}
      pressStyle={disabled ? undefined : { opacity: 0.85 }}
      bg={disabled ? '$ash' : ghost ? 'transparent' : '$ember'}
      borderWidth={ghost ? 1 : 0}
      borderColor="$line"
      style={style}
    >
      <Text
        fontFamily="$mono"
        fontSize={12}
        letterSpacing={2}
        textTransform="uppercase"
        fontWeight="700"
        color={disabled ? '$fog' : ghost ? '$fog' : '$ink'}
      >
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
}: {
  children: React.ReactNode;
  onPress?: () => void;
  tone?: 'neutral' | 'accent';
  size?: number;
}) {
  const accent = tone === 'accent';
  return (
    <XStack
      onPress={onPress}
      width={size}
      height={size}
      rounded={size / 2}
      items="center"
      justify="center"
      borderWidth={1}
      borderColor="$line"
      bg={accent ? '$emberSoft' : '$ash'}
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
      placeholderTextColor="$fog"
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
      height={48}
      bg="$coal"
      color="$bone"
      borderWidth={1}
      borderColor="$line"
      rounded="$full"
      px={24}
      fontFamily="$mono"
      fontSize={14}
      letterSpacing={1}
      style={style}
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
    <XStack flexWrap="wrap" gap={8}>
      {options.map((opt) => {
        const active = opt === value;
        return (
          <XStack
            key={opt}
            onPress={() => onChange(opt)}
            py={10}
            px={18}
            rounded="$full"
            borderWidth={1}
            bg={active ? '$ember' : '$coal'}
            borderColor={active ? '$ember' : '$line'}
          >
            <Text
              fontFamily="$mono"
              fontSize={11}
              letterSpacing={1.5}
              textTransform="uppercase"
              fontWeight={active ? '700' : '500'}
              color={active ? '$ink' : '$fog'}
            >
              {opt}
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
    <YStack width="100%" height={3} rounded={2} bg="$line" overflow="hidden">
      <XStack height="100%" bg="$ember" rounded={2} width={`${clamped}%`} />
    </YStack>
  );
}

export function ToggleRow({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <XStack
      items="center"
      gap={12}
      py={14}
      borderBottomWidth={1}
      borderBottomColor="$line"
    >
      <YStack flex={1}>
        <Text
          fontFamily="$mono"
          fontSize={11}
          letterSpacing={1}
          color="$bone"
          textTransform="uppercase"
        >
          {label}
        </Text>
        {hint ? (
          <Text fontSize={12} color="$fog" mt={4} lineHeight={17}>
            {hint}
          </Text>
        ) : null}
      </YStack>
      <TSwitch
        checked={value}
        onCheckedChange={onChange}
        backgroundColor={value ? '$ember' : '$coal'}
        borderColor={value ? '$ember' : '$line'}
        borderWidth={1}
      >
        <TSwitch.Thumb backgroundColor="$bone" />
      </TSwitch>
    </XStack>
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
    <YStack px={20} pb={4}>
      {eyebrow ? (
        <Text fontFamily="$mono" fontSize={10} letterSpacing={4} color="$ember">
          {eyebrow}
        </Text>
      ) : null}
      <Text
        fontFamily="$display"
        fontSize={32}
        color="$bone"
        textTransform="uppercase"
        lineHeight={32}
        mt={8}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text fontSize={12} color="$fog" mt={8} mb={16}>
          {subtitle}
        </Text>
      ) : null}
    </YStack>
  );
}