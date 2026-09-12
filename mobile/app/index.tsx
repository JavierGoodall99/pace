import { Redirect } from 'expo-router';

// App entry point. Always opens onboarding first for now — swap this for
// an auth/AsyncStorage check (e.g. "hasOnboarded") once accounts exist,
// redirecting straight to `/(tabs)/discover` for returning users.
export default function Index() {
  return <Redirect href="/onboarding" />;
}
