import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { onAuthStateChanged } from 'firebase/auth';

import { clearAuthToken, saveAuthToken } from '@/lib/storage/secure-storage';
import { loginWithEmail, logoutFirebase, registerWithEmail } from '@/services/firebase/auth';
import { auth } from '@/services/firebase/config';
import { mapFirebaseError } from '@/services/firebase/map-firebase-error';

export type AppUser = { uid: string; email: string | null };

type AuthContextValue = {
  user: AppUser | null;
  isLoading: boolean;
  error: string | null;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        await saveAuthToken(token);
        setUser({ uid: firebaseUser.uid, email: firebaseUser.email });
      } else {
        await clearAuthToken();
        setUser(null);
      }
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  const loginWithEmailAction = useCallback(async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);
    try {
      await loginWithEmail(email.trim(), password);
    } catch (e) {
      setError(mapFirebaseError(e));
      setIsLoading(false);
    }
  }, []);

  const registerWithEmailAction = useCallback(async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);
    try {
      await registerWithEmail(email.trim(), password);
    } catch (e) {
      setError(mapFirebaseError(e));
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setError(null);
    setIsLoading(true);
    logoutFirebase().catch(() => {
      // jeśli logout się nie uda, onAuthStateChanged i tak trzyma nas w spójnym stanie
      setIsLoading(false);
    });
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      error,
      loginWithEmail: loginWithEmailAction,
      registerWithEmail: registerWithEmailAction,
      logout,
      clearError,
    }),
    [user, isLoading, error, loginWithEmailAction, registerWithEmailAction, logout, clearError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

