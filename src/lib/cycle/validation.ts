import { cycleOverlapsExisting } from '@/lib/cycle/period-range';
import type { Cycle } from '@/types/cycle';
import type { PeriodInput, PeriodUpdate } from '@/types/period';

export type ValidationResult = { valid: true } | { valid: false; message: string };

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidIsoDate(value: string): boolean {
  if (!ISO_DATE_RE.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00`);
  return !Number.isNaN(parsed.getTime());
}

/** Walidacja pól PeriodInput / PeriodUpdate (format dat + relacja start/end). */
export function validatePeriodInput(input: PeriodInput | PeriodUpdate): ValidationResult {
  const { startDate, endDate, note } = input;

  if (startDate !== undefined) {
    if (!startDate.trim()) {
      return { valid: false, message: 'Data rozpoczęcia jest wymagana.' };
    }
    if (!isValidIsoDate(startDate)) {
      return { valid: false, message: 'Nieprawidłowa data rozpoczęcia.' };
    }
  }

  if (endDate !== undefined) {
    if (!endDate.trim()) {
      return { valid: false, message: 'Data zakończenia jest wymagana.' };
    }
    if (!isValidIsoDate(endDate)) {
      return { valid: false, message: 'Nieprawidłowa data zakończenia.' };
    }
  }

  if (note !== undefined && typeof note !== 'string') {
    return { valid: false, message: 'Notatka musi być tekstem.' };
  }

  if (startDate !== undefined && endDate !== undefined) {
    return validatePeriodDateRange(startDate, endDate);
  }

  return { valid: true };
}

/** Relacja dat przy create/update w Firestore (gdy obie daty są znane). */
export function validatePeriodDateRange(startDate: string, endDate: string): ValidationResult {
  if (!isValidIsoDate(startDate) || !isValidIsoDate(endDate)) {
    return { valid: false, message: 'Nieprawidłowy format daty (oczekiwano YYYY-MM-DD).' };
  }
  if (endDate < startDate) {
    return {
      valid: false,
      message: 'Data zakończenia nie może być wcześniejsza niż data rozpoczęcia.',
    };
  }
  return { valid: true };
}

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
