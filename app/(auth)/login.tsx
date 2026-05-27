import { Link } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';

import { useAuth } from '@/hooks/use-auth';

export default function LoginScreen() {
  const { loginWithEmail, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const emailError = useMemo(() => {
    if (!email.trim()) return null;
    if (!email.includes('@')) return 'Email wygląda niepoprawnie.';
    return null;
  }, [email]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}>
      <View style={styles.card}>
        <Text variant="headlineMedium">Logowanie</Text>
        <Text style={styles.subtle}>Logowanie Firebase (email + hasło).</Text>

        <TextInput
          mode="outlined"
          label="Email"
          value={email}
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={(t) => {
            clearError();
            setEmail(t);
          }}
        />
        <HelperText type={emailError ? 'error' : 'info'} visible={!!email}>
          {emailError ?? ' '}
        </HelperText>

        <TextInput
          mode="outlined"
          label="Hasło"
          value={password}
          secureTextEntry
          onChangeText={(t) => {
            clearError();
            setPassword(t);
          }}
        />

        <HelperText type="error" visible={!!error}>
          {error ?? ' '}
        </HelperText>

        <Button
          mode="contained"
          loading={isLoading}
          onPress={() => loginWithEmail(email, password)}
          disabled={isLoading || !!emailError || !email.trim() || !password}>
          Zaloguj
        </Button>

        <View style={styles.row}>
          <Text>Nie masz konta?</Text>
          <Link href="/(auth)/register">Rejestracja</Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16 },
  card: { gap: 12 },
  subtle: { opacity: 0.75 },
  row: { flexDirection: 'row', gap: 8, alignItems: 'center' },
});

