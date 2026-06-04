import {
  isValidIsoDate,
  validatePeriodDateRange,
  validatePeriodInput,
  validatePeriodRange,
} from '@/lib/cycle/validation';
import type { Cycle } from '@/types/cycle';

describe('validatePeriodDateRange', () => {
  it('rejects endDate before startDate', () => {
    const result = validatePeriodDateRange('2026-06-10', '2026-06-05');
    expect(result).toEqual({
      valid: false,
      message:
        'Data zakończenia nie może być wcześniejsza niż data rozpoczęcia.',
    });
  });

  it('accepts same-day range', () => {
    expect(validatePeriodDateRange('2026-06-01', '2026-06-01')).toEqual({
      valid: true,
    });
  });

  it('rejects invalid ISO format', () => {
    const result = validatePeriodDateRange('06-01-2026', '2026-06-05');
    expect(result.valid).toBe(false);
  });
});

describe('validatePeriodInput', () => {
  it('validates full PeriodInput', () => {
    expect(
      validatePeriodInput({
        startDate: '2026-01-01',
        endDate: '2026-01-05',
        note: 'ok',
      })
    ).toEqual({ valid: true });
  });

  it('requires startDate when provided empty', () => {
    const result = validatePeriodInput({
      startDate: '  ',
      endDate: '2026-01-05',
    });
    expect(result.valid).toBe(false);
  });
});

describe('validatePeriodRange', () => {
  const existing: Cycle[] = [
    {
      id: 'existing-1',
      startDate: '2026-01-01',
      endDate: '2026-01-05',
      createdAt: '2026-01-01',
    },
  ];

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-06-03T12:00:00'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('rejects start date in the future', () => {
    const result = validatePeriodRange('2026-12-01', undefined, existing);
    expect(result).toEqual({
      valid: false,
      message: 'Data startu nie może być w przyszłości.',
    });
  });

  it('rejects range overlapping an existing period', () => {
    const result = validatePeriodRange('2026-01-03', '2026-01-07', existing);
    expect(result).toEqual({
      valid: false,
      message: 'Ten zakres nachodzi na inny zapisany okres.',
    });
  });

  it('accepts non-overlapping range before existing period', () => {
    expect(validatePeriodRange('2025-12-20', '2025-12-25', existing)).toEqual({
      valid: true,
    });
  });
});

describe('isValidIsoDate', () => {
  it('accepts YYYY-MM-DD', () => {
    expect(isValidIsoDate('2026-06-03')).toBe(true);
  });

  it('rejects malformed strings', () => {
    expect(isValidIsoDate('2026/06/03')).toBe(false);
  });
});
