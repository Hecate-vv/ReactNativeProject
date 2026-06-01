import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Quote } from '@/types/quote';

const CACHE_PREFIX = '@quote_today_v1_';

export async function getCachedQuote(dateKey: string): Promise<Quote | null> {
  const raw = await AsyncStorage.getItem(`${CACHE_PREFIX}${dateKey}`);
  return raw ? (JSON.parse(raw) as Quote) : null;
}

export async function setCachedQuote(dateKey: string, quote: Quote) {
  await AsyncStorage.setItem(`${CACHE_PREFIX}${dateKey}`, JSON.stringify(quote));
}

export function getTodayDateKey(): string {
  return new Date().toISOString().split('T')[0];
}
