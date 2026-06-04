import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Period } from '@/types/period';

const CACHE_PREFIX = '@cycles_cache_v1_';

function cacheKey(userId: string): string {
  return `${CACHE_PREFIX}${userId}`;
}

function isPeriod(value: unknown): value is Period {
  if (!value || typeof value !== 'object') return false;
  const p = value as Record<string, unknown>;
  return (
    typeof p.id === 'string' &&
    typeof p.startDate === 'string' &&
    typeof p.endDate === 'string' &&
    typeof p.note === 'string' &&
    typeof p.createdAt === 'string'
  );
}

function parsePeriods(raw: string): Period[] | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    if (!parsed.every(isPeriod)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function cachePeriods(
  userId: string,
  periods: Period[]
): Promise<void> {
  await AsyncStorage.setItem(cacheKey(userId), JSON.stringify(periods));
}

export async function getCachedPeriods(
  userId: string
): Promise<Period[] | null> {
  const raw = await AsyncStorage.getItem(cacheKey(userId));
  if (!raw) return null;
  return parsePeriods(raw);
}
