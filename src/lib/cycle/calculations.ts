import { parseIsoDate } from '@/lib/cycle/period-range';

/** Średnia liczba dni między kolejnymi datami startu okresu. */
export function calculateAverageCycleLength(startDates: Date[]): number | null {
  if (startDates.length < 2) return null;

  const sorted = [...startDates].sort((a, b) => a.getTime() - b.getTime());
  const lengths: number[] = [];

  for (let i = 1; i < sorted.length; i++) {
    const diffMs = sorted[i].getTime() - sorted[i - 1].getTime();
    lengths.push(Math.round(diffMs / (1000 * 60 * 60 * 24)));
  }

  return Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length);
}

export function predictNextPeriod(
  lastStart: Date,
  averageLengthDays: number
): Date {
  const next = new Date(lastStart);
  next.setDate(next.getDate() + averageLengthDays);
  return next;
}

export function getLatestCycleStart(
  cycles: { startDate: string }[]
): Date | null {
  if (cycles.length === 0) return null;
  const sorted = [...cycles].sort((a, b) =>
    b.startDate.localeCompare(a.startDate)
  );
  return parseIsoDate(sorted[0].startDate);
}

export function daysUntil(date: Date, from = new Date()): number {
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffMs = target.getTime() - start.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/** Średnia długość krwawienia (gdy wpisy mają endDate). */
export function calculateAverageBleedingLength(
  cycles: { startDate: string; endDate?: string }[]
): number | null {
  const lengths = cycles
    .filter((c) => c.endDate)
    .map((c) => {
      const start = parseIsoDate(c.startDate);
      const end = parseIsoDate(c.endDate!);
      return (
        Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) +
        1
      );
    });

  if (lengths.length === 0) return null;
  return Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length);
}
