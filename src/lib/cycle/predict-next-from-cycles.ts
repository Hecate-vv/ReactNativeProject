import {
  calculateAverageCycleLength,
  getLatestCycleStart,
  predictNextPeriod,
} from '@/lib/cycle/calculations';
import { parseIsoDate } from '@/lib/cycle/period-range';
import type { Cycle } from '@/types/cycle';

/** Przewidywana data następnego okresu lub null przy zbyt małej liczbie wpisów. */
export function getPredictedNextPeriodDate(cycles: Cycle[]): Date | null {
  const lastStart = getLatestCycleStart(cycles);
  if (!lastStart) return null;

  const startDates = cycles.map((c) => parseIsoDate(c.startDate));
  const average = calculateAverageCycleLength(startDates);
  if (average === null) return null;

  return predictNextPeriod(lastStart, average);
}
