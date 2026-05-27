import React, { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export type AppUser = { uid: string; email: string | null };

type AuthContextValue = {
  user: AppUser | null;
  isLoading: boolean;
  error: string | null;
  loginMock: (email: string) => void;
  logout: () => void;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Na razie nic async. Gdy podepniemy Firebase, tu będzie onAuthStateChanged + token SecureStore.
  const isLoading = false;

  const loginMock = useCallback((email: string) => {
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Podaj email.');
      return;
    }
    setError(null);
    setUser({ uid: 'mock_uid', email: trimmed });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isLoading, error, loginMock, logout, clearError }),
    [user, isLoading, error, loginMock, logout, clearError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

