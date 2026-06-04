import {
  isValidIsoDate,
  validatePeriodDateRange,
  validatePeriodInput,
} from '@/lib/cycle/validation';

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

describe('isValidIsoDate', () => {
  it('accepts YYYY-MM-DD', () => {
    expect(isValidIsoDate('2026-06-03')).toBe(true);
  });

  it('rejects malformed strings', () => {
    expect(isValidIsoDate('2026/06/03')).toBe(false);
  });
});
