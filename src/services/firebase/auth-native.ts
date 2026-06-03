import AsyncStorage from '@react-native-async-storage/async-storage';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import { getAuth, initializeAuth } from 'firebase/auth';

type ReactNativePersistenceFactory = (
  storage: typeof AsyncStorage,
) => Parameters<typeof initializeAuth>[1] extends { persistence?: infer P } ? P : never;

// Metro resolves @firebase/auth → dist/rn; typy webowego `firebase/auth` tego nie eksportują.
// eslint-disable-next-line @typescript-eslint/no-require-imports -- RN-only export z @firebase/auth
const { getReactNativePersistence } = require('@firebase/auth') as {
  getReactNativePersistence: ReactNativePersistenceFactory;
};

let authInstance: Auth | null = null;

/** RN: najpierw initializeAuth z AsyncStorage — getAuth() bez persistence wywołuje ostrzeżenie Firebase. */
export function getFirebaseAuth(app: FirebaseApp): Auth {
  if (authInstance) return authInstance;

  try {
    authInstance = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
    return authInstance;
  } catch {
    authInstance = getAuth(app);
    return authInstance;
  }
}
