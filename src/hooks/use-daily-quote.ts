import { useCallback, useEffect, useState } from 'react';

import { useNetwork } from '@/hooks/use-network';
import { getCachedQuote, getTodayDateKey, setCachedQuote } from '@/services/zenquotes/cache';
import { fetchDailyQuote } from '@/services/zenquotes/client';
import { pickDailyQuoteFromList, TODAY_KEYWORD_QUOTES } from '@/services/zenquotes/today-quotes';
import type { Quote } from '@/types/quote';

export function useDailyQuote() {
  const [data, setData] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isConnected } = useNetwork();

  const load = useCallback(async () => {
    const today = getTodayDateKey();
    setIsLoading(true);
    setError(null);

    try {
      const cached = await getCachedQuote(today);
      if (cached) {
        setData(cached);
        return;
      }

      if (!isConnected) {
        throw new Error('Brak połączenia z internetem');
      }

      const quote = await fetchDailyQuote();
      await setCachedQuote(today, quote);
      setData(quote);
    } catch (e) {
      const stale = await getCachedQuote(today);
      if (stale) {
        setData(stale);
      } else {
        // Offline / błąd API — lokalna lista kategorii Today
        setData(pickDailyQuoteFromList(TODAY_KEYWORD_QUOTES, today));
      }
    } finally {
      setIsLoading(false);
    }
  }, [isConnected]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, isLoading, error, retry: load };
}
