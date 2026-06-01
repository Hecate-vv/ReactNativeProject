import { cycleOverlapsExisting } from '@/lib/cycle/period-range';
import type { Cycle } from '@/types/cycle';

export type ValidationResult = { valid: true } | { valid: false; message: string };

export function validatePeriodRange(
  startDate: string,
  endDate: string | undefined,
  existingCycles: Cycle[],
): ValidationResult {
  const todayIso = new Date().toISOString().split('T')[0];

  if (startDate > todayIso) {
    return { valid: false, message: 'Data startu nie może być w przyszłości.' };
  }

  if (endDate && endDate < startDate) {
    return { valid: false, message: 'Koniec okresu musi być w tym samym dniu lub później niż start.' };
  }

  if (endDate && endDate > todayIso) {
    return { valid: false, message: 'Data końca nie może być w przyszłości.' };
  }

  const rangeEnd = endDate ?? startDate;
  if (cycleOverlapsExisting(existingCycles, startDate, rangeEnd)) {
    return { valid: false, message: 'Ten zakres nachodzi na inny zapisany okres.' };
  }

  return { valid: true };
}
