import { Redirect } from 'expo-router';
import { useSession } from '../src/data/session';

// App entry point: first-timers start onboarding (the account is created
// near its end), signed-out users with an account land on sign-in,
// signed-in users go back into onboarding until it's done, then into the tabs.
export default function Index() {
  const { account, signedIn, onboarded, loading } = useSession();

  // Session hydrates from AsyncStorage on first paint — wait a frame to
  // avoid flashing the wrong redirect.
  if (loading) return null;

  if (!signedIn) return <Redirect href={account ? '/sign-in' : '/onboarding'} />;
  if (!onboarded) return <Redirect href="/onboarding" />;
  return <Redirect href="/(tabs)/today" />;
}
