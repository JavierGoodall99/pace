import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, XStack, YStack } from 'tamagui';
import { AuthScreen } from '../../src/components/AuthScreen';
import { Button, Input } from '../../src/components/ui';
import { signUp } from '../../src/data/session';

export default function SignUpScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError(null);
    setBusy(true);
    const result = await signUp(name, email, password);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.replace('/onboarding');
  }

  return (
    <AuthScreen
      eyebrow="JOIN THE COHORT"
      title="Sign up."
      subtitle="Create your card in about a minute. Six quick steps, then it's built."
    >
      <YStack gap={14}>
        <Input
          placeholder="NAME"
          value={name}
          onChangeText={(v) => {
            setName(v);
            setError(null);
          }}
          autoCapitalize="words"
          autoComplete="name"
          returnKeyType="next"
        />
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
          autoComplete="new-password"
          returnKeyType="go"
          onSubmitEditing={submit}
        />
        {error ? (
          <Text fontFamily="$mono" fontSize={10} letterSpacing={1} color="$ember" lineHeight={16}>
            {error}
          </Text>
        ) : null}
        <Button onPress={submit} disabled={busy} style={{ width: '100%', marginTop: 4 }}>
          {busy ? 'Creating…' : 'Create Account'}
        </Button>

        <XStack items="center" justify="center" gap={6} mt={4}>
          <Text color="$fog" fontSize={12}>
            Already a member?
          </Text>
          <XStack onPress={() => router.push('/sign-in')} py={4}>
            <Text fontFamily="$mono" fontSize={11} letterSpacing={1} color="$ember" textTransform="uppercase" fontWeight="700">
              Sign In
            </Text>
          </XStack>
        </XStack>
      </YStack>
    </AuthScreen>
  );
}