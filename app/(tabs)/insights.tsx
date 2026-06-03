import React, { useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { ActivityIndicator, Button, Card, Divider, List, Text } from 'react-native-paper';

import { OfflineCacheBanner } from '@/components/common/offline-cache-banner';
import {
  calculateAverageBleedingLength,
  calculateAverageCycleLength,
  daysUntil,
  getLatestCycleStart,
  predictNextPeriod,
} from '@/lib/cycle/calculations';
import { formatCycleRange, parseIsoDate } from '@/lib/cycle/period-range';
import { formatDaysLabel, formatDisplayDate } from '@/lib/cycle/format';
import { useCycles } from '@/hooks/use-cycles';

export default function InsightsScreen() {
  const { cycles, isLoading, error, retry, isFromCache, isOffline } = useCycles();

  const stats = useMemo(() => {
    const startDates = cycles.map((c) => parseIsoDate(c.startDate));
    const averageCycle = calculateAverageCycleLength(startDates);
    const averageBleeding = calculateAverageBleedingLength(cycles);
    const lastStart = getLatestCycleStart(cycles);

    let predictedNext: Date | null = null;
    let daysToNext: number | null = null;

    if (lastStart && averageCycle !== null) {
      predictedNext = predictNextPeriod(lastStart, averageCycle);
      daysToNext = daysUntil(predictedNext);
    }

    return { averageCycle, averageBleeding, predictedNext, daysToNext, count: cycles.length };
  }, [cycles]);

  if (isLoading && cycles.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator animating size="large" />
        <Text style={styles.subtle}>Ładowanie statystyk…</Text>
      </View>
    );
  }

  if (error && cycles.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={retry}>
          Spróbuj ponownie
        </Button>
      </View>
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.flex}>
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.container}
      data={cycles}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <>
          <Text variant="headlineMedium">Statystyki</Text>
          <Text style={styles.subtle}>Na podstawie dat startu okresów z kalendarza.</Text>
          <OfflineCacheBanner isFromCache={isFromCache} isOffline={isOffline} />

          {error ? (
            <Card style={styles.errorCard}>
              <Card.Content style={styles.errorCardContent}>
                <Text style={styles.errorText}>{error}</Text>
                <Button mode="contained" onPress={retry}>
                  Spróbuj ponownie
                </Button>
              </Card.Content>
            </Card>
          ) : null}

          <Card style={styles.card}>
            <Card.Content style={styles.statsGrid}>
              <StatBlock label="Zapisane okresy" value={String(stats.count)} />
              <StatBlock
                label="Średni cykl"
                value={
                  stats.averageCycle !== null ? `${stats.averageCycle} dni` : 'min. 2 wpisy'
                }
              />
              <StatBlock
                label="Średnie krwawienie"
                value={
                  stats.averageBleeding !== null
                    ? `${stats.averageBleeding} dni`
                    : 'dodaj koniec okresu'
                }
              />
              <StatBlock
                label="Przewidywany okres"
                value={
                  stats.predictedNext
                    ? formatDisplayDate(stats.predictedNext)
                    : stats.count === 0
                      ? 'brak danych'
                      : 'min. 2 wpisy'
                }
                hint={
                  stats.daysToNext !== null ? formatDaysLabel(stats.daysToNext) : undefined
                }
              />
            </Card.Content>
          </Card>

          {cycles.length > 0 && (
            <>
              <Divider style={styles.divider} />
              <Text variant="titleMedium">Historia okresów</Text>
            </>
          )}
        </>
      }
      ListEmptyComponent={
        <Text style={styles.subtle}>Dodaj okresy w zakładce Kalendarz, aby zobaczyć statystyki.</Text>
      }
      renderItem={({ item }) => (
        <List.Item
          title={formatCycleRange(item)}
          description={item.notes ?? 'Okres menstruacyjny'}
          left={(props) => <List.Icon {...props} icon="chart-timeline-variant" />}
        />
      )}
    />
    </Animated.View>
  );
}

function StatBlock({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <View style={styles.statBlock}>
      <Text variant="labelMedium" style={styles.statLabel}>
        {label}
      </Text>
      <Text variant="titleLarge" style={styles.statValue}>
        {value}
      </Text>
      {hint ? (
        <Text variant="bodySmall" style={styles.statHint}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { flex: 1 },
  container: { padding: 16, gap: 8, paddingBottom: 32 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16, gap: 12 },
  subtle: { opacity: 0.75, marginBottom: 8 },
  card: { marginVertical: 8 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  statBlock: { width: '45%', gap: 2 },
  statLabel: { opacity: 0.7 },
  statValue: { fontWeight: '600' },
  statHint: { opacity: 0.65 },
  divider: { marginVertical: 12 },
  errorText: { color: '#c62828', textAlign: 'center' },
  errorCard: { marginVertical: 8 },
  errorCardContent: { gap: 8 },
});
