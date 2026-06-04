import {
  cycleReducer,
  initialCycleState,
  type CycleState,
} from '@/contexts/cycle-reducer';
import type { Cycle } from '@/types/cycle';

const sampleCycles: Cycle[] = [
  { id: 'a', startDate: '2026-02-01', createdAt: '2026-02-01' },
  { id: 'b', startDate: '2026-01-01', createdAt: '2026-01-01' },
];

describe('cycleReducer', () => {
  it('FETCH_START sets loading and clears error', () => {
    const state: CycleState = {
      ...initialCycleState,
      error: 'Poprzedni błąd',
      cycles: sampleCycles,
    };
    const next = cycleReducer(state, { type: 'FETCH_START' });
    expect(next).toEqual({
      cycles: sampleCycles,
      isLoading: true,
      error: null,
      isFromCache: false,
    });
  });

  it('FETCH_SUCCESS replaces cycles and clears loading', () => {
    const next = cycleReducer(initialCycleState, {
      type: 'FETCH_SUCCESS',
      payload: { cycles: sampleCycles, isFromCache: true },
    });
    expect(next).toEqual({
      cycles: sampleCycles,
      isLoading: false,
      error: null,
      isFromCache: true,
    });
  });

  it('FETCH_ERROR keeps existing cycles and stores message', () => {
    const state: CycleState = {
      ...initialCycleState,
      cycles: sampleCycles,
      isFromCache: true,
    };
    const next = cycleReducer(state, {
      type: 'FETCH_ERROR',
      payload: 'Brak internetu',
    });
    expect(next).toEqual({
      cycles: sampleCycles,
      isLoading: false,
      error: 'Brak internetu',
      isFromCache: true,
    });
  });

  it('SET_CYCLES updates list without marking cache source', () => {
    const next = cycleReducer(initialCycleState, {
      type: 'SET_CYCLES',
      payload: { cycles: sampleCycles, isFromCache: false },
    });
    expect(next).toEqual({
      cycles: sampleCycles,
      isLoading: false,
      error: null,
      isFromCache: false,
    });
  });
});
