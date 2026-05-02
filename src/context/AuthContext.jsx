import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  getAuthInstance,
  getFirestoreDb,
  isEmailWhitelisted,
  isFirebaseConfigured,
} from '../services/firebase.js';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  /** @type {null | 'denied' | 'signin_failed' | 'config'} */
  const [authError, setAuthError] = useState(null);
  const [driveAccess, setDriveAccess] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setAuthError('config');
      setLoading(false);
      return;
    }

    const auth = getAuthInstance();
    const db = getFirestoreDb();
    if (!auth || !db) {
      setAuthError('config');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setDriveAccess(false);
        setLoading(false);
        return;
      }

      setAuthError(null);
      setLoading(true);

      try {
        const allowed = await isEmailWhitelisted(db, firebaseUser.email);
        if (!allowed) {
          setAuthError('denied');
          await signOut(auth);
          setUser(null);
          setDriveAccess(false);
          return;
        }

        setUser(firebaseUser);
        setDriveAccess(false);
      } catch (err) {
        console.error('[Auth]', err);
        setAuthError('signin_failed');
        await signOut(auth).catch(() => {});
        setUser(null);
        setDriveAccess(false);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!isFirebaseConfigured()) {
      setAuthError('config');
      return;
    }

    const auth = getAuthInstance();
    if (!auth) {
      setAuthError('config');
      return;
    }

    setAuthError(null);
    setLoading(true);

    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (err) {
      if (err?.code === 'auth/popup-closed-by-user') {
        setLoading(false);
        return;
      }
      console.error('[Auth]', err);
      setAuthError('signin_failed');
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    const auth = getAuthInstance();
    if (!auth) return;
    setAuthError(null);
    await signOut(auth);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      authError,
      driveAccess,
      firebaseConfigured: isFirebaseConfigured(),
      signInWithGoogle,
      logout,
    }),
    [user, loading, authError, driveAccess, signInWithGoogle, logout],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
