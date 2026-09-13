import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, XStack, YStack } from 'tamagui';
import { AuthScreen } from '../../src/components/AuthScreen';
import { Button, Input } from '../../src/components/ui';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <AuthScreen
      eyebrow="NO SWEAT"
      title="Reset password."
      subtitle="Enter the email on your account and we'll send you a reset link."
    >
      {sent ? (
        <YStack gap={18}>
          <YStack p={18} rounded={16} bg="$emberSoft" borderWidth={1} borderColor="$emberBorder" gap={6}>
            <Text fontFamily="$display" fontSize={16} color="$bone" textTransform="uppercase">
              Link sent
            </Text>
            <Text fontSize={12} color="$fog" lineHeight={18}>
              Check {email.trim() || 'your inbox'} for a reset link. Just like a rest day — give it
              a few minutes.
            </Text>
          </YStack>
          <Button style={{ width: '100%' }} onPress={() => router.replace('/sign-in')}>
            Back to Sign In
          </Button>
        </YStack>
      ) : (
        <YStack gap={14}>
          <Input
            placeholder="EMAIL"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            returnKeyType="go"
            onSubmitEditing={() => setSent(true)}
          />
          <Button onPress={() => setSent(true)} disabled={!email.trim()} style={{ width: '100%', marginTop: 4 }}>
            Send Reset Link
          </Button>
          <XStack onPress={() => router.push('/sign-in')} items="center" justify="center" py={4}>
            <Text fontFamily="$mono" fontSize={10} letterSpacing={1.5} color="$fog" textTransform="uppercase">
              Back to Sign In
            </Text>
          </XStack>
        </YStack>
      )}
    </AuthScreen>
  );
}