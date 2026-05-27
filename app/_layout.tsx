import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Redirect, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { PaperProvider } from 'react-native-paper';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { paperDarkTheme, paperLightTheme } from '@/constants/paper-theme';
import { AuthProvider } from '@/contexts/auth-context';
import { useAuth } from '@/hooks/use-auth';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootStack() {
  const { user, isLoading } = useAuth();

  // W wersji z Firebase pokażemy tu LoadingScreen. Na razie bez asynchronicznej inicjalizacji.
  if (isLoading) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" redirect />
        </>
      ) : (
        <>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" redirect />
        </>
      )}

      {/* szczegóły cyklu (dodamy później plik) */}
      <Stack.Screen name="cycle/[id]" options={{ headerShown: true, title: 'Cykl' }} />

      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      {!user && <Redirect href="/(auth)/login" />}
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <PaperProvider theme={colorScheme === 'dark' ? paperDarkTheme : paperLightTheme}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <RootStack />
          <StatusBar style="auto" />
        </ThemeProvider>
      </PaperProvider>
    </AuthProvider>
  );
}
