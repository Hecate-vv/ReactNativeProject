import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { ActivityIndicator, Button, Card, Text } from 'react-native-paper';

import type { Quote } from '@/types/quote';

type DailyQuoteCardProps = {
  quote: Quote | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  isFromCache?: boolean;
};

export const DailyQuoteCard = memo(function DailyQuoteCard({
  quote,
  isLoading,
  error,
  onRetry,
  isFromCache,
}: DailyQuoteCardProps) {
  if (isLoading) {
    return (
      <Card style={styles.card}>
        <Card.Content style={styles.centered}>
          <ActivityIndicator animating size="large" />
          <Text style={styles.subtle}>Ładowanie cytatu…</Text>
        </Card.Content>
      </Card>
    );
  }

  if (error) {
    return (
      <Card style={styles.card}>
        <Card.Content style={styles.centered}>
          <Text style={styles.error}>{error}</Text>
          <Button mode="contained" onPress={onRetry}>
            Spróbuj ponownie
          </Button>
        </Card.Content>
      </Card>
    );
  }

  if (!quote) return null;

  return (
    <Animated.View entering={FadeIn.duration(400)}>
      <Card style={styles.card}>
        <Card.Title
          title="Cytat dnia"
          subtitle={
            isFromCache
              ? 'ZenQuotes · zapisane lokalnie'
              : 'ZenQuotes · api/today'
          }
        />
        <Card.Content style={styles.content}>
          <Text variant="bodyLarge" style={styles.quote}>
            „{quote.text}”
          </Text>
          <Text variant="labelLarge" style={styles.author}>
            — {quote.author}
          </Text>
        </Card.Content>
      </Card>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: { marginBottom: 4 },
  content: { gap: 8 },
  quote: { fontStyle: 'italic', lineHeight: 24 },
  author: { opacity: 0.8, textAlign: 'right' },
  centered: { alignItems: 'center', gap: 12, paddingVertical: 16 },
  subtle: { opacity: 0.7 },
  error: { color: '#c62828', textAlign: 'center' },
});
