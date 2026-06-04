import type { Quote } from '@/types/quote';

import { pickDailyQuoteFromList, TODAY_KEYWORD_QUOTES } from './today-quotes';

const TODAY_API_URL = 'https://zenquotes.io/api/today';
const KEYWORD = 'today';
const API_KEY = process.env.EXPO_PUBLIC_ZENQUOTES_API_KEY;

type ZenQuoteResponse = { q: string; a: string };

function parseQuote(data: ZenQuoteResponse): Quote {
  return { text: data.q, author: data.a };
}

function isErrorResponse(data: ZenQuoteResponse): boolean {
  return (
    data.a === 'zenquotes.io' || data.q.toLowerCase().includes('unauthorized')
  );
}

/** Darmowy endpoint — jeden cytat dziennie (bez klucza API). */
export async function fetchDailyQuote(): Promise<Quote> {
  const res = await fetch(TODAY_API_URL);
  if (!res.ok) throw new Error(`ZenQuotes error: ${res.status}`);
  const data = (await res.json()) as ZenQuoteResponse[];
  const item = data[0];
  if (!item || isErrorResponse(item)) {
    throw new Error('ZenQuotes: nieprawidłowa odpowiedź');
  }
  return parseQuote(item);
}

async function fetchKeywordQuote(dateKey: string): Promise<Quote | null> {
  if (!API_KEY) return null;

  const url = `https://zenquotes.io/api/quotes/${API_KEY}&keyword=${KEYWORD}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`ZenQuotes error: ${res.status}`);
  const data = (await res.json()) as ZenQuoteResponse[];
  const valid = data.filter((item) => !isErrorResponse(item));
  if (valid.length === 0) return null;
  return pickDailyQuoteFromList(valid.map(parseQuote), dateKey);
}

/** Najpierw darmowe API, potem opcjonalnie kategoria „Today” z kluczem, na końcu lista lokalna. */
export async function fetchTodayKeywordQuote(dateKey: string): Promise<Quote> {
  try {
    return await fetchDailyQuote();
  } catch {
    // rate limit / offline — próbuj dalej
  }

  try {
    const fromKeyword = await fetchKeywordQuote(dateKey);
    if (fromKeyword) return fromKeyword;
  } catch {
    // keyword wymaga płatnego klucza — fallback poniżej
  }

  return pickDailyQuoteFromList(TODAY_KEYWORD_QUOTES, dateKey);
}
