import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, XStack, YStack } from 'tamagui';
import { AuthScreen } from '../../src/components/AuthScreen';
import { Button, Input, TextAction } from '../../src/components/ui';
import { deleteAccountAndData } from '../../src/data/account';
import { signIn, signInWithProfile, useSession } from '../../src/data/session';
import { confirmAction } from '../../src/lib/dialogs';
import { configurePurchases } from '../../src/lib/purchases';
import {
  AppleButton,
  googleEnabled,
  signInWithApple,
  signInWithGoogle,
  useAppleAvailable,
} from '../../src/lib/socialAuth';
import { useAppearance } from '../../src/theme/appearance';

export default function SignInScreen() {
  const router = useRouter();
  const { onboarded, account } = useSession();
  const appleAvailable = useAppleAvailable();
  const { scheme } = useAppearance();
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
    done();
  }

  // Unfinished onboarding picks up at the next incomplete step.
  function done() {
    if (account) configurePurchases(account.userId);
    router.replace(onboarded ? '/(tabs)/today' : '/onboarding');
  }

  async function social(method: 'apple' | 'google') {
    setError(null);
    setBusy(true);
    const r = method === 'apple' ? await signInWithApple() : await signInWithGoogle();
    if (!r.ok) {
      setBusy(false);
      if (!r.cancelled) setError(r.error ?? 'That didn’t work. Try again.');
      return;
    }
    const result = await signInWithProfile(r.profile);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    done();
  }

  // New accounts are made in onboarding. This phone holds one account,
  // so starting over replaces the one saved here.
  async function createNew() {
    if (account) {
      const ok = await confirmAction({
        title: 'Create a new account?',
        message: 'This replaces the Pace account saved on this phone, and its data.',
        confirmLabel: 'Start over',
        destructive: true,
      });
      if (!ok) return;
      await deleteAccountAndData();
    }
    router.replace('/onboarding');
  }

  return (
    <AuthScreen eyebrow="Sign in to Pace" title="Welcome *back*">
      <YStack gap={14}>
        {appleAvailable ? (
          <AppleButton dark={scheme === 'dark'} onPress={() => social('apple')} />
        ) : null}
        {googleEnabled ? (
          <Button
            variant="secondary"
            disabled={busy}
            onPress={() => social('google')}
            style={{ width: '100%' }}
          >
            Continue with Google
          </Button>
        ) : null}
        {appleAvailable || googleEnabled ? (
          <Text fontSize={13} color="$muted" text="center">
            or use email
          </Text>
        ) : null}
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
            <TextAction onPress={createNew}>Create an account</TextAction>
          </XStack>
        </YStack>
      </YStack>
    </AuthScreen>
  );
}
