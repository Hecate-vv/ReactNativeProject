import * as Haptics from 'expo-haptics';
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
import { useNetwork } from '@/hooks/use-network';
import {
  cycleToPeriodInput,
  periodToCycle,
  periodsToCycles,
} from '@/lib/cycle/period-mapper';
import { getPredictedNextPeriodDate } from '@/lib/cycle/predict-next-from-cycles';
import {
  validatePeriodInput,
  validatePeriodRange,
} from '@/lib/cycle/validation';
import { cachePeriods, getCachedPeriods } from '@/lib/storage/periods-cache';
import { playUiSfx } from '@/services/audio/sfx';
import { mapFirestoreError } from '@/services/firebase/map-firebase-error';
import {
  createPeriod,
  deletePeriod,
  fetchPeriods,
} from '@/services/firebase/periods';
import {
  cancelAllPeriodReminders,
  schedulePeriodReminder,
  sendImmediatePredictionNotice,
} from '@/services/notifications/scheduler';
import type { Cycle } from '@/types/cycle';
import type { Period } from '@/types/period';

const OFFLINE_MUTATION_MESSAGE =
  'Brak internetu. Zapis i usuwanie wymagają połączenia online.';

type CycleState = {
  cycles: Cycle[];
  isLoading: boolean;
  error: string | null;
  isFromCache: boolean;
};

type CycleAction =
  | { type: 'FETCH_START' }
  | {
      type: 'FETCH_SUCCESS';
      payload: { cycles: Cycle[]; isFromCache: boolean };
    }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'SET_CYCLES'; payload: { cycles: Cycle[]; isFromCache: boolean } };

function sortCycles(cycles: Cycle[]): Cycle[] {
  return [...cycles].sort((a, b) => b.startDate.localeCompare(a.startDate));
}

