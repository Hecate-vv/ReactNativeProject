import {
  calculateAverageBleedingLength,
  calculateAverageCycleLength,
  predictNextPeriod,
} from '@/lib/cycle/calculations';
import { getPredictedNextPeriodDate } from '@/lib/cycle/predict-next-from-cycles';
import type { Cycle } from '@/types/cycle';

describe('calculateAverageCycleLength', () => {
  it('returns average of 28, 30 and 29 day gaps between starts', () => {
    const dates = [
      new Date('2026-01-01'),
      new Date('2026-01-29'),
      new Date('2026-02-28'),
    ];
    expect(calculateAverageCycleLength(dates)).toBe(29);
  });

  it('returns null when fewer than two start dates', () => {
    expect(calculateAverageCycleLength([new Date('2026-01-01')])).toBeNull();
    expect(calculateAverageCycleLength([])).toBeNull();
  });

  it('sorts unsorted input before averaging', () => {
    const dates = [
      new Date('2026-02-28'),
      new Date('2026-01-01'),
      new Date('2026-01-29'),
    ];
    expect(calculateAverageCycleLength(dates)).toBe(29);
  });
});

describe('predictNextPeriod', () => {
  it('adds average cycle length days to last start', () => {
    const lastStart = new Date('2026-01-15');
    const predicted = predictNextPeriod(lastStart, 28);
    expect(predicted.toISOString().split('T')[0]).toBe('2026-02-12');
  });
});

describe('getPredictedNextPeriodDate', () => {
  const twoCycles: Cycle[] = [
    {
      id: '1',
      startDate: '2026-01-01',
      createdAt: '2026-01-01',
    },
    {
      id: '2',
      startDate: '2026-01-29',
      createdAt: '2026-01-29',
    },
  ];

  it('predicts next period when at least two cycles exist', () => {
    const predicted = getPredictedNextPeriodDate(twoCycles);
    expect(predicted).not.toBeNull();
    expect(predicted!.toISOString().split('T')[0]).toBe('2026-02-26');
  });

  it('returns null with zero or one cycle', () => {
    expect(getPredictedNextPeriodDate([])).toBeNull();
    expect(
      getPredictedNextPeriodDate([
        { id: '1', startDate: '2026-01-01', createdAt: '2026-01-01' },
      ])
    ).toBeNull();
  });
});

describe('calculateAverageBleedingLength', () => {
  it('averages inclusive bleeding days when endDate is set', () => {
    const cycles = [
      { startDate: '2026-01-01', endDate: '2026-01-05' },
      { startDate: '2026-02-01', endDate: '2026-02-03' },
    ];
    expect(calculateAverageBleedingLength(cycles)).toBe(4);
  });

  it('returns null when no cycle has endDate', () => {
    expect(
      calculateAverageBleedingLength([{ startDate: '2026-01-01' }])
    ).toBeNull();
  });
});
