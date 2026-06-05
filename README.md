# Cycle Tracker

Aplikacja do śledzenia cyklu menstruacyjnego z Firebase i codzienną afirmacją ZenQuotes.

## Dokumentacja kodu i projektu

### Kluczowe zalozenia projektu

- Aplikacja ma wspierac codzienna regularnosc wpisow, bo to podnosi jakosc predykcji
  i zmniejsza niepewnosc uzytkowniczki.
- Dane cyklu sa prywatne per konto, bo separacja danych jest krytyczna dla zaufania i
  bezpieczenstwa w aplikacji zdrowotnej.
- Architektura jest podzielona warstwowo, bo rozdzielenie UI, logiki domenowej i
  integracji z API ulatwia testowanie oraz szybkie poprawki.
- Dzialanie online/offline jest przewidziane od poczatku, bo codzienny nawyk nie moze
  zalezec od stalego dostepu do internetu.

### Technologie

- Expo SDK 54, Expo Router, React Native Paper
- Firebase Auth + Firestore
- ZenQuotes API
- AsyncStorage, SecureStore, NetInfo, Notifications, Haptics, Reanimated

### Zaleznosci

- Runtime: `expo`, `react`, `react-native`, `firebase`, `expo-router`,
  `react-native-paper`, `@react-native-async-storage/async-storage`,
  `expo-secure-store`, `expo-notifications`, `expo-haptics`,
  `@react-native-community/netinfo`, `react-native-reanimated`
- Dev: `typescript`, `eslint`, `prettier`, `jest`, `@testing-library/react-native`

### Uruchomienie

1. `git clone <repo-url>`
2. `cd ReactNativeProject`
3. `npx expo install`
4. Skopiuj `.env.example` -> `.env` i uzupelnij klucze:
   - `EXPO_PUBLIC_FIREBASE_API_KEY`
   - `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
   - `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `EXPO_PUBLIC_FIREBASE_APP_ID`
5. `npx expo start`

### Opis funkcjonalnosci

- Rejestracja i logowanie uzytkownika (Firebase Auth)
- Zapisywanie i usuwanie okresow (Firestore, dane per user)
- Predykcja kolejnego okresu i statystyki cyklu
- Dzienny cytat/afirmacja z ZenQuotes
- Podstawowy tryb offline (odczyt z cache)
- Powiadomienia lokalne + haptic feedback

### Kluczowe funkcje i komponenty

- `AuthProvider` (`src/contexts/auth-context.tsx`) - trzyma sesje globalnie, bo
  unikamy duplikowania logiki autoryzacji na kazdym ekranie i redukujemy ryzyko
  niespojnego stanu logowania.
- `CycleProvider` (`src/contexts/cycle-context.tsx`) - centralizuje operacje na
  wpisach cyklu, bo predykcja i statystyki musza korzystac z jednego zrodla prawdy.
- `useDailyQuote` + `daily-quote-card.tsx` - oddzielaja pobieranie danych od
  prezentacji, bo dzieki temu latwiej utrzymac fallback offline i testowac UI bez
  zaleznosci sieciowych.
- `month-calendar.tsx` - wizualizuje wpisy i przewidywania w jednym miejscu, bo
  decyzje uzytkowniczki (dodanie/edycja dat) sa szybsze, gdy kontekst czasu jest
  od razu widoczny.
- `offline-cache-banner.tsx` - jasno komunikuje stan polaczenia, bo transparentnosc
  wobec zrodla danych buduje zaufanie i zapobiega blednej interpretacji wynikow.
- `src/lib/cycle/*` (logika domenowa) - trzyma obliczenia poza komponentami, bo
  zasady wyliczen powinny byc niezalezne od UI i mozliwe do testowania jednostkowo.

### Screenshoty / GIFy

- Home  
  `![Home](docs/media/home.png)`
- Kalendarz  
  `![Kalendarz](docs/media/calendar.png)`
- Statystyki  
  `![Statystyki](docs/media/insights.png)`
- Logowanie  
  `![Logowanie](docs/media/login.png)`

## Deployment i budowanie aplikacji (EAS)
Aplikacja jest zbudowana i po build .apk trzeba skontaktować się z właścicielem Repo. Aby zbudować samemu należy wykonać:
- `npx eas-cli@latest login`
- `npx eas-cli@latest init`
- `npx eas-cli@latest build --platform android --profile preview`
 