import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, Text } from 'react-native-paper';

import { DailyQuoteCard } from '@/components/common/daily-quote-card';
import { OfflineCacheBanner } from '@/components/common/offline-cache-banner';
import {
  calculateAverageCycleLength,
  daysUntil,
  getLatestCycleStart,
  predictNextPeriod,
} from '@/lib/cycle/calculations';
import { formatDaysLabel, formatDisplayDate } from '@/lib/cycle/format';
import { parseIsoDate } from '@/lib/cycle/period-range';
import { useAuth } from '@/hooks/use-auth';
import { useCycles } from '@/hooks/use-cycles';
import { useDailyQuote } from '@/hooks/use-daily-quote';

export default function HomeScreen() {
  const { user } = useAuth();
  const {
    cycles,
    isLoading: cyclesLoading,
    error: cyclesError,
    retry: retryCycles,
    isFromCache: cyclesFromCache,
    isOffline,
  } = useCycles();
  const {
    data: quote,
    isLoading,
    error,
    retry,
    isFromCache: quoteFromCache,
  } = useDailyQuote();

  const cycleInfo = useMemo(() => {
    const startDates = cycles.map((c) => parseIsoDate(c.startDate));
    const average = calculateAverageCycleLength(startDates);
    const lastStart = getLatestCycleStart(cycles);

    if (!lastStart || average === null) {
      return cycles.length === 0
        ? 'Dodaj okresy w Kalendarzu, aby zobaczyć przewidywania.'
        : 'Potrzebujesz min. 2 wpisy startu okresu, aby przewidzieć następny.';
    }

    const predicted = predictNextPeriod(lastStart, average);
    const days = daysUntil(predicted);
    return `Przewidywany okres: ${formatDisplayDate(predicted)} (${formatDaysLabel(days)})`;
  }, [cycles]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineMedium">Home</Text>
      <Text style={styles.subtle}>
        Cześć, {user?.email ?? 'użytkowniczko'}!
      </Text>

      <OfflineCacheBanner isFromCache={quoteFromCache} isOffline={isOffline} />
      <DailyQuoteCard
        quote={quote}
        isLoading={isLoading}
        error={error}
        onRetry={retry}
        isFromCache={quoteFromCache}
      />

      <Card style={styles.card}>
        <Card.Title title="Twój cykl" />
        <Card.Content>
          <OfflineCacheBanner
            isFromCache={cyclesFromCache}
            isOffline={isOffline}
          />
          {cyclesLoading && cycles.length === 0 ? (
            <ActivityIndicator animating style={styles.cycleLoader} />
          ) : cyclesError && cycles.length === 0 ? (
            <View style={styles.cycleError}>
              <Text style={styles.errorText}>{cyclesError}</Text>
              <Button mode="contained" onPress={retryCycles}>
                Spróbuj ponownie
              </Button>
            </View>
          ) : (
            <>
              <Text>{cycleInfo}</Text>
              {cycles.length > 0 && (
                <Text style={styles.subtle}>
                  Ostatni start:{' '}
                  {formatDisplayDate(getLatestCycleStart(cycles)!)}
                </Text>
              )}
            </>
          )}
          {cyclesError && cycles.length > 0 ? (
            <View style={styles.cycleErrorBanner}>
              <Text style={styles.errorText}>{cyclesError}</Text>
              <Button compact mode="text" onPress={retryCycles}>
                Odśwież
              </Button>
            </View>
          ) : null}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12, paddingBottom: 32 },
  subtle: { opacity: 0.75 },
  card: { marginBottom: 4 },
  cycleLoader: { marginVertical: 8 },
  cycleError: { gap: 8 },
  cycleErrorBanner: { marginTop: 12, gap: 4 },
  errorText: { color: '#c62828' },
});
