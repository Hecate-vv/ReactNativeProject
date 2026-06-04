import { renderHook, waitFor } from '@testing-library/react-native';

import { useDailyQuote } from '@/hooks/use-daily-quote';
import * as networkHook from '@/hooks/use-network';
import * as quoteCache from '@/services/zenquotes/cache';
import * as quoteClient from '@/services/zenquotes/client';

jest.mock('@/hooks/use-network');
jest.mock('@/services/zenquotes/cache');
jest.mock('@/services/zenquotes/client');

const TODAY = '2026-06-03';
const cachedQuote = { text: 'Cached wisdom', author: 'Cache Author' };
const fetchedQuote = { text: 'Fresh quote', author: 'API Author' };

describe('useDailyQuote', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(quoteCache, 'getTodayDateKey').mockReturnValue(TODAY);
    jest
      .spyOn(networkHook, 'useNetwork')
      .mockReturnValue({ isConnected: true });
  });

  it('uses cache hit without calling API', async () => {
    jest.spyOn(quoteCache, 'getCachedQuote').mockResolvedValue(cachedQuote);

    const { result } = renderHook(() => useDailyQuote());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(cachedQuote);
    expect(result.current.isFromCache).toBe(true);
    expect(result.current.error).toBeNull();
    expect(quoteClient.fetchDailyQuote).not.toHaveBeenCalled();
  });

  it('shows error when offline and no cache exists', async () => {
    jest.spyOn(quoteCache, 'getCachedQuote').mockResolvedValue(null);
    jest
      .spyOn(networkHook, 'useNetwork')
      .mockReturnValue({ isConnected: false });

    const { result } = renderHook(() => useDailyQuote());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe(
      'Brak internetu i brak zapisanego cytatu na dziś.'
    );
    expect(quoteClient.fetchDailyQuote).not.toHaveBeenCalled();
  });

  it('fetches quote online and persists to cache', async () => {
    jest.spyOn(quoteCache, 'getCachedQuote').mockResolvedValue(null);
    jest.spyOn(quoteClient, 'fetchDailyQuote').mockResolvedValue(fetchedQuote);
    const setCached = jest
      .spyOn(quoteCache, 'setCachedQuote')
      .mockResolvedValue(undefined);

    const { result } = renderHook(() => useDailyQuote());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(quoteClient.fetchDailyQuote).toHaveBeenCalled();
    expect(setCached).toHaveBeenCalledWith(TODAY, fetchedQuote);
    expect(result.current.data).toEqual(fetchedQuote);
    expect(result.current.isFromCache).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('falls back to stale cache when fetch fails', async () => {
    jest
      .spyOn(quoteCache, 'getCachedQuote')
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(cachedQuote);
    jest
      .spyOn(quoteClient, 'fetchDailyQuote')
      .mockRejectedValue(new Error('ZenQuotes error: 429'));

    const { result } = renderHook(() => useDailyQuote());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(cachedQuote);
    expect(result.current.isFromCache).toBe(true);
    expect(result.current.error).toBeNull();
  });
});
