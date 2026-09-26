import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, XStack, YStack } from 'tamagui';
import { AuthScreen } from '../../src/components/AuthScreen';
import { Button, Input, TextAction } from '../../src/components/ui';
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
    <AuthScreen eyebrow="Join Pace" title="Find your *pace*">
      <YStack gap={14}>
        <Input
          placeholder="Name"
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
          autoComplete="new-password"
          returnKeyType="go"
          onSubmitEditing={submit}
        />
        {error ? (
          <Text fontFamily="$medium" fontSize={14} color="$accentText" lineHeight={20}>
            {error}
          </Text>
        ) : null}
        <Button onPress={submit} disabled={busy} style={{ width: '100%', marginTop: 4 }}>
          {busy ? 'Creating…' : 'Create account'}
        </Button>

        <XStack items="center" justify="center" gap={4} mt={4}>
          <Text color="$muted" fontSize={15}>
            Already have an account?
          </Text>
          <TextAction onPress={() => router.push('/sign-in')}>Sign in</TextAction>
        </XStack>
      </YStack>
    </AuthScreen>
  );
}
