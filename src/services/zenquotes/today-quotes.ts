import type { Quote } from '@/types/quote';

/** Cytaty z kategorii „Today” na zenquotes.io/keywords/today (fallback bez klucza API). */
export const TODAY_KEYWORD_QUOTES: Quote[] = [
  {
    text: 'Hope is important because it can make the present moment less difficult to bear.',
    author: 'Thich Nhat Hanh',
  },
  {
    text: 'The goal is not to be perfect by the end, the goal is to be better today.',
    author: 'Simon Sinek',
  },
  {
    text: 'A tiny change today brings a dramatically different tomorrow.',
    author: 'Richard Bach',
  },
  {
    text: 'What you do today can improve all your tomorrows.',
    author: 'Ralph Marston',
  },
  {
    text: 'The future depends on what you do today.',
    author: 'Mahatma Gandhi',
  },
  {
    text: 'Yesterday is gone. Tomorrow has not yet come. We have only today.',
    author: 'Mother Teresa',
  },
  {
    text: "Today is the oldest you've ever been, and the youngest you'll ever be again.",
    author: 'Eleanor Roosevelt',
  },
  {
    text: 'Remember, today is the tomorrow you worried about yesterday.',
    author: 'Dale Carnegie',
  },
  {
    text: "Don't let yesterday take up too much of today.",
    author: 'Will Rogers',
  },
  {
    text: "Today will never happen again. Don't waste it with a false start or no start at all.",
    author: 'Og Mandino',
  },
];

export function pickDailyQuoteFromList(
  quotes: Quote[],
  dateKey: string
): Quote {
  if (quotes.length === 0) {
    return { text: 'We have only today.', author: 'Unknown' };
  }
  let hash = 0;
  for (let i = 0; i < dateKey.length; i += 1) {
    hash = (hash + dateKey.charCodeAt(i) * (i + 1)) % quotes.length;
  }
  return quotes[hash] ?? quotes[0];
}
