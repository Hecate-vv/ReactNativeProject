/** Mapowanie błędów Firebase Auth i Firestore na komunikaty UI. */
export function mapFirestoreError(e: unknown): string {
  const code = (e as { code?: string })?.code;
  const message = (e as { message?: string })?.message;

  if (__DEV__ && code) {
    console.warn('[Firebase]', code, message);
  }

  if (code?.includes('api-key') || message?.toLowerCase().includes('api-key')) {
    return 'Błąd konfiguracji Firebase (klucz API). Sprawdź plik .env i uruchom: npx expo start -c';
  }

  switch (code) {
    case 'permission-denied':
      return 'Brak uprawnień do danych. Zaloguj się ponownie lub sprawdź reguły Firestore.';
    case 'unavailable':
      return 'Firestore jest chwilowo niedostępny. Spróbuj ponownie za chwilę.';
    case 'failed-precondition':
      return 'Brak wymaganego indeksu w Firestore. Sprawdź konsolę Firebase.';
    case 'not-found':
      return 'Nie znaleziono dokumentu.';
    case 'already-exists':
      return 'Dokument już istnieje.';
    case 'resource-exhausted':
      return 'Przekroczono limit zapytań. Spróbuj później.';
    case 'deadline-exceeded':
      return 'Przekroczono limit czasu połączenia. Sprawdź internet.';
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
      return message && message.length < 120 ? message : 'Wystąpił błąd. Spróbuj ponownie.';
  }
}

/** @deprecated Użyj `mapFirestoreError` — alias dla kompatybilności. */
export const mapFirebaseError = mapFirestoreError;
