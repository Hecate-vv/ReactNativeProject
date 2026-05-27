import { Link } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const emailError = useMemo(() => {
    if (!email.trim()) return null;
    if (!email.includes('@')) return 'Email wygląda niepoprawnie.';
    return null;
  }, [email]);

  const passwordError = useMemo(() => {
    if (!password) return null;
    if (password.length < 6) return 'Hasło musi mieć min. 6 znaków.';
    return null;
  }, [password]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}>
      <View style={styles.card}>
        <Text variant="headlineMedium">Rejestracja</Text>
        <Text style={styles.subtle}>Tu później podłączymy Firebase Email/Password.</Text>

        <TextInput
          mode="outlined"
          label="Email"
          value={email}
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setEmail}
        />
        <HelperText type={emailError ? 'error' : 'info'} visible={!!email}>
          {emailError ?? ' '}
        </HelperText>

        <TextInput
          mode="outlined"
          label="Hasło"
          value={password}
          secureTextEntry
          onChangeText={setPassword}
        />
        <HelperText type={passwordError ? 'error' : 'info'} visible={!!password}>
          {passwordError ?? ' '}
        </HelperText>

        <Button mode="contained" disabled={!!emailError || !!passwordError || !email || !password}>
          Załóż konto (wkrótce)
        </Button>

        <View style={styles.row}>
          <Text>Masz konto?</Text>
          <Link href="/(auth)/login">Logowanie</Link>
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

