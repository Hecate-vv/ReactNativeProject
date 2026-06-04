import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { formatDisplayDate } from '@/lib/cycle/format';
import {
  getNotificationPermissionState,
  setNotificationPermissionState,
} from '@/lib/storage/notification-permission-state';

const PERIOD_REMINDER_IDENTIFIER = 'period-reminder-v1';
const PERIOD_CHANNEL_ID = 'period-reminders';

let channelReady = false;

async function ensureAndroidNotificationChannel(): Promise<void> {
  if (Platform.OS !== 'android' || channelReady) return;

  await Notifications.setNotificationChannelAsync(PERIOD_CHANNEL_ID, {
    name: 'Przypomnienia o okresie',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    sound: 'default',
  });
  channelReady = true;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

let onPermissionDenied: (() => void) | null = null;

export function setNotificationPermissionDeniedHandler(
  handler: (() => void) | null
) {
  onPermissionDenied = handler;
}

function mapSystemStatus(
  status: Notifications.PermissionStatus
): 'granted' | 'denied' | 'unknown' {
  if (status === 'granted') return 'granted';
  if (status === 'denied') return 'denied';
  return 'unknown';
}

/** Auto flow: tylko odczyt statusu systemowego — bez systemowego prompta. */
export async function ensureNotificationPermissionsAuto(): Promise<boolean> {
  await ensureAndroidNotificationChannel();

  const { status } = await Notifications.getPermissionsAsync();
  const mapped = mapSystemStatus(status);

  if (mapped === 'granted') {
    await setNotificationPermissionState('granted');
    return true;
  }

  if (mapped === 'denied') {
    await setNotificationPermissionState('denied');
    return false;
  }

  const stored = await getNotificationPermissionState();
  if (stored.status === 'denied') {
    return false;
  }

  return false;
}

/** Manual flow (Ustawienia): świadoma prośba o zgodę + zapis decyzji. */
export async function requestNotificationPermissionsManual(): Promise<boolean> {
  await ensureAndroidNotificationChannel();

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') {
    await setNotificationPermissionState('granted');
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  const granted = status === 'granted';
  const now = new Date().toISOString();

  await setNotificationPermissionState(granted ? 'granted' : 'denied', now);

  if (!granted) {
    onPermissionDenied?.();
  }
  return granted;
}

/** @deprecated Użyj requestNotificationPermissionsManual — zachowane dla kompatybilności. */
export async function requestNotificationPermissions(): Promise<boolean> {
  return requestNotificationPermissionsManual();
}

export async function cancelAllPeriodReminders(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(
    PERIOD_REMINDER_IDENTIFIER
  ).catch(() => {
    // Brak zaplanowanego — ignoruj
  });
}

/** Natychmiastowe powiadomienie po zapisie okresu — informacja o przewidywanej dacie. */
export async function sendImmediatePredictionNotice(
  predictedDate: Date
): Promise<void> {
  const granted = await ensureNotificationPermissionsAuto();
  if (!granted) return;

  const formattedDate = formatDisplayDate(predictedDate);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Prognoza cyklu',
      body: `Przewidywany kolejny okres: ${formattedDate}`,
      ...(Platform.OS === 'android' ? { channelId: PERIOD_CHANNEL_ID } : {}),
    },
    trigger: null,
  });
}

/** Jedno aktywne przypomnienie — rano w dniu przewidywanego okresu (9:00). */
export async function schedulePeriodReminder(
  predictedDate: Date
): Promise<void> {
  const granted = await ensureNotificationPermissionsAuto();
  if (!granted) return;

  await cancelAllPeriodReminders();

  const triggerDate = new Date(predictedDate);
  triggerDate.setHours(9, 0, 0, 0);

  const now = new Date();
  if (triggerDate.getTime() <= now.getTime()) {
    return;
  }

  await Notifications.scheduleNotificationAsync({
    identifier: PERIOD_REMINDER_IDENTIFIER,
    content: {
      title: 'Przypomnienie',
      body: 'Zbliża się przewidywany początek okresu',
      ...(Platform.OS === 'android' ? { channelId: PERIOD_CHANNEL_ID } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    },
  });
}
