import { mapFirestoreError } from '@/services/firebase/map-firebase-error';

describe('mapFirestoreError', () => {
  it('maps permission-denied', () => {
    expect(mapFirestoreError({ code: 'permission-denied' })).toContain(
      'uprawnień'
    );
  });

  it('maps auth network errors', () => {
    expect(
      mapFirestoreError({ code: 'auth/network-request-failed' })
    ).toContain('internetu');
  });
});
