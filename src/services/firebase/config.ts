import Constants from 'expo-constants';
import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

import { getFirebaseAuth } from '@/services/firebase/auth-native';

type FirebaseExtra = {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
};

const fromExtra = Constants.expoConfig?.extra?.firebase as
  | FirebaseExtra
  | undefined;

const firebaseConfig = {
  apiKey: fromExtra?.apiKey ?? process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain:
    fromExtra?.authDomain ?? process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:
    fromExtra?.projectId ?? process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:
    fromExtra?.storageBucket ?? process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:
    fromExtra?.messagingSenderId ??
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: fromExtra?.appId ?? process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

if (__DEV__) {
  const missing = Object.entries(firebaseConfig)
    .filter(([, value]) => !value)
    .map(([key]) => key);
  if (missing.length > 0) {
    console.error(
      '[Firebase] Brakuje konfiguracji:',
      missing.join(', '),
      '→ sprawdź plik .env i uruchom: npx expo start -c'
    );
  } else if (firebaseConfig.apiKey) {
    console.log(
      '[Firebase] apiKey wczytany:',
      `${firebaseConfig.apiKey.slice(0, 8)}...`
    );
  }
}

const app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);

export const auth = Platform.OS === 'web' ? getAuth(app) : getFirebaseAuth(app);
export const db = getFirestore(app);
