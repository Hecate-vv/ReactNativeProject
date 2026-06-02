import { FirebaseError } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';

import { auth } from './config';

export function mapAuthError(error: unknown): string {
  if (!(error instanceof FirebaseError)) {
    return 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.';
  }
  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'Ten adres e-mail jest już używany.';
    case 'auth/invalid-email':
      return 'Nieprawidłowy adres e-mail.';
    case 'auth/weak-password':
      return 'Hasło jest za słabe (minimum 6 znaków).';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Nieprawidłowy adres e-mail lub hasło.';
    default:
      return 'Wystąpił błąd uwierzytelniania. Spróbuj ponownie.';
  }
}

export async function registerWithEmail(email: string, password: string): Promise<User> {
  try {
    const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
    return result.user;
  } catch (error) {
    throw new Error(mapAuthError(error));
  }
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  try {
    const result = await signInWithEmailAndPassword(auth, email.trim(), password);
    return result.user;
  } catch (error) {
    throw new Error(mapAuthError(error));
  }
}

export async function sendPasswordReset(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email.trim());
  } catch (error) {
    throw new Error(mapAuthError(error));
  }
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}
