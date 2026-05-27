import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';

import { useAuth } from '@/hooks/use-auth';

export default function HomeScreen() {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Home</Text>
      <Text style={styles.subtle}>Zalogowana: {user?.email ?? '—'}</Text>

      <Card>
        <Card.Title title="Dalej krok po kroku" />
        <Card.Content>
          <Text>Teraz mamy szkielet routingu: auth + tabs + guard w root layout.</Text>
          <Text>W następnym kroku dołożymy prawdziwy Auth w Firebase.</Text>
        </Card.Content>
        <Card.Actions>
          <Button mode="contained">Dodaj cykl (wkrótce)</Button>
        </Card.Actions>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  subtle: { opacity: 0.75 },
});
