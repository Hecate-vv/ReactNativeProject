import { buildPeriodMarkedDates } from '@/lib/cycle/period-range';
import type { Cycle } from '@/types/cycle';

/** Kolory zakresu okresu w kalendarzu (zapisany vs podgląd wyboru). */
export const PERIOD_COLORS = {
  saved: { fill: '#FCE4EC', text: '#AD1457' },
  draft: { fill: '#F8BBD0', text: '#880E4F' },
} as const;

export function buildCalendarMarkedDates(
  cycles: Cycle[],
  draftStart: string | null,
  draftEnd: string | null,
) {
  return buildPeriodMarkedDates(
    cycles,
    draftStart,
    draftEnd,
    PERIOD_COLORS.saved.fill,
    PERIOD_COLORS.saved.text,
    PERIOD_COLORS.draft.fill,
    PERIOD_COLORS.draft.text,
  );
}
