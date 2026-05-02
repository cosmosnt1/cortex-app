import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  collection,
  getDocs,
  getFirestore,
  limit,
  query,
  where,
} from 'firebase/firestore';

/**
 * Variables esperadas en `.env` (prefijo VITE_ para Vite).
 * Copia `.env.example` → `.env` y pega las credenciales del proyecto Firebase.
 */
const ENV_KEYS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];

export function getFirebaseEnvSnapshot() {
  return Object.fromEntries(
    ENV_KEYS.map((key) => [key, import.meta.env[key]]),
  );
}

export function isFirebaseConfigured() {
  const snap = getFirebaseEnvSnapshot();
  return ENV_KEYS.every(
    (key) => snap[key] && String(snap[key]).trim() !== '',
  );
}

/** Lista de variables `VITE_FIREBASE_*` vacías o ausentes (para mensajes en UI). */
export function getMissingFirebaseEnvKeys() {
  const snap = getFirebaseEnvSnapshot();
  return ENV_KEYS.filter(
    (key) => !snap[key] || String(snap[key]).trim() === '',
  );
}

let appInstance = null;

export function getFirebaseApp() {
  if (!isFirebaseConfigured()) return null;
  if (!appInstance) {
    appInstance =
      getApps().length > 0
        ? getApps()[0]
        : initializeApp({
            apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
            authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
            projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
            storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
            appId: import.meta.env.VITE_FIREBASE_APP_ID,
          });
  }
  return appInstance;
}

export function getAuthInstance() {
  const app = getFirebaseApp();
  return app ? getAuth(app) : null;
}

export function getFirestoreDb() {
  const app = getFirebaseApp();
  return app ? getFirestore(app) : null;
}

/**
 * Colección `whitelist`: documentos con campo `email` en minúsculas.
 * Ejemplo: { email: "usuario@dominio.com" }
 *
 * Firestore: concede lectura a usuarios autenticados para esta colección
 * (y restringe escritura solo a admins / consola).
 */
export async function isEmailWhitelisted(db, email) {
  if (!db || !email) return false;
  const normalized = email.trim().toLowerCase();
  const q = query(
    collection(db, 'whitelist'),
    where('email', '==', normalized),
    limit(1),
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}
