import React from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { Icon } from './Icon';
import { colors } from '../theme/tokens';

// Shared layout for the pre-auth screens: brand mark, heading and form,
// with the keyboard kept clear of the inputs.

export function AuthScreen({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        flex={1}
        bg="$canvas"
        contentContainerStyle={{
          grow: 1,
          justify: 'center',
          p: 24,
          pt: insets.top + 40,
          pb: insets.bottom + 40,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <YStack gap={28}>
          <YStack gap={10}>
            <XStack
              width={52}
              height={52}
              rounded={16}
              bg="$accent"
              items="center"
              justify="center"
              mb={14}
            >
              <Icon name="heart" size={24} color={colors.onAccent} filled />
            </XStack>
            {eyebrow ? (
              <Text fontFamily="$semibold" fontSize={14} color="$accent">
                {eyebrow}
              </Text>
            ) : null}
            <Text
              fontFamily="$bold"
              fontSize={30}
              lineHeight={36}
              letterSpacing={-0.5}
              color="$text"
            >
              {title}
            </Text>
            {subtitle ? (
              <Text color="$muted" fontSize={16} lineHeight={24}>
                {subtitle}
              </Text>
            ) : null}
          </YStack>
          {children}
        </YStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
