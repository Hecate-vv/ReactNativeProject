import { useCallback, useEffect, useState } from 'react';

import { useNetwork } from '@/hooks/use-network';
import { getCachedQuote, getTodayDateKey, setCachedQuote } from '@/services/zenquotes/cache';
import { fetchDailyQuote } from '@/services/zenquotes/client';
import type { Quote } from '@/types/quote';

export function useDailyQuote() {
  const [data, setData] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);
  const { isConnected } = useNetwork();

  const load = useCallback(async () => {
    const today = getTodayDateKey();
    setIsLoading(true);
    setError(null);
    setIsFromCache(false);

    try {
      const cached = await getCachedQuote(today);
      if (cached) {
        setData(cached);
        setIsFromCache(true);
        return;
      }

      if (!isConnected) {
        setData(null);
        setError('Brak internetu i brak zapisanego cytatu na dziś.');
        return;
      }

      const quote = await fetchDailyQuote();
      await setCachedQuote(today, quote);
      setData(quote);
      setIsFromCache(false);
    } catch (e) {
      const stale = await getCachedQuote(today);
      if (stale) {
        setData(stale);
        setIsFromCache(true);
        setError(null);
      } else {
        setData(null);
        setError(e instanceof Error ? e.message : 'Błąd pobierania cytatu');
      }
    } finally {
      setIsLoading(false);
    }
  }, [isConnected]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, isLoading, error, isFromCache, isOffline: !isConnected, retry: load };
}
