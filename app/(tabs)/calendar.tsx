import React, { useCallback, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  HelperText,
  List,
  Text,
  TextInput,
} from 'react-native-paper';

import { MonthCalendar } from '@/components/cycle/month-calendar';
import { findCycleForDate, formatCycleRange } from '@/lib/cycle/period-range';
import { useCycles } from '@/hooks/use-cycles';

function isViewingSavedCycle(
  cycle: { startDate: string; endDate?: string } | undefined,
  draftStart: string | null,
  draftEnd: string | null,
): boolean {
  if (!cycle || !draftStart) return false;
  return (
    cycle.startDate === draftStart && (cycle.endDate ?? null) === (draftEnd ?? null)
  );
}

export default function CalendarScreen() {
  const { cycles, isLoading, error, addCycle, removeCycle, retry } = useCycles();

  const [draftStart, setDraftStart] = useState<string | null>(null);
  const [draftEnd, setDraftEnd] = useState<string | null>(null);
  const [visibleMonth, setVisibleMonth] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const clearDraft = useCallback(() => {
    setDraftStart(null);
    setDraftEnd(null);
    setFormError(null);
    setNotes('');
  }, []);

  const openSavedCycle = useCallback((cycle: (typeof cycles)[0]) => {
    setDraftStart(cycle.startDate);
    setDraftEnd(cycle.endDate ?? null);
    setVisibleMonth(cycle.startDate);
    setFormError(null);
  }, []);

  const handleDayPress = useCallback(
    (iso: string) => {
      setFormError(null);

      const existing = findCycleForDate(cycles, iso);
      if (existing) {
        openSavedCycle(existing);
        return;
      }

      if (!draftStart) {
        setDraftStart(iso);
        setDraftEnd(null);
        return;
      }

      if (!draftEnd) {
        if (iso < draftStart) {
          setDraftStart(iso);
          return;
        }
        setDraftEnd(iso);
        return;
      }

      setDraftStart(iso);
      setDraftEnd(null);
    },
    [cycles, draftStart, draftEnd, openSavedCycle],
  );

  const savedCycle = useMemo(() => {
    if (!draftStart) return undefined;
    return cycles.find((c) => c.startDate === draftStart);
  }, [cycles, draftStart]);

  const viewingSaved = isViewingSavedCycle(savedCycle, draftStart, draftEnd);

  const handleSave = async () => {
    if (!draftStart) return;
    setFormError(null);
    const ok = await addCycle(draftStart, draftEnd ?? undefined, notes.trim() || undefined);
    if (ok) clearDraft();
  };

  const handleDelete = () => {
    const cycle = savedCycle;
    if (!cycle) return;

    Alert.alert('Usunąć okres?', formatCycleRange(cycle), [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Usuń',
        style: 'destructive',
        onPress: async () => {
          await removeCycle(cycle.id);
          clearDraft();
        },
      },
    ]);
  };

  const selectionHint = useMemo(() => {
    if (viewingSaved && savedCycle) {
      return `Zapisany okres: ${formatCycleRange(savedCycle)}`;
    }
    if (!draftStart) return 'Krok 1: wybierz dzień startu okresu.';
    if (!draftEnd) return 'Krok 2: wybierz dzień końca (albo zapisz sam start).';
    return `Podgląd: ${draftStart} → ${draftEnd}`;
  }, [draftStart, draftEnd, viewingSaved, savedCycle]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineMedium">Kalendarz</Text>
      <Text style={styles.subtle}>
        Start + koniec zaznaczają cały okres. Kliknij zapisany dzień, aby usunąć wpis.
      </Text>

      <Card style={styles.card}>
        <Card.Content>
          <MonthCalendar
            cycles={cycles}
            draftStart={viewingSaved ? null : draftStart}
            draftEnd={viewingSaved ? null : draftEnd}
            visibleMonth={visibleMonth}
            onSelectDate={handleDayPress}
          />
          <Text variant="bodySmall" style={styles.hint}>
            {selectionHint}
          </Text>
        </Card.Content>
      </Card>

      {draftStart && (
        <Card style={styles.card}>
          <Card.Content style={styles.form}>
            <Text variant="titleSmall">
              Start: {draftStart}
              {draftEnd ? `  ·  Koniec: ${draftEnd}` : '  ·  Koniec: (nie wybrano)'}
            </Text>

            {viewingSaved && savedCycle ? (
              <>
                <List.Item
                  title="Zapisany okres"
                  description={savedCycle.notes ?? formatCycleRange(savedCycle)}
                  left={(props) => <List.Icon {...props} icon="water" />}
                />
                <Button mode="outlined" textColor="#c62828" onPress={handleDelete} disabled={isLoading}>
                  Usuń ten okres
                </Button>
                <Button mode="text" onPress={clearDraft}>
                  Zamknij
                </Button>
              </>
            ) : (
              <>
                <TextInput
                  mode="outlined"
                  label="Notatka (opcjonalnie)"
                  value={notes}
                  onChangeText={setNotes}
                />
                <HelperText type="error" visible={!!formError || !!error}>
                  {formError ?? error ?? ' '}
                </HelperText>
                <Button mode="contained" onPress={handleSave} disabled={isLoading}>
                  Zapisz okres
                </Button>
                <Button mode="text" onPress={clearDraft}>
                  Wyczyść wybór
                </Button>
              </>
            )}
          </Card.Content>
        </Card>
      )}

      {isLoading && <ActivityIndicator animating style={styles.loader} />}

      {cycles.length > 0 && (
        <Card style={styles.card}>
          <Card.Title title="Zapisane okresy" />
          <Card.Content>
            {cycles.slice(0, 8).map((item) => (
              <List.Item
                key={item.id}
                title={formatCycleRange(item)}
                description={item.notes ?? 'Okres menstruacyjny'}
                left={(props) => <List.Icon {...props} icon="calendar" />}
                onPress={() => openSavedCycle(item)}
              />
            ))}
          </Card.Content>
        </Card>
      )}

      {error && !draftStart && (
        <View style={styles.errorRow}>
          <Text style={styles.errorText}>{error}</Text>
          <Button onPress={retry}>Spróbuj ponownie</Button>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12, paddingBottom: 32 },
  subtle: { opacity: 0.75 },
  hint: { marginTop: 8, opacity: 0.8 },
  card: { marginBottom: 4 },
  form: { gap: 8 },
  loader: { marginVertical: 8 },
  errorRow: { gap: 8 },
  errorText: { color: '#c62828' },
});
