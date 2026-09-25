import { Tabs } from 'expo-router';
import { Text } from 'tamagui';
import { Icon, IconName } from '../../src/components/Icon';
import { colors } from '../../src/theme/tokens';

const TABS: { name: string; label: string; icon: IconName }[] = [
  { name: 'discover', label: 'Discover', icon: 'sparkles' },
  { name: 'feed', label: 'Activity', icon: 'activity' },
  { name: 'chat', label: 'Chats', icon: 'message-circle' },
  { name: 'planner', label: 'Plans', icon: 'calendar' },
  { name: 'profile', label: 'Profile', icon: 'user' },
];

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 84,
          paddingTop: 8,
        },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.label,
            tabBarIcon: ({ color, focused }) => (
              <Icon
                name={tab.icon}
                size={24}
                color={color as string}
                strokeWidth={focused ? 2.2 : 1.8}
              />
            ),
            tabBarLabel: ({ color, focused }) => (
              <Text
                fontFamily={focused ? '$semibold' : '$medium'}
                fontSize={11}
                mt={2}
                color={color as any}
              >
                {tab.label}
              </Text>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
