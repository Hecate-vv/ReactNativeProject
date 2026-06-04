import AsyncStorage from '@react-native-async-storage/async-storage';

import { cachePeriods, getCachedPeriods } from '@/lib/storage/periods-cache';
import type { Period } from '@/types/period';

const sample: Period[] = [
  {
    id: 'p1',
    startDate: '2026-01-01',
    endDate: '2026-01-05',
    note: 'test',
    createdAt: '2026-01-01T10:00:00.000Z',
  },
];

describe('periods-cache', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('round-trips periods per user', async () => {
    await cachePeriods('user-a', sample);
    const loaded = await getCachedPeriods('user-a');
    expect(loaded).toEqual(sample);
  });

  it('isolates cache keys by userId', async () => {
    await cachePeriods('user-a', sample);
    expect(await getCachedPeriods('user-b')).toBeNull();
  });

  it('returns null when cache is missing', async () => {
    expect(await getCachedPeriods('missing')).toBeNull();
  });

  it('returns null for corrupted JSON', async () => {
    await AsyncStorage.setItem('@cycles_cache_v1_bad', '{not-json');
    expect(await getCachedPeriods('bad')).toBeNull();
  });

  it('returns null for invalid period shape', async () => {
    await AsyncStorage.setItem(
      '@cycles_cache_v1_bad',
      JSON.stringify([{ id: 1 }])
    );
    expect(await getCachedPeriods('bad')).toBeNull();
  });
});
