import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

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

const MOCK_USERS_KEY = '@mock_auth_users_v1';
const MOCK_SESSION_KEY = '@mock_auth_session_v1';

type MockUsersStore = Record<string, string>;

async function loadMockUsers(): Promise<MockUsersStore> {
  const raw = await AsyncStorage.getItem(MOCK_USERS_KEY);
  return raw ? (JSON.parse(raw) as MockUsersStore) : {};
}

async function saveMockUsers(users: MockUsersStore) {
  await AsyncStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Tryb demo: bez Firebase — sesja i konta trzymane lokalnie w AsyncStorage.
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(MOCK_SESSION_KEY);
        if (raw) {
          setUser(JSON.parse(raw) as AppUser);
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const persistSession = useCallback(async (next: AppUser | null) => {
    if (next) {
      await AsyncStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(next));
    } else {
      await AsyncStorage.removeItem(MOCK_SESSION_KEY);
    }
    setUser(next);
  }, []);

  const loginWithEmailAction = useCallback(async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const normalized = email.trim().toLowerCase();
      if (!normalized || !password) {
        setError('Podaj email i hasło.');
        return;
      }
      const users = await loadMockUsers();
      if (users[normalized] !== password) {
        setError('Nieprawidłowy email lub hasło.');
        return;
      }
      await persistSession({ uid: `mock_${normalized}`, email: normalized });
    } finally {
      setIsLoading(false);
    }
  }, [persistSession]);

  const registerWithEmailAction = useCallback(async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const normalized = email.trim().toLowerCase();
      if (!normalized.includes('@')) {
        setError('Nieprawidłowy email.');
        return;
      }
      if (password.length < 6) {
        setError('Hasło musi mieć min. 6 znaków.');
        return;
      }
      const users = await loadMockUsers();
      if (users[normalized]) {
        setError('Email jest już zajęty — zaloguj się.');
        return;
      }
      users[normalized] = password;
      await saveMockUsers(users);
      await persistSession({ uid: `mock_${normalized}`, email: normalized });
    } finally {
      setIsLoading(false);
    }
  }, [persistSession]);

  const logout = useCallback(() => {
    setError(null);
    persistSession(null);
  }, [persistSession]);

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
