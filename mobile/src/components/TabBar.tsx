import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, XStack } from 'tamagui';
import { Icon, IconName } from './Icon';
import { useColors } from '../theme/appearance';

// Floating pill tab bar: detached from the screen edge, the active tab
// expands into a labelled accent capsule, the rest stay as quiet icons.

// Bottom padding tab screens reserve so content scrolls clear of the bar.
export function useTabBarSpace() {
  const insets = useSafeAreaInsets();
  return Math.max(insets.bottom, 12) + 84;
}

interface TabBarProps {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: {
    emit: (e: { type: 'tabPress'; target: string; canPreventDefault: true }) => {
      defaultPrevented: boolean;
    };
    navigate: (name: string) => void;
  };
}

export function FloatingTabBar({
  state,
  navigation,
  tabs,
}: TabBarProps & { tabs: Record<string, { label: string; icon: IconName }> }) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  return (
    <XStack
      position="absolute"
      l={16}
      r={16}
      b={Math.max(insets.bottom, 12)}
      height={64}
      px={8}
      rounded={32}
      items="center"
      justify="space-between"
      bg="$tabBar"
      borderWidth={1}
      borderColor="$border"
      style={{
        shadowColor: '#000',
        shadowOpacity: 0.14,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 10 },
        elevation: 12,
      }}
    >
      {state.routes.map((route, index) => {
        const tab = tabs[route.name];
        if (!tab) return null;
        const focused = state.index === index;
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        };
        return (
          <XStack
            key={route.key}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            aria-label={tab.label}
            accessibilityState={{ selected: focused }}
            onPress={onPress}
            pressStyle={{ scale: 0.94 }}
            height={48}
            px={focused ? 16 : 12}
            rounded={24}
            items="center"
            justify="center"
            gap={7}
            bg={focused ? '$accent' : 'transparent'}
          >
            <Icon
              name={tab.icon}
              size={22}
              color={focused ? c.onAccent : c.muted}
              strokeWidth={focused ? 2.2 : 1.9}
              filled={focused && tab.icon === 'heart'}
            />
            {focused ? (
              <Text fontFamily="$semibold" fontSize={14} color="$onAccent">
                {tab.label}
              </Text>
            ) : null}
          </XStack>
        );
      })}
    </XStack>
  );
}
