import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, XStack, YStack } from 'tamagui';
import { AuthScreen } from '../../src/components/AuthScreen';
import { Button, Input, TextAction } from '../../src/components/ui';
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
    router.replace(onboarded ? '/(tabs)/today' : '/onboarding');
  }

  return (
    <AuthScreen
      eyebrow="Sign in to Pace"
      title="Welcome *back*"
      subtitle="Your training is waiting. Pick up right where you left off."
    >
      <YStack gap={14}>
        <Input
          placeholder="Email"
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
          placeholder="Password"
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
          <Text fontFamily="$medium" fontSize={14} color="$accentText" lineHeight={20}>
            {error}
          </Text>
        ) : null}
        <Button onPress={submit} disabled={busy} style={{ width: '100%', marginTop: 4 }}>
          {busy ? 'Signing in…' : 'Sign in'}
        </Button>

        <YStack items="center" gap={16} mt={4}>
          <TextAction tone="muted" onPress={() => router.push('/forgot-password')}>
            Forgot password?
          </TextAction>
          <XStack items="center" gap={4}>
            <Text color="$muted" fontSize={15}>
              New to Pace?
            </Text>
            <TextAction onPress={() => router.push('/sign-up')}>Create an account</TextAction>
          </XStack>
        </YStack>
      </YStack>
    </AuthScreen>
  );
}
