import { EBGaramond_400Regular, EBGaramond_400Regular_Italic, EBGaramond_500Medium, EBGaramond_700Bold } from '@expo-google-fonts/eb-garamond';
import { IMFellEnglish_400Regular, IMFellEnglish_400Regular_Italic } from '@expo-google-fonts/im-fell-english';
import { IMFellEnglishSC_400Regular } from '@expo-google-fonts/im-fell-english-sc';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { Colors, Typefaces } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FavoritesProvider } from '@/hooks/use-favorites';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const palette = Colors[scheme];
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;

  // Polices embarquées dans l'application : aucun réseau nécessaire.
  const [fontsLoaded, fontError] = useFonts({
    IMFellEnglishSC_400Regular,
    IMFellEnglish_400Regular,
    IMFellEnglish_400Regular_Italic,
    EBGaramond_400Regular,
    EBGaramond_400Regular_Italic,
    EBGaramond_500Medium,
    EBGaramond_700Bold,
  });
  const ready = fontsLoaded || !!fontError;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <FavoritesProvider>
        <ThemeProvider
          value={{
            ...base,
            colors: {
              ...base.colors,
              primary: palette.accent,
              background: palette.background,
              card: palette.background,
              text: palette.text,
              border: palette.border,
            },
          }}>
          <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
          <Stack
            screenOptions={{
              headerTintColor: palette.accent,
              headerStyle: { backgroundColor: palette.background },
              headerTitleStyle: { fontFamily: Typefaces.heading, color: palette.text },
              headerBackButtonDisplayMode: 'minimal',
              headerShadowVisible: false,
              contentStyle: { backgroundColor: palette.background },
            }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="evenement/[id]" options={{ title: 'Programme' }} />
            <Stack.Screen name="projet/[id]" options={{ title: 'Travaux des élèves' }} />
          </Stack>
        </ThemeProvider>
      </FavoritesProvider>
    </GestureHandlerRootView>
  );
}
