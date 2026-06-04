import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';

import { DailyQuoteCard } from '@/components/common/daily-quote-card';

const quote = { text: 'Test quote', author: 'Test Author' };

function renderCard(
  props: Partial<React.ComponentProps<typeof DailyQuoteCard>> = {}
) {
  const onRetry = jest.fn();
  render(
    <PaperProvider>
      <DailyQuoteCard
        quote={null}
        isLoading={false}
        error={null}
        onRetry={onRetry}
        {...props}
      />
    </PaperProvider>
  );
  return { onRetry };
}

describe('DailyQuoteCard', () => {
  it('shows loading state with spinner text', () => {
    renderCard({ isLoading: true });
    expect(screen.getByText('Ładowanie cytatu…')).toBeTruthy();
  });

  it('shows error message and calls onRetry when user taps retry', () => {
    const { onRetry } = renderCard({
      error: 'Nie udało się pobrać cytatu',
    });
    expect(screen.getByText('Nie udało się pobrać cytatu')).toBeTruthy();
    fireEvent.press(screen.getByText('Spróbuj ponownie'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('renders quote and author on success', () => {
    renderCard({ quote });
    expect(screen.getByText('„Test quote”')).toBeTruthy();
    expect(screen.getByText('— Test Author')).toBeTruthy();
    expect(screen.getByText('ZenQuotes · api/today')).toBeTruthy();
  });

  it('shows cache subtitle when quote comes from local storage', () => {
    renderCard({ quote, isFromCache: true });
    expect(screen.getByText('ZenQuotes · zapisane lokalnie')).toBeTruthy();
  });
});
