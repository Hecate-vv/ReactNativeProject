import {
  mapDocToPeriod,
  timestampToDateOnly,
} from '@/services/firebase/period-document-mapper';

function mockTs(isoLocal: string) {
  return { toDate: () => new Date(isoLocal) };
}

describe('timestampToDateOnly', () => {
  it('formats local calendar date from Timestamp-like value', () => {
    expect(timestampToDateOnly(mockTs('2026-06-03T12:00:00'))).toBe('2026-06-03');
  });
});

describe('mapDocToPeriod', () => {
  it('maps Firestore document with default empty note', () => {
    const period = mapDocToPeriod('abc', {
      startDate: mockTs('2026-01-01T12:00:00'),
      endDate: mockTs('2026-01-05T12:00:00'),
      createdAt: mockTs('2026-01-01T08:00:00'),
      updatedAt: mockTs('2026-01-01T08:00:00'),
    });

    expect(period).toMatchObject({
      id: 'abc',
      startDate: '2026-01-01',
      endDate: '2026-01-05',
      note: '',
    });
    expect(period.createdAt).toContain('2026');
  });

  it('throws when timestamps are missing', () => {
    expect(() => mapDocToPeriod('x', { note: '' })).toThrow(
      'Nieprawidłowy dokument okresu w Firestore.',
    );
  });
});
