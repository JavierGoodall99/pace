import { Tabs } from 'expo-router';
import { Text } from 'tamagui';
import { Icon, IconName } from '../../src/components/Icon';
import { colors, fonts } from '../../src/theme/tokens';

const TABS: { name: string; label: string; icon: IconName }[] = [
  { name: 'discover', label: 'Discover', icon: 'zap' },
  { name: 'feed', label: 'Activity', icon: 'activity' },
  { name: 'chat', label: 'Chat', icon: 'repeat' },
  { name: 'planner', label: 'Planner', icon: 'map-pin' },
  { name: 'profile', label: 'Profile', icon: 'users' },
];

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.ember,
        tabBarInactiveTintColor: colors.fog,
        tabBarStyle: {
          backgroundColor: colors.ink,
          borderTopColor: colors.line,
          borderTopWidth: 1,
          height: 84,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: fonts.mono,
          fontSize: 9,
          letterSpacing: 1,
          textTransform: 'uppercase',
        },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.label,
            tabBarIcon: ({ color }) => <Icon name={tab.icon} size={20} color={color as any} />,
            tabBarLabel: ({ color }) => (
              <Text
                fontFamily="$mono"
                fontSize={9}
                letterSpacing={1}
                color={color as any}
                textTransform="uppercase"
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