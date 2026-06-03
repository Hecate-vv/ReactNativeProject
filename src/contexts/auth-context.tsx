import { onAuthStateChanged, type User } from 'firebase/auth';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { clearAuthToken, saveAuthToken } from '@/lib/storage/secure-storage';
import {
  registerWithEmail as firebaseRegister,
  signInWithEmail as firebaseSignIn,
  signOutUser,
} from '@/services/firebase/auth';
import { auth } from '@/services/firebase/config';

export type AppUser = { uid: string; email: string | null };

type AuthContextValue = {
  /** Alias `user` — spójny z `AsyncState.data` (kryterium 7). */
  data: AppUser | null;
  user: AppUser | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  retry: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function toAppUser(firebaseUser: User): AppUser {
  return { uid: firebaseUser.uid, email: firebaseUser.email };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const applyAuthUser = useCallback(async (firebaseUser: User | null) => {
    if (firebaseUser) {
      const token = await firebaseUser.getIdToken();
      await saveAuthToken(token);
      setUser(toAppUser(firebaseUser));
    } else {
      await clearAuthToken();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setError(null);
      try {
        await applyAuthUser(firebaseUser);
      } catch (e) {
        if (__DEV__) {
          console.warn('[Auth] onAuthStateChanged side effect failed:', e);
        }
        setUser(firebaseUser ? toAppUser(firebaseUser) : null);
        setError('Nie udało się przywrócić sesji. Spróbuj ponownie.');
      } finally {
        setIsLoading(false);
      }
    });
    return unsub;
  }, [applyAuthUser]);

  const retry = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      await auth.authStateReady();
      await applyAuthUser(auth.currentUser);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Nie udało się przywrócić sesji.');
    } finally {
      setIsLoading(false);
    }
  }, [applyAuthUser]);

  const loginWithEmailAction = useCallback(async (email: string, password: string) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const normalized = email.trim();
      if (!normalized || !password) {
        setError('Podaj email i hasło.');
        return;
      }
      await firebaseSignIn(normalized, password);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Wystąpił błąd logowania.');
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const registerWithEmailAction = useCallback(async (email: string, password: string) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const normalized = email.trim();
      if (!normalized.includes('@')) {
        setError('Nieprawidłowy email.');
        return;
      }
      if (password.length < 6) {
        setError('Hasło musi mieć min. 6 znaków.');
        return;
      }
      await firebaseRegister(normalized, password);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Wystąpił błąd rejestracji.');
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await signOutUser();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Nie udało się wylogować.');
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      data: user,
      user,
      isLoading,
      isSubmitting,
      error,
      loginWithEmail: loginWithEmailAction,
      registerWithEmail: registerWithEmailAction,
      logout,
      clearError,
      retry,
    }),
    [
      user,
      isLoading,
      isSubmitting,
      error,
      loginWithEmailAction,
      registerWithEmailAction,
      logout,
      clearError,
      retry,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
