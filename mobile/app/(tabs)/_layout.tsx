import { Tabs, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { IconName } from '../../src/components/Icon';
import { FloatingTabBar } from '../../src/components/TabBar';
import { clearCelebrate, usePlans } from '../../src/data/plans';

const TABS: Record<string, { label: string; icon: IconName }> = {
  today: { label: 'Today', icon: 'calendar' },
  discover: { label: 'Pacers', icon: 'sparkles' },
  sessions: { label: 'Explore', icon: 'map' },
  chat: { label: 'Chats', icon: 'message-circle' },
  profile: { label: 'You', icon: 'user' },
};

export default function TabsLayout() {
  const router = useRouter();
  const { celebrate, plans } = usePlans();

  // When someone accepts your invite to train, that's the match — show it.
  useEffect(() => {
    if (!celebrate) return;
    const plan = plans.find((p) => p.id === celebrate);
    clearCelebrate();
    if (plan) {
      router.push({
        pathname: '/match/[athleteId]',
        params: { athleteId: String(plan.athleteId), planId: plan.id },
      });
    }
  }, [celebrate, plans, router]);

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <FloatingTabBar {...(props as any)} tabs={TABS} />}
    >
      {Object.entries(TABS).map(([name, tab]) => (
        <Tabs.Screen key={name} name={name} options={{ title: tab.label }} />
      ))}
    </Tabs>
  );
}
