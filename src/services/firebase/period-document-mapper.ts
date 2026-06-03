import type { Period } from '@/types/period';

export type TimestampLike = { toDate(): Date };

const INVALID_PERIOD_DOC_ERROR = 'Nieprawidłowy dokument okresu w Firestore.';

export function timestampToDateOnly(timestamp: TimestampLike): string {
  const d = timestamp.toDate();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function timestampToIso(timestamp: TimestampLike | undefined): string | undefined {
  return timestamp?.toDate().toISOString();
}

export function mapDocToPeriod(id: string, data: Record<string, unknown>): Period {
  const startTs = data.startDate as TimestampLike | undefined;
  const endTs = data.endDate as TimestampLike | undefined;
  const createdTs = data.createdAt as TimestampLike | undefined;
  const updatedTs = data.updatedAt as TimestampLike | undefined;

  if (!startTs || !endTs) {
    throw new Error(INVALID_PERIOD_DOC_ERROR);
  }

  return {
    id,
    startDate: timestampToDateOnly(startTs),
    endDate: timestampToDateOnly(endTs),
    note: typeof data.note === 'string' ? data.note : '',
    createdAt: timestampToIso(createdTs) ?? new Date().toISOString(),
    updatedAt: timestampToIso(updatedTs),
  };
}
