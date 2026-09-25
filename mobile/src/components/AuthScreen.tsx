import React from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { Mascot } from './Mascot';
import { Aurora, PulseLine } from './Motif';
import { DisplayTitle } from './ui';

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
        <Aurora height={insets.top + 380} />
        <YStack gap={28}>
          <YStack gap={10}>
            <XStack items="center" gap={10} mb={18}>
              <Mascot size={64} mood="happy" />
              <PulseLine width={120} height={28} />
            </XStack>
            {eyebrow ? (
              <Text fontFamily="$semibold" fontSize={14} color="$accentText">
                {eyebrow}
              </Text>
            ) : null}
            <DisplayTitle size={48}>{title}</DisplayTitle>
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
