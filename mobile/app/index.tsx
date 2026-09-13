import { Redirect } from 'expo-router';
import { useSession } from '../src/data/session';

// App entry point: signed-out users land on auth, signed-in users go
// back into onboarding until it's done, then straight into the tabs.
export default function Index() {
  const { account, onboarded, loading } = useSession();

  // Session hydrates from AsyncStorage on first paint — wait a frame to
  // avoid flashing the wrong redirect.
  if (loading) return null;

  if (!account) return <Redirect href="/sign-in" />;
  if (!onboarded) return <Redirect href="/onboarding" />;
  return <Redirect href="/(tabs)/discover" />;
}