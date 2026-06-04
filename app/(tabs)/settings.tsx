import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { useAuth } from '@/hooks/use-auth';
import { requestNotificationPermissionsManual } from '@/services/notifications/scheduler';

export default function SettingsScreen() {
  const { user, logout, isSubmitting } = useAuth();
  const [isRequestingNotifications, setIsRequestingNotifications] =
    useState(false);
  const [notificationStatus, setNotificationStatus] = useState<string | null>(
    null
  );

  const handleEnableReminders = useCallback(async () => {
    setIsRequestingNotifications(true);
    setNotificationStatus(null);
    try {
      const granted = await requestNotificationPermissionsManual();
      setNotificationStatus(
        granted
          ? 'Powiadomienia włączone. Przypomnienie zaplanuje się po zapisie cyklu.'
          : 'Odmowa uprawnień — włącz powiadomienia w ustawieniach systemu.'
      );
    } finally {
      setIsRequestingNotifications(false);
    }
  }, []);

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Ustawienia</Text>
      <Text style={styles.subtle}>Użytkownik: {user?.email ?? '—'}</Text>

      <Text variant="titleMedium">Powiadomienia</Text>
      <Text style={styles.subtle}>
        Lokalne przypomnienie o przewidywanym początku okresu (rano, 9:00).
      </Text>
      <Button
        mode="contained-tonal"
        loading={isRequestingNotifications}
        disabled={isRequestingNotifications}
        onPress={() => void handleEnableReminders()}
      >
        Włącz przypomnienia
      </Button>
      {notificationStatus ? (
        <Text style={styles.status}>{notificationStatus}</Text>
      ) : null}

      <Button
        mode="outlined"
        loading={isSubmitting}
        disabled={isSubmitting}
        onPress={() => logout()}
      >
        Wyloguj
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  subtle: { opacity: 0.75 },
  status: { opacity: 0.85 },
});
