import { Tabs } from 'expo-router';
import { IconName } from '../../src/components/Icon';
import { FloatingTabBar } from '../../src/components/TabBar';

const TABS: Record<string, { label: string; icon: IconName }> = {
  discover: { label: 'Discover', icon: 'sparkles' },
  feed: { label: 'Activity', icon: 'activity' },
  chat: { label: 'Chats', icon: 'message-circle' },
  planner: { label: 'Plans', icon: 'calendar' },
  profile: { label: 'You', icon: 'user' },
};

export default function TabsLayout() {
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
