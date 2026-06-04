import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';

import { validatePeriodDateRange } from '@/lib/cycle/validation';
import { db } from '@/services/firebase/config';
import { dateOnlyToTimestamp } from '@/services/firebase/period-dates';
import { mapDocToPeriod } from '@/services/firebase/period-document-mapper';
import type { Period, PeriodInput, PeriodUpdate } from '@/types/period';

export { mapDocToPeriod } from '@/services/firebase/period-document-mapper';
export type { Period, PeriodInput, PeriodUpdate } from '@/types/period';

function periodsCollection(userId: string) {
  return collection(db, 'users', userId, 'periods');
}

function periodDoc(userId: string, periodId: string) {
  return doc(db, 'users', userId, 'periods', periodId);
}

/** Eksportowane do testów mapowania dokumentów Firestore. */
export async function fetchPeriods(userId: string): Promise<Period[]> {
  const q = query(periodsCollection(userId), orderBy('startDate', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((document) =>
    mapDocToPeriod(document.id, document.data())
  );
}

export async function createPeriod(
  userId: string,
  input: PeriodInput
): Promise<Period> {
  const rangeCheck = validatePeriodDateRange(input.startDate, input.endDate);
  if (!rangeCheck.valid) {
    throw new Error(rangeCheck.message);
  }

  const ref = await addDoc(periodsCollection(userId), {
    startDate: dateOnlyToTimestamp(input.startDate),
    endDate: dateOnlyToTimestamp(input.endDate),
    note: input.note ?? '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) {
    throw new Error('Nie udało się odczytać nowo utworzonego okresu.');
  }

  return mapDocToPeriod(snapshot.id, snapshot.data());
}

export async function updatePeriod(
  userId: string,
  periodId: string,
  input: PeriodUpdate
): Promise<void> {
  const ref = periodDoc(userId, periodId);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    throw new Error('Okres nie istnieje.');
  }

  const existing = mapDocToPeriod(snapshot.id, snapshot.data());
  const nextStartDate = input.startDate ?? existing.startDate;
  const nextEndDate = input.endDate ?? existing.endDate;

  if (input.startDate !== undefined || input.endDate !== undefined) {
    const rangeCheck = validatePeriodDateRange(nextStartDate, nextEndDate);
    if (!rangeCheck.valid) {
      throw new Error(rangeCheck.message);
    }
  }

  const fields: Record<string, unknown> = { updatedAt: serverTimestamp() };

  if (input.startDate !== undefined) {
    fields.startDate = dateOnlyToTimestamp(input.startDate);
  }
  if (input.endDate !== undefined) {
    fields.endDate = dateOnlyToTimestamp(input.endDate);
  }
  if (input.note !== undefined) {
    fields.note = input.note;
  }

  await updateDoc(ref, fields);
}

export async function deletePeriod(
  userId: string,
  periodId: string
): Promise<void> {
  await deleteDoc(periodDoc(userId, periodId));
}

/**
 * Przykład użycia po zalogowaniu użytkownika:
 *
 * ```ts
 * import { auth } from '@/services/firebase/config';
 * import { createPeriod } from '@/services/firebase/periods';
 *
 * async function saveNewPeriod() {
 *   const user = auth.currentUser;
 *   if (!user) return;
 *
 *   const period = await createPeriod(user.uid, {
 *     startDate: '2026-06-01',
 *     endDate: '2026-06-05',
 *     note: 'Lekkie objawy',
 *   });
 *
 *   console.log('Zapisano okres:', period.id);
 * }
 * ```
 */
