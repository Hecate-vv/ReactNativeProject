export function mapFirebaseError(e: unknown): string {
  const code = (e as { code?: string })?.code;
  const message = (e as { message?: string })?.message;

  if (__DEV__ && code) {
    console.warn('[Firebase Auth]', code, message);
  }

  if (code?.includes('api-key') || message?.toLowerCase().includes('api-key')) {
    return 'Błąd konfiguracji Firebase (klucz API). Sprawdź plik .env i uruchom: npx expo start -c';
  }

  switch (code) {
    case 'auth/invalid-api-key':
    case 'auth/api-key-not-valid.-please-pass-a-valid-api-key.':
      return 'Błąd konfiguracji Firebase (klucz API). Sprawdź .env, zapisz plik i uruchom: npx expo start -c';
    case 'auth/invalid-email':
      return 'Nieprawidłowy email.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
      return 'Nieprawidłowy email lub hasło.';
    case 'auth/user-not-found':
      return 'Nie ma konta z tym adresem email.';
    case 'auth/email-already-in-use':
      return 'Email jest już zajęty — spróbuj się zalogować.';
    case 'auth/weak-password':
      return 'Hasło jest za słabe (min. 6 znaków).';
    case 'auth/too-many-requests':
      return 'Za dużo prób. Odczekaj chwilę i spróbuj ponownie.';
    case 'auth/network-request-failed':
      return 'Brak internetu. Sprawdź połączenie i spróbuj ponownie.';
    case 'auth/operation-not-allowed':
      return 'Logowanie email/hasło nie jest włączone w Firebase Console.';
    default:
      return 'Wystąpił błąd. Spróbuj ponownie.';
  }
}
