import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Button, HelperText, Text, TextInput, useTheme } from 'react-native-paper';

import { useAuth } from '@/hooks/use-auth';

export default function RegisterScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { registerWithEmail, isLoading, error, clearError } = useAuth();
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
        <Text style={styles.subtle}>Tryb demo (bez Firebase) — konto zapisuje się na telefonie.</Text>

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
        <HelperText type={passwordError ? 'error' : 'info'} visible={!!password}>
          {passwordError ?? ' '}
        </HelperText>

        <HelperText type="error" visible={!!error}>
          {error ?? ' '}
        </HelperText>

        <Button
          mode="contained"
          loading={isLoading}
          onPress={() => registerWithEmail(email, password)}
          disabled={isLoading || !!emailError || !!passwordError || !email || !password}>
          Załóż konto
        </Button>

        <Pressable
          onPress={() => router.push('/(auth)/login')}
          style={styles.linkPressable}
          accessibilityRole="button">
          <Text style={{ color: theme.colors.primary, textAlign: 'center' }}>
            Masz konto? Zaloguj się
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16 },
  card: { gap: 12 },
  subtle: { opacity: 0.75 },
  linkPressable: { alignSelf: 'center', paddingVertical: 8 },
});

