import { useRouter } from 'expo-router';
import { useState } from 'react';
import { XStack, YStack } from 'tamagui';
import { AuthScreen } from '../../src/components/AuthScreen';
import { Button, Callout, Input, TextAction } from '../../src/components/ui';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <AuthScreen
      eyebrow="No sweat"
      title="Reset your password"
      subtitle="Enter the email on your account and we'll send you a reset link."
    >
      {sent ? (
        <YStack gap={18}>
          <Callout icon="mail" tone="success" title="Link sent">
            {`Check ${email.trim() || 'your inbox'} for a reset link. Just like a rest day — give it a few minutes.`}
          </Callout>
          <Button style={{ width: '100%' }} onPress={() => router.replace('/sign-in')}>
            Back to sign in
          </Button>
        </YStack>
      ) : (
        <YStack gap={14}>
          <Input
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            returnKeyType="go"
            onSubmitEditing={() => setSent(true)}
          />
          <Button
            onPress={() => setSent(true)}
            disabled={!email.trim()}
            style={{ width: '100%', marginTop: 4 }}
          >
            Send reset link
          </Button>
          <XStack justify="center">
            <TextAction tone="muted" onPress={() => router.push('/sign-in')}>
              Back to sign in
            </TextAction>
          </XStack>
        </YStack>
      )}
    </AuthScreen>
  );
}
