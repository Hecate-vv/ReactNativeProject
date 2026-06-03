/** Wspólny kształt stanu dla operacji asynchronicznych (kryterium 7). */
export type AsyncState<T> = {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  retry: () => void;
};
