import type { Cycle } from '@/types/cycle';

export function parseIsoDate(iso: string): Date {
  return new Date(`${iso}T12:00:00`);
}

export function eachDayInRange(startIso: string, endIso: string): string[] {
  const days: string[] = [];
  const current = parseIsoDate(startIso);
  const end = parseIsoDate(endIso);

  while (current <= end) {
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, '0');
    const d = String(current.getDate()).padStart(2, '0');
    days.push(`${y}-${m}-${d}`);
    current.setDate(current.getDate() + 1);
  }

  return days;
}

export function findCycleForDate(
  cycles: Cycle[],
  iso: string
): Cycle | undefined {
  return cycles.find((cycle) => {
    const end = cycle.endDate ?? cycle.startDate;
    return iso >= cycle.startDate && iso <= end;
  });
}

export function rangesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  return startA <= endB && startB <= endA;
}

export function cycleOverlapsExisting(
  cycles: Cycle[],
  startDate: string,
  endDate: string,
  excludeId?: string
): boolean {
  return cycles.some((cycle) => {
    if (excludeId && cycle.id === excludeId) return false;
    const end = cycle.endDate ?? cycle.startDate;
    return rangesOverlap(startDate, endDate, cycle.startDate, end);
  });
}

type PeriodMark = {
  startingDay?: boolean;
  endingDay?: boolean;
  color: string;
  textColor: string;
};

export function applyRangeMarks(
  marked: Record<string, PeriodMark>,
  startIso: string,
  endIso: string,
  color: string,
  textColor: string
) {
  const days = eachDayInRange(startIso, endIso);
  days.forEach((iso, index) => {
    marked[iso] = {
      color,
      textColor,
      startingDay: index === 0,
      endingDay: index === days.length - 1,
    };
  });
}

export function buildPeriodMarkedDates(
  cycles: Cycle[],
  draftStart: string | null,
  draftEnd: string | null,
  periodColor: string,
  periodTextColor: string,
  draftColor: string,
  draftTextColor: string
): Record<string, PeriodMark> {
  const marked: Record<string, PeriodMark> = {};

  for (const cycle of cycles) {
    const end = cycle.endDate ?? cycle.startDate;
    applyRangeMarks(marked, cycle.startDate, end, periodColor, periodTextColor);
  }

  if (draftStart) {
    const end = draftEnd ?? draftStart;
    if (draftEnd && draftEnd >= draftStart) {
      applyRangeMarks(marked, draftStart, end, draftColor, draftTextColor);
    } else {
      applyRangeMarks(
        marked,
        draftStart,
        draftStart,
        draftColor,
        draftTextColor
      );
    }
  }

  return marked;
}

export function formatCycleRange(cycle: Cycle): string {
  if (cycle.endDate && cycle.endDate !== cycle.startDate) {
    return `${cycle.startDate} → ${cycle.endDate}`;
  }
  return `${cycle.startDate} (tylko start)`;
}