function cycleReducer(state: CycleState, action: CycleAction): CycleState {
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

type CycleContextValue = CycleState & {
  /** Alias `cycles` — spójny z `AsyncState.data` (kryterium 7). */
  data: Cycle[];
  isOffline: boolean;
  addCycle: (
    startDate: string,
    endDate?: string,
    notes?: string
  ) => Promise<boolean>;
  removeCycle: (id: string) => Promise<void>;
  retry: () => void;
};

const CycleContext = createContext<CycleContextValue | null>(null);

async function syncPeriodReminder(cycles: Cycle[]) {
  try {
    await cancelAllPeriodReminders();
    const predicted = getPredictedNextPeriodDate(cycles);
    if (predicted) {
      await schedulePeriodReminder(predicted);
    }
  } catch {
    // Odmowa uprawnień / błąd schedulera — nie blokuj zapisu cyklu
  }
}

function applyPeriodsToCycles(periods: Period[]): Cycle[] {
  return sortCycles(periodsToCycles(periods));
}

export function CycleProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { isConnected } = useNetwork();
  const [state, dispatch] = useReducer(cycleReducer, {
    cycles: [],
    isLoading: false,
    error: null,
    isFromCache: false,
  });

  const applyCachedPeriods = useCallback(
    async (userId: string): Promise<boolean> => {
      const cached = await getCachedPeriods(userId);
      if (cached === null) {
        return false;
      }
      const cycles = applyPeriodsToCycles(cached);
      dispatch({
        type: 'FETCH_SUCCESS',
        payload: { cycles, isFromCache: true },
      });
      await syncPeriodReminder(cycles);
      return true;
    },
    []
  );

  const persistCache = useCallback(
    async (userId: string, periods: Period[]) => {
      await cachePeriods(userId, periods);
    },
    []
  );

  const refresh = useCallback(async () => {
    const userId = user?.uid;
    if (!userId) {
      dispatch({
        type: 'FETCH_SUCCESS',
        payload: { cycles: [], isFromCache: false },
      });
      return;
    }

    dispatch({ type: 'FETCH_START' });

    if (!isConnected) {
      const loaded = await applyCachedPeriods(userId);
      if (!loaded) {
        dispatch({
          type: 'FETCH_ERROR',
          payload: 'Brak internetu i brak zapisanych danych offline.',
        });
      }
      return;
    }

    try {
      const periods = await fetchPeriods(userId);
      await persistCache(userId, periods);
      const cycles = applyPeriodsToCycles(periods);
      dispatch({
        type: 'FETCH_SUCCESS',
        payload: { cycles, isFromCache: false },
      });
      await syncPeriodReminder(cycles);
    } catch (error) {
      const loaded = await applyCachedPeriods(userId);
      if (loaded) {
        return;
      }
      dispatch({
        type: 'FETCH_ERROR',
        payload: mapFirestoreError(error),
      });
    }
  }, [user?.uid, isConnected, applyCachedPeriods, persistCache]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const assertCanMutate = useCallback(() => {
    if (!isConnected) {
      throw new Error(OFFLINE_MUTATION_MESSAGE);
    }
  }, [isConnected]);

  const addCycle = useCallback(
    async (
      startDate: string,
      endDate?: string,
      notes?: string
    ): Promise<boolean> => {
      if (!user) {
        dispatch({
          type: 'FETCH_ERROR',
          payload: 'Musisz być zalogowana, aby zapisać okres.',
        });
        return false;
      }

      try {
        assertCanMutate();
      } catch (e) {
        dispatch({
          type: 'FETCH_ERROR',
          payload: e instanceof Error ? e.message : OFFLINE_MUTATION_MESSAGE,
        });
        return false;
      }

      const validation = validatePeriodRange(startDate, endDate, state.cycles);
      if (!validation.valid) {
        dispatch({ type: 'FETCH_ERROR', payload: validation.message });
        return false;
      }

      const periodInput = cycleToPeriodInput(startDate, endDate, notes);
      const inputCheck = validatePeriodInput(periodInput);
      if (!inputCheck.valid) {
        dispatch({ type: 'FETCH_ERROR', payload: inputCheck.message });
        return false;
      }

      dispatch({ type: 'FETCH_START' });
      try {
        const period = await createPeriod(user.uid, periodInput);
        const cycle = periodToCycle(period);
        const next = sortCycles([
          cycle,
          ...state.cycles.filter((c) => c.id !== cycle.id),
        ]);
        dispatch({
          type: 'SET_CYCLES',
          payload: { cycles: next, isFromCache: false },
        });

        const periods = await fetchPeriods(user.uid);
        await persistCache(user.uid, periods);
        const synced = applyPeriodsToCycles(periods);
        dispatch({
          type: 'SET_CYCLES',
          payload: { cycles: synced, isFromCache: false },
        });

        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
        void playUiSfx();

        const predicted = getPredictedNextPeriodDate(synced);
        if (predicted) {
          try {
            await sendImmediatePredictionNotice(predicted);
          } catch {
            // Best-effort — brak uprawnień nie blokuje zapisu
          }
        }
        await syncPeriodReminder(synced);
        return true;
      } catch (error) {
        dispatch({ type: 'FETCH_ERROR', payload: mapFirestoreError(error) });
        return false;
      }
    },
    [user, state.cycles, assertCanMutate, persistCache]
  );

  const removeCycle = useCallback(
    async (id: string) => {
      if (!user) return;

      try {
        assertCanMutate();
      } catch (e) {
        dispatch({
          type: 'FETCH_ERROR',
          payload: e instanceof Error ? e.message : OFFLINE_MUTATION_MESSAGE,
        });
        return;
      }

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

      dispatch({ type: 'FETCH_START' });
      try {
        await deletePeriod(user.uid, id);
        const periods = await fetchPeriods(user.uid);
        await persistCache(user.uid, periods);
        const synced = applyPeriodsToCycles(periods);
        dispatch({
          type: 'SET_CYCLES',
          payload: { cycles: synced, isFromCache: false },
        });
        void playUiSfx();
        await syncPeriodReminder(synced);
      } catch (error) {
        dispatch({ type: 'FETCH_ERROR', payload: mapFirestoreError(error) });
      }
    },
    [user, assertCanMutate, persistCache]
  );

  const value = useMemo<CycleContextValue>(
    () => ({
      ...state,
      data: state.cycles,
      isOffline: !isConnected,
      addCycle,
      removeCycle,
      retry: refresh,
    }),
    [state, isConnected, addCycle, removeCycle, refresh]
  );

  return (
    <CycleContext.Provider value={value}>{children}</CycleContext.Provider>
  );
}

export function useCycles() {
  const ctx = useContext(CycleContext);
  if (!ctx) throw new Error('useCycles must be used within CycleProvider');
  return ctx;
}
