# Cycle Tracker

Aplikacja do śledzenia cyklu menstruacyjnego z Firebase i codzienną afirmacją ZenQuotes.

## Technologie

- Expo SDK 54, expo-router, React Native Paper
- Firebase Auth (email/hasło) + Firestore (`users/{uid}/periods`)
- ZenQuotes API, AsyncStorage (cache offline), expo-notifications, expo-haptics, expo-secure-store

## Wymagania

- Node.js 20+
- Konto Expo, projekt Firebase

## Uruchomienie

1. `git clone <repo-url>`
2. `npm install`
3. Skopiuj `.env.example` → `.env` i uzupełnij klucze Firebase
4. `npx expo start` → Expo Go

## Zmienne środowiskowe

| Zmienna | Opis |
|---|---|
| `EXPO_PUBLIC_FIREBASE_API_KEY` | Klucz API Firebase (publiczny w bundlu klienta) |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | Domena Auth |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | ID projektu |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | Bucket Storage |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Sender ID |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | App ID |

## Firestore — okresy

Ścieżka: `users/{userId}/periods/{periodId}`

Pola w dokumencie:

- `startDate`, `endDate` — `Timestamp`
- `note` — string (domyślnie `''`)
- `createdAt`, `updatedAt` — `serverTimestamp()`

Serwis: [`src/services/firebase/periods.ts`](src/services/firebase/periods.ts)

Reguły: [`firestore.rules`](firestore.rules) — wdroż w Firebase Console (`firebase deploy --only firestore:rules`).

### Przykład: zapis po zalogowaniu

```typescript
import { auth } from '@/services/firebase/config';
import { createPeriod } from '@/services/firebase/periods';

async function saveNewPeriod() {
  const user = auth.currentUser;
  if (!user) return;

  const period = await createPeriod(user.uid, {
    startDate: '2026-06-01',
    endDate: '2026-06-05',
    note: 'Lekkie objawy',
  });

  console.log('Zapisano okres:', period.id);
}
```

## Tryb offline

### Co działa bez internetu (po wcześniejszym pobraniu online)

| Dane | Mechanizm | Klucz cache |
|---|---|---|
| Okresy | `fetchPeriods` → `cachePeriods` → odczyt z AsyncStorage | `@cycles_cache_v1_{uid}` |
| Cytat dnia | cache-first w `useDailyQuote` | `@quote_today_v1_{data}` |

### Zachowanie UI

- Baner **„Dane z pamięci urządzenia”** na Home, Kalendarzu i Statystykach (`isFromCache`).
- Snackbar przy utracie sieci: *„Brak internetu — wyświetlane są dane zapisane lokalnie”*.
- **Zapis i usuwanie okresów wymagają internetu** — mutacje offline nie są kolejkowane.

### Świadome ograniczenia (poza zakresem)

- Brak pełnej synchronizacji offline→online (kolejka mutacji, konflikty).
- Brak automatycznego retry zapisów po powrocie sieci.
- Cytat na **nowy dzień** bez internetu i bez wcześniejszego cache → komunikat błędu.

## Bezpieczeństwo

### Mechanizmy

| Obszar | Implementacja |
|---|---|
| Konfiguracja Firebase | Wyłącznie `EXPO_PUBLIC_*` w `.env` (nie commituj `.env`) |
| Token sesji | `expo-secure-store` — [`src/lib/storage/secure-storage.ts`](src/lib/storage/secure-storage.ts) |
| Dane okresów offline | AsyncStorage (niezaszyfrowane — tylko cache odczytu) |
| API zewnętrzne | Wyłącznie HTTPS (`zenquotes.io`) |
| Firestore | Reguły: użytkownik widzi tylko `users/{własnyUid}/periods/*` |
| Walidacja wejścia | `validatePeriodInput`, `validatePeriodRange` przed zapisem |

### Ryzyka i mitigacje

| Ryzyko | Mitigacja |
|---|---|
| Klucze `EXPO_PUBLIC_*` są widoczne w APK | Ograniczenia API w Google Cloud + **Firestore Security Rules** |
| Dane zdrowotne w AsyncStorage (plain JSON) | Cache tylko do odczytu offline; nie logować zawartości; wrażliwe tokeny w SecureStore |
| Firebase Auth persistence w AsyncStorage (standard RN) | Dokumentacja; brak duplikowania tokenów w dodatkowych kluczach |
| Brak szyfrowania cache okresów | Akceptowane w MVP; pełna kolejka sync — rozszerzenie |

## Testy

```bash
npm test
```

Obejmują m.in.: cache okresów, walidację dat, mapowanie `Timestamp` ↔ `YYYY-MM-DD`.

## Build produkcyjny

```bash
eas build --platform android --profile preview
```

## Mapa kryteriów (skrót)

| Kryterium | Implementacja |
|---|---|
| 13 Offline | Cache okresów + cytatu, banery UI |
| 14 Bezpieczeństwo | SecureStore, ENV, HTTPS, reguły Firestore |
| A Backend | Firestore CRUD `periods` |
| C API zewnętrzne | ZenQuotes + cache dzienny |
