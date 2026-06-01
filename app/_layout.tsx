import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';
import { PaperProvider } from 'react-native-paper';

import { paperDarkTheme, paperLightTheme } from '@/constants/paper-theme';
import { AuthProvider } from '@/contexts/auth-context';
import { CycleProvider } from '@/contexts/cycle-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/use-auth';

function RootStack() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // Guard: niezalogowany → login; zalogowany → taby (Redirect w Stack jest ignorowany przez expo-router).
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, isLoading, segments, router]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <CycleProvider>
        <PaperProvider theme={colorScheme === 'dark' ? paperDarkTheme : paperLightTheme}>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <RootStack />
            <StatusBar style="auto" />
          </ThemeProvider>
        </PaperProvider>
      </CycleProvider>
    </AuthProvider>
  );
}
