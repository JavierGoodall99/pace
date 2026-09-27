import { act, fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TamaguiProvider } from 'tamagui';
import config from '../../tamagui.config';
import { FloatingTabBar } from './TabBar';

const TABS = {
  today: { label: 'Today', icon: 'calendar' as const },
  discover: { label: 'Pacers', icon: 'sparkles' as const },
  chat: { label: 'Chats', icon: 'message-circle' as const },
};
const ROUTES = Object.keys(TABS).map((name) => ({ key: `${name}-key`, name }));

async function setup(index = 0, defaultPrevented = false) {
  const navigation = {
    emit: jest.fn(() => ({ defaultPrevented })),
    navigate: jest.fn(),
  };
  const ui = (i: number) => (
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 0, left: 0, right: 0, bottom: 0 },
      }}
    >
      <TamaguiProvider config={config} defaultTheme="light">
        <FloatingTabBar state={{ index: i, routes: ROUTES }} navigation={navigation} tabs={TABS} />
      </TamaguiProvider>
    </SafeAreaProvider>
  );
  const utils = await render(ui(index));
  return { navigation, rerender: (i: number) => utils.rerender(ui(i)) };
}

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

test('marks only the focused tab as selected', async () => {
  await setup(1);
  expect(screen.getByLabelText('Pacers').props.accessibilityState).toEqual({ selected: true });
  expect(screen.getByLabelText('Today').props.accessibilityState).toEqual({ selected: false });
});

test('pressing another tab navigates to it', async () => {
  const { navigation } = await setup(0);
  await fireEvent.press(screen.getByLabelText('Chats'));
  expect(navigation.emit).toHaveBeenCalledWith({
    type: 'tabPress',
    target: 'chat-key',
    canPreventDefault: true,
  });
  expect(navigation.navigate).toHaveBeenCalledWith('chat');
});

test('pressing the focused tab does not navigate', async () => {
  const { navigation } = await setup(0);
  await fireEvent.press(screen.getByLabelText('Today'));
  expect(navigation.navigate).not.toHaveBeenCalled();
});

test('respects a prevented tabPress', async () => {
  const { navigation } = await setup(0, true);
  await fireEvent.press(screen.getByLabelText('Chats'));
  expect(navigation.navigate).not.toHaveBeenCalled();
});

test('switching tabs animates without errors and settles on the new tab', async () => {
  const { rerender } = await setup(0);
  await rerender(2);
  await act(() => jest.runAllTimers());
  expect(screen.getByLabelText('Chats').props.accessibilityState).toEqual({ selected: true });
});
