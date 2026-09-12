import { Anton_400Regular, useFonts as useAnton } from '@expo-google-fonts/anton';
import {
  Archivo_400Regular,
  Archivo_600SemiBold,
  useFonts as useArchivo,
} from '@expo-google-fonts/archivo';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_700Bold,
  useFonts as useJetBrainsMono,
} from '@expo-google-fonts/jetbrains-mono';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../src/theme/tokens';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [antonLoaded] = useAnton({ Anton_400Regular });
  const [archivoLoaded] = useArchivo({ Archivo_400Regular, Archivo_600SemiBold });
  const [monoLoaded] = useJetBrainsMono({ JetBrainsMono_400Regular, JetBrainsMono_700Bold });

  const fontsLoaded = antonLoaded && archivoLoaded && monoLoaded;

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
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.ink },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="athlete/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="thread/[athleteId]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="match/[athleteId]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="settings" />
        <Stack.Screen name="settings-preferences" />
        <Stack.Screen name="settings-notifications" />
        <Stack.Screen name="settings-privacy" />
        <Stack.Screen name="settings-subscription" />
        <Stack.Screen name="notifications" />
      </Stack>
    </SafeAreaProvider>
  );
}
