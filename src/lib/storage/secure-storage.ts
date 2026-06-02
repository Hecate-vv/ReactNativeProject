import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'firebase_id_token';

let availabilityCache: boolean | null = null;

/** SecureStore na web / częściowych shimach nie ma pełnego API (np. delete). */
async function isSecureStoreAvailable(): Promise<boolean> {
  if (availabilityCache !== null) return availabilityCache;
  try {
    if (Platform.OS === 'web') {
      availabilityCache = false;
      return false;
    }
    availabilityCache = await SecureStore.isAvailableAsync();
    return availabilityCache;
  } catch {
    availabilityCache = false;
    return false;
  }
}

export async function saveAuthToken(token: string): Promise<void> {
  try {
    if (!(await isSecureStoreAvailable())) return;
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch (e) {
    if (__DEV__) {
      console.warn('[SecureStore] saveAuthToken:', e);
    }
  }
}

export async function getAuthToken(): Promise<string | null> {
  try {
    if (!(await isSecureStoreAvailable())) return null;
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (e) {
    if (__DEV__) {
      console.warn('[SecureStore] getAuthToken:', e);
    }
    return null;
  }
}

export async function clearAuthToken(): Promise<void> {
  try {
    if (!(await isSecureStoreAvailable())) return;
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch (e) {
    // Np. deleteValueWithKeyAsync is not a function — auth i tak działa przez Firebase session.
    if (__DEV__) {
      console.warn('[SecureStore] clearAuthToken:', e);
    }
  }
}
