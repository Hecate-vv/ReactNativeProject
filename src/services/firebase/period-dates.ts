import { Timestamp } from 'firebase/firestore';

/** Konwersja YYYY-MM-DD → Timestamp (lokalna południe — spójne z parseIsoDate w UI). */
export function dateOnlyToTimestamp(dateOnly: string): Timestamp {
  return Timestamp.fromDate(new Date(`${dateOnly}T12:00:00`));
}
