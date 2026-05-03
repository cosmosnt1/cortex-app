import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  Timestamp,
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  increment,
  limit,
  query,
  serverTimestamp,
  where,
  writeBatch,
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

function coerceNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function coerceFirestoreDate(value) {
  if (value == null) return null;
  if (value instanceof Timestamp) return value.toDate();
  if (typeof value.toDate === 'function') {
    try {
      const d = value.toDate();
      return d instanceof Date ? d : null;
    } catch {
      return null;
    }
  }
  if (value instanceof Date) return value;
  return null;
}

/**
 * Proyecto en Firestore (`projects`).
 * Campos: name, totalBudget, spentAmount, status, bankBalance, bankLastUpdate.
 */
export function mapProjectDoc(docSnap) {
  const data = docSnap.data();
  const totalBudget = coerceNumber(data.totalBudget, 0);
  const spentAmount = coerceNumber(data.spentAmount, 0);
  const bankBalance = coerceNumber(data.bankBalance, 0);
  return {
    id: docSnap.id,
    name: typeof data.name === 'string' ? data.name : 'Sin nombre',
    empresa: data.empresa || 'Empresa no definida',
    fondoGanado: data.fondoGanado || 'Fondo no definido',
    totalBudget,
    spentAmount,
    bankBalance,
    bankLastUpdate: coerceFirestoreDate(data.bankLastUpdate),
    status: typeof data.status === 'string' ? data.status : 'active',
  };
}

export async function createProject(db, payload) {
  if (!db) throw new Error('Firestore no inicializado');
  const totalBudget = coerceNumber(payload.totalBudget, 0);
  const spentAmount = coerceNumber(payload.spentAmount, 0);
  const bankBalance = coerceNumber(payload.bankBalance, 0);
  const docRef = await addDoc(collection(db, 'projects'), {
    name: String(payload.name ?? '').trim() || 'Sin nombre',
    empresa: String(payload.empresa ?? '').trim(),
    fondoGanado: String(payload.fondoGanado ?? '').trim(),
    totalBudget,
    spentAmount,
    bankBalance,
    status:
      typeof payload.status === 'string' && payload.status.trim()
        ? payload.status.trim()
        : 'active',
    bankLastUpdate: serverTimestamp(),
  });
  return docRef.id;
}

export async function fetchProjects(db) {
  if (!db) return [];
  const snapshot = await getDocs(collection(db, 'projects'));
  return snapshot.docs.map((d) => mapProjectDoc(d));
}

export async function fetchProjectById(db, projectId) {
  if (!db || !projectId) return null;
  const ref = doc(db, 'projects', projectId);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return null;
  return mapProjectDoc(snapshot);
}

const TC_CODES = new Set(['01', '02', '03', '-']);

function normalizeExpenseTipoComprobante(value) {
  const s = String(value ?? '').trim();
  return TC_CODES.has(s) ? s : '-';
}

/**
 * Registra un gasto en `expenses` y suma `montoTotal` a `projects.spentAmount` (atómico).
 * NUEVO: Añadimos driveUrl por defecto a null para no romper llamadas anteriores si las hubiera.
 */
export async function saveExpenseAndIncrementProject(db, projectId, expense, driveUrl = null) {
  if (!db || !projectId) throw new Error('Firestore o proyecto no válido');
  const monto = coerceNumber(expense.montoTotal, NaN);
  if (!Number.isFinite(monto) || monto <= 0) {
    throw new Error('El monto total debe ser un número mayor a cero.');
  }

  const monedaRaw = String(expense.moneda ?? 'PEN').trim().toUpperCase();
  const moneda = monedaRaw === 'USD' ? 'USD' : 'PEN';

  let tipoCambioFirestore = null;
  if (moneda === 'USD') {
    const raw = expense.tipoCambio;
    const hasValue =
      raw != null &&
      String(raw).trim() !== '' &&
      !(typeof raw === 'number' && !Number.isFinite(raw));
    if (hasValue) {
      const tc = coerceNumber(String(raw).trim().replace(',', '.'), NaN);
      tipoCambioFirestore = Number.isFinite(tc) ? tc : null;
    }
  }

  const batch = writeBatch(db);
  const expenseRef = doc(collection(db, 'expenses'));

  batch.set(expenseRef, {
    projectId,
    fecha: String(expense.fecha ?? ''),
    tipoComprobante: normalizeExpenseTipoComprobante(expense.tipoComprobante),
    numeroComprobante: String(expense.numeroComprobante ?? '').trim(),
    proveedor: String(expense.proveedor ?? ''),
    ruc: String(expense.ruc ?? ''),
    itemDetalle: String(expense.itemDetalle ?? ''),
    moneda,
    tipoCambio: tipoCambioFirestore,
    montoTotal: monto,
    drive_url: driveUrl, // <--- GUARDAMOS LA URL DE DRIVE AQUÍ
    createdAt: serverTimestamp(),
  });

  const projectRef = doc(db, 'projects', projectId);
  batch.update(projectRef, {
    spentAmount: increment(monto),
  });

  await batch.commit();
  return expenseRef.id;
}