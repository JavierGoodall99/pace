import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, XStack, YStack } from 'tamagui';
import { AuthScreen } from '../../src/components/AuthScreen';
import { Button, Input } from '../../src/components/ui';
import { signIn, useSession } from '../../src/data/session';

export default function SignInScreen() {
  const router = useRouter();
  const { onboarded } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError(null);
    setBusy(true);
    const result = await signIn(email, password);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.replace(onboarded ? '/(tabs)/discover' : '/onboarding');
  }

  return (
    <AuthScreen
      eyebrow="WELCOME BACK"
      title="Sign in."
      subtitle="Your training is waiting. Pick up right where you left off."
    >
      <YStack gap={14}>
        <Input
          placeholder="EMAIL"
          value={email}
          onChangeText={(v) => {
            setEmail(v);
            setError(null);
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          returnKeyType="next"
        />
        <Input
          placeholder="PASSWORD"
          value={password}
          onChangeText={(v) => {
            setPassword(v);
            setError(null);
          }}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="password"
          returnKeyType="go"
          onSubmitEditing={submit}
        />
        {error ? (
          <Text fontFamily="$mono" fontSize={10} letterSpacing={1} color="$ember" lineHeight={16}>
            {error}
          </Text>
        ) : null}
        <Button onPress={submit} disabled={busy} style={{ width: '100%', marginTop: 4 }}>
          {busy ? 'Signing In…' : 'Sign In'}
        </Button>

        <YStack items="center" gap={16} mt={4}>
          <XStack onPress={() => router.push('/forgot-password')} py={4}>
            <Text fontFamily="$mono" fontSize={10} letterSpacing={1.5} color="$fog" textTransform="uppercase">
              Forgot Password?
            </Text>
          </XStack>
          <XStack items="center" gap={6}>
            <Text color="$fog" fontSize={12}>
              New to Pace?
            </Text>
            <XStack onPress={() => router.push('/sign-up')} py={4}>
              <Text fontFamily="$mono" fontSize={11} letterSpacing={1} color="$ember" textTransform="uppercase" fontWeight="700">
                Create Account
              </Text>
            </XStack>
          </XStack>
        </YStack>
      </YStack>
    </AuthScreen>
  );
}