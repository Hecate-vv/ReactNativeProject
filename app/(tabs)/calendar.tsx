import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

export default function CalendarScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Kalendarz</Text>
      <Text style={styles.subtle}>Tu pokażemy dni cyklu i ostatnie wpisy.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  subtle: { opacity: 0.75 },
});

