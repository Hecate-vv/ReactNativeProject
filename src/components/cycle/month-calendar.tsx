import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { Calendar, type DateData } from 'react-native-calendars';
import { useTheme } from 'react-native-paper';

import { buildCalendarMarkedDates } from '@/lib/cycle/calendar-marking';
import '@/lib/cycle/calendar-locale';
import type { Cycle } from '@/types/cycle';

type MonthCalendarProps = {
  cycles: Cycle[];
  draftStart: string | null;
  draftEnd: string | null;
  visibleMonth?: string | null;
  onSelectDate: (iso: string) => void;
};

export function MonthCalendar({
  cycles,
  draftStart,
  draftEnd,
  visibleMonth,
  onSelectDate,
}: MonthCalendarProps) {
  const theme = useTheme();

  const markedDates = useMemo(
    () => buildCalendarMarkedDates(cycles, draftStart, draftEnd),
    [cycles, draftStart, draftEnd]
  );

  const calendarTheme = useMemo(
    () => ({
      backgroundColor: theme.colors.surface,
      calendarBackground: theme.colors.surface,
      textSectionTitleColor: theme.colors.onSurfaceVariant,
      selectedDayBackgroundColor: theme.colors.primary,
      selectedDayTextColor: theme.colors.onPrimary,
      todayTextColor: theme.colors.primary,
      dayTextColor: theme.colors.onSurface,
      textDisabledColor: theme.colors.outline,
      arrowColor: theme.colors.primary,
      monthTextColor: theme.colors.onSurface,
      textDayFontWeight: '500' as const,
      textMonthFontWeight: '700' as const,
      textDayHeaderFontWeight: '600' as const,
    }),
    [theme]
  );

  const current = visibleMonth ?? draftEnd ?? draftStart ?? undefined;

  return (
    <Calendar
      key={current ?? 'default'}
      current={current}
      markingType="period"
      markedDates={markedDates}
      onDayPress={(day: DateData) => onSelectDate(day.dateString)}
      firstDay={1}
      enableSwipeMonths
      theme={calendarTheme}
      style={styles.calendar}
    />
  );
}

const styles = StyleSheet.create({
  calendar: {
    borderRadius: 12,
  },
});
