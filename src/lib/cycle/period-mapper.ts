import type { Period, PeriodInput } from '@/types/period';
import type { Cycle } from '@/types/cycle';

/** Firestore Period → model UI (Cycle). */
export function periodToCycle(period: Period): Cycle {
  const singleDay = period.endDate === period.startDate;
  return {
    id: period.id,
    startDate: period.startDate,
    endDate: singleDay ? undefined : period.endDate,
    notes: period.note.trim() ? period.note : undefined,
    createdAt: period.createdAt,
  };
}

export function periodsToCycles(periods: Period[]): Cycle[] {
  return periods.map(periodToCycle);
}

/** Dane z formularza → PeriodInput dla Firestore. */
export function cycleToPeriodInput(
  startDate: string,
  endDate?: string,
  notes?: string
): PeriodInput {
  return {
    startDate,
    endDate: endDate ?? startDate,
    note: notes?.trim() ?? '',
  };
}
