export function mapFirebaseError(e: unknown): string {
  const code = (e as { code?: string })?.code;
  switch (code) {
    case 'auth/invalid-email':
      return 'Nieprawidłowy email.';
    case 'auth/wrong-password':
      return 'Błędne hasło.';
    case 'auth/user-not-found':
      return 'Nie ma takiego użytkownika.';
    case 'auth/email-already-in-use':
      return 'Email jest już zajęty.';
    case 'auth/weak-password':
      return 'Hasło jest za słabe.';
    default:
      return 'Wystąpił błąd. Spróbuj ponownie.';
  }
}

