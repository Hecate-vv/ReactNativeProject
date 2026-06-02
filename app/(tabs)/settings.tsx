import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { useAuth } from '@/hooks/use-auth';

export default function SettingsScreen() {
  const { user, logout, isSubmitting } = useAuth();

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Ustawienia</Text>
      <Text style={styles.subtle}>Użytkownik: {user?.email ?? '—'}</Text>

      <Button mode="outlined" loading={isSubmitting} disabled={isSubmitting} onPress={() => logout()}>
        Wyloguj
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  subtle: { opacity: 0.75 },
});

