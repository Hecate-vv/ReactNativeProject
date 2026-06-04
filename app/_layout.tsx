import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';
import { PaperProvider, Snackbar } from 'react-native-paper';

import { paperDarkTheme, paperLightTheme } from '@/constants/paper-theme';
import { AuthProvider } from '@/contexts/auth-context';
import { CycleProvider } from '@/contexts/cycle-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/use-auth';
import { useNetwork } from '@/hooks/use-network';
import { playUiSfx } from '@/services/audio/sfx';
import { setNotificationPermissionDeniedHandler } from '@/services/notifications/scheduler';

function RootStack() {
  const { user, isLoading } = useAuth();
  const { isConnected } = useNetwork();
  const segments = useSegments();
  const router = useRouter();
  const [permissionSnackbar, setPermissionSnackbar] = useState(false);
  const [offlineSnackbar, setOfflineSnackbar] = useState(false);

  useEffect(() => {
    setNotificationPermissionDeniedHandler(() => setPermissionSnackbar(true));
    return () => setNotificationPermissionDeniedHandler(null);
  }, []);

  useEffect(() => {
    if (user && !isConnected) {
      setOfflineSnackbar(true);
    }
  }, [user, isConnected]);

  useEffect(() => {
    const sub = Notifications.addNotificationReceivedListener(() => {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Heavy);
      void playUiSfx();
    });
    return () => sub.remove();
  }, []);

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
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="modal"
          options={{ presentation: 'modal', title: 'Modal' }}
        />
      </Stack>
      <Snackbar
        visible={permissionSnackbar}
        onDismiss={() => setPermissionSnackbar(false)}
        duration={6000}
        action={{
          label: 'Ustawienia',
          onPress: () => {
            void Linking.openSettings();
          },
        }}
      >
        Włącz powiadomienia w ustawieniach telefonu
      </Snackbar>
      <Snackbar
        visible={offlineSnackbar}
        onDismiss={() => setOfflineSnackbar(false)}
        duration={5000}
      >
        Brak internetu — wyświetlane są dane zapisane lokalnie (cache).
      </Snackbar>
    </>
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
        <PaperProvider
          theme={colorScheme === 'dark' ? paperDarkTheme : paperLightTheme}
        >
          <ThemeProvider
            value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
          >
            <RootStack />
            <StatusBar style="auto" />
          </ThemeProvider>
        </PaperProvider>
      </CycleProvider>
    </AuthProvider>
  );
}
