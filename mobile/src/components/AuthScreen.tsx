import React from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, YStack } from 'tamagui';

// Shared layout for the pre-auth screens: hero heading + form, centered
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
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        flex={1}
        bg="$ink"
        contentContainerStyle={{ grow: 1, justify: 'center', p: 24, pt: insets.top + 40, pb: insets.bottom + 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <YStack gap={22}>
          <YStack gap={8}>
            {eyebrow ? (
              <Text fontFamily="$mono" fontSize={10} letterSpacing={4} color="$ember" textTransform="uppercase">
                {eyebrow}
              </Text>
            ) : null}
            <Text fontFamily="$display" fontSize={34} color="$bone" textTransform="uppercase" lineHeight={34}>
              {title}
            </Text>
            {subtitle ? (
              <Text color="$fog" fontSize={12} lineHeight={18}>
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