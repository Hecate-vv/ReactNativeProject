import type { Cycle } from '@/types/cycle';

export type CycleState = {
  cycles: Cycle[];
  isLoading: boolean;
  error: string | null;
  isFromCache: boolean;
};

export type CycleAction =
  | { type: 'FETCH_START' }
  | {
      type: 'FETCH_SUCCESS';
      payload: { cycles: Cycle[]; isFromCache: boolean };
    }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'SET_CYCLES'; payload: { cycles: Cycle[]; isFromCache: boolean } };

export const initialCycleState: CycleState = {
  cycles: [],
  isLoading: false,
  error: null,
  isFromCache: false,
};

export function cycleReducer(
  state: CycleState,
  action: CycleAction
): CycleState {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, isLoading: true, error: null };
    case 'FETCH_SUCCESS':
      return {
        cycles: action.payload.cycles,
        isLoading: false,
        error: null,
        isFromCache: action.payload.isFromCache,
      };
    case 'FETCH_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    case 'SET_CYCLES':
      return {
        cycles: action.payload.cycles,
        isLoading: false,
        error: null,
        isFromCache: action.payload.isFromCache,
      };
    default:
      return state;
  }
}
