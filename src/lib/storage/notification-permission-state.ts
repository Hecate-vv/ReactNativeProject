import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@notifications_permission_state_v1';
const PROMPT_COOLDOWN_MS = 24 * 60 * 60 * 1000;

export type NotificationPermissionStoredStatus = 'granted' | 'denied' | 'unknown';

export type NotificationPermissionState = {
  status: NotificationPermissionStoredStatus;
  lastPromptAt: string | null;
};

const defaultState: NotificationPermissionState = {
  status: 'unknown',
  lastPromptAt: null,
};

export async function getNotificationPermissionState(): Promise<NotificationPermissionState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as NotificationPermissionState;
    if (!parsed?.status) return defaultState;
    return {
      status: parsed.status,
      lastPromptAt: parsed.lastPromptAt ?? null,
    };
  } catch {
    return defaultState;
  }
}

export async function setNotificationPermissionState(
  status: NotificationPermissionStoredStatus,
  lastPromptAt: string | null = null,
): Promise<void> {
  const payload: NotificationPermissionState = { status, lastPromptAt };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function isNotificationPromptCooldownActive(lastPromptAt: string | null): boolean {
  if (!lastPromptAt) return false;
  const elapsed = Date.now() - new Date(lastPromptAt).getTime();
  return elapsed < PROMPT_COOLDOWN_MS;
}
