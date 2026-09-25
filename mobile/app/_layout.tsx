import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import {
  InstrumentSerif_400Regular,
  InstrumentSerif_400Regular_Italic,
} from '@expo-google-fonts/instrument-serif';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TamaguiProvider, Theme } from 'tamagui';
import { useAppearance } from '../src/theme/appearance';
import { palettes } from '../src/theme/tokens';
import tamaguiConfig from '../tamagui.config';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    InstrumentSerif_400Regular,
    InstrumentSerif_400Regular_Italic,
  });
  const { scheme } = useAppearance();
  const colors = palettes[scheme];

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <TamaguiProvider config={tamaguiConfig} defaultTheme={scheme}>
        <Theme name={scheme}>
          <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.canvas },
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(auth)/sign-in" />
            <Stack.Screen name="(auth)/sign-up" />
            <Stack.Screen name="(auth)/forgot-password" />
            <Stack.Screen name="athlete/[id]" options={{ presentation: 'modal' }} />
            <Stack.Screen name="thread/[athleteId]" options={{ presentation: 'modal' }} />
            <Stack.Screen name="match/[athleteId]" options={{ presentation: 'modal' }} />
            <Stack.Screen name="edit-profile" options={{ presentation: 'modal' }} />
            <Stack.Screen name="matches" options={{ presentation: 'modal' }} />
            <Stack.Screen name="likes" options={{ presentation: 'modal' }} />
            <Stack.Screen name="connect/[provider]" options={{ presentation: 'modal' }} />
            <Stack.Screen name="verify" options={{ presentation: 'modal' }} />
            <Stack.Screen name="discover-filters" options={{ presentation: 'modal' }} />
            <Stack.Screen name="settings" />
            <Stack.Screen name="settings-preferences" />
            <Stack.Screen name="settings-notifications" />
            <Stack.Screen name="settings-privacy" />
            <Stack.Screen name="settings-subscription" />
            <Stack.Screen name="notifications" />
            <Stack.Screen name="invite/[athleteId]" options={{ presentation: 'modal' }} />
            <Stack.Screen name="session/[id]" />
            <Stack.Screen name="session-new" options={{ presentation: 'modal' }} />
            <Stack.Screen name="races" />
            <Stack.Screen name="race/[id]" />
            <Stack.Screen name="safety" />
          </Stack>
        </Theme>
      </TamaguiProvider>
    </SafeAreaProvider>
  );
}
