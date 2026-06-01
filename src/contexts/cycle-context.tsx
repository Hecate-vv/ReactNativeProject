import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';

import { useAuth } from '@/hooks/use-auth';
import { validatePeriodRange } from '@/lib/cycle/validation';
import type { Cycle } from '@/types/cycle';

type CycleState = {
  cycles: Cycle[];
  isLoading: boolean;
  error: string | null;
};

type CycleAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: Cycle[] }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'SET_CYCLES'; payload: Cycle[] };

function sortCycles(cycles: Cycle[]): Cycle[] {
  return [...cycles].sort((a, b) => b.startDate.localeCompare(a.startDate));
}

function cycleReducer(state: CycleState, action: CycleAction): CycleState {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, isLoading: true, error: null };
    case 'FETCH_SUCCESS':
      return { cycles: action.payload, isLoading: false, error: null };
    case 'FETCH_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    case 'SET_CYCLES':
      return { cycles: action.payload, isLoading: false, error: null };
    default:
      return state;
  }
}

type CycleContextValue = CycleState & {
  addCycle: (startDate: string, endDate?: string, notes?: string) => Promise<boolean>;
  removeCycle: (id: string) => Promise<void>;
  retry: () => void;
};

const CycleContext = createContext<CycleContextValue | null>(null);

function storageKey(uid: string) {
  return `@cycles_mock_v1_${uid}`;
}

async function persistCycles(uid: string, cycles: Cycle[]) {
  await AsyncStorage.setItem(storageKey(uid), JSON.stringify(cycles));
}

export function CycleProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(cycleReducer, {
    cycles: [],
    isLoading: false,
    error: null,
  });

  const loadCycles = useCallback(async () => {
    if (!user) {
      dispatch({ type: 'FETCH_SUCCESS', payload: [] });
      return;
    }
    dispatch({ type: 'FETCH_START' });
    try {
      const raw = await AsyncStorage.getItem(storageKey(user.uid));
      const cycles = raw ? (JSON.parse(raw) as Cycle[]) : [];
      dispatch({ type: 'FETCH_SUCCESS', payload: cycles });
    } catch {
      dispatch({ type: 'FETCH_ERROR', payload: 'Nie udało się wczytać wpisów.' });
    }
  }, [user]);

  useEffect(() => {
    loadCycles();
  }, [loadCycles]);

  const addCycle = useCallback(
    async (startDate: string, endDate?: string, notes?: string): Promise<boolean> => {
      if (!user) return false;

      const validation = validatePeriodRange(startDate, endDate, state.cycles);
      if (!validation.valid) {
        dispatch({ type: 'FETCH_ERROR', payload: validation.message });
        return false;
      }

      dispatch({ type: 'FETCH_START' });
      try {
        const cycle: Cycle = {
          id: `cycle_${Date.now()}`,
          startDate,
          endDate,
          notes,
          createdAt: new Date().toISOString(),
        };
        const next = sortCycles([cycle, ...state.cycles]);
        await persistCycles(user.uid, next);
        dispatch({ type: 'SET_CYCLES', payload: next });
        return true;
      } catch {
        dispatch({ type: 'FETCH_ERROR', payload: 'Nie udało się zapisać wpisu.' });
        return false;
      }
    },
    [user, state.cycles],
  );

  const removeCycle = useCallback(
    async (id: string) => {
      if (!user) return;
      dispatch({ type: 'FETCH_START' });
      try {
        const next = state.cycles.filter((c) => c.id !== id);
        await persistCycles(user.uid, next);
        dispatch({ type: 'SET_CYCLES', payload: next });
      } catch {
        dispatch({ type: 'FETCH_ERROR', payload: 'Nie udało się usunąć wpisu.' });
      }
    },
    [user, state.cycles],
  );

  const value = useMemo<CycleContextValue>(
    () => ({ ...state, addCycle, removeCycle, retry: loadCycles }),
    [state, addCycle, removeCycle, loadCycles],
  );

  return <CycleContext.Provider value={value}>{children}</CycleContext.Provider>;
}

export function useCycles() {
  const ctx = useContext(CycleContext);
  if (!ctx) throw new Error('useCycles must be used within CycleProvider');
  return ctx;
}
