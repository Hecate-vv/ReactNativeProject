# Cycle Tracker — instrukcje dla agentów AI

## Expo SDK 54

Projekt wygenerowany szablonem:

```bash
npx create-expo-app ReactNativeExpo --template tabs@54
```

Przed każdą zmianą kodu, zależności lub API natywnego czytaj dokumentację:

**https://docs.expo.dev/versions/v54.0.0/**

Instalacja pakietów wyłącznie przez:

```bash
npx expo install <nazwa-pakietu>
```

## Konwencje projektu

Pełne reguły architektury, Firebase, ZenQuotes, nawigacji, UI, testów i deploymentu znajdują się w:

**`.cursor/rules/`**

Pliki (czytaj przed implementacją funkcji):

| Plik | Temat |
|------|-------|
| `00-project-overview.mdc` | Cel apki, stack, mapowanie kryteriów oceny |
| `10-architecture.mdc` | Context API, struktura folderów |
| `20-navigation.mdc` | Stack + Tabs, auth guard |
| `30-ui-paper-responsive.mdc` | React Native Paper, FlatList |
| `40-firebase-data.mdc` | Auth Email+Google, Firestore |
| `50-cycle-domain.mdc` | Kalkulacje cyklu, walidacja dat |
| `60-external-apis.mdc` | ZenQuotes, cache offline |
| `70-native-modules.mdc` | Notifications, Haptics, animacje ładowania |
| `80-quality-testing-errors.mdc` | ESLint, 8–10 testów, ErrorBoundary |
| `90-deployment-readme.mdc` | EAS Build, README |

## Cel aplikacji

Tracker cyklu menstruacyjnego — użytkownik zapisuje daty okresu, aplikacja liczy średnią długość cyklu i przewiduje następny okres. Backend: Firebase. Codzienna afirmacja: ZenQuotes.
