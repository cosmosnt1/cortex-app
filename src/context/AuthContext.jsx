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
  signInWithPopup, // <-- VOLVEMOS AL POPUP
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
  const [authError, setAuthError] = useState(null);
  
  // Mantenemos la mejora del localStorage para no perder el token al recargar
  const [googleToken, setGoogleToken] = useState(() => localStorage.getItem('cortex_google_token')); 
  const [driveAccess, setDriveAccess] = useState(() => !!localStorage.getItem('cortex_google_token'));

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setAuthError('config');
      setLoading(false);
      return;
    }

    const auth = getAuthInstance();
    const db = getFirestoreDb();
    if (!auth || !db) return;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setDriveAccess(false);
        setGoogleToken(null);
        localStorage.removeItem('cortex_google_token');
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
          setGoogleToken(null);
          localStorage.removeItem('cortex_google_token');
          return;
        }

        setUser(firebaseUser);
      } catch (err) {
        console.error('[Auth]', err);
        setAuthError('signin_failed');
        await signOut(auth).catch(() => {});
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
    if (!auth) return;

    setAuthError(null);
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      // Pedimos permiso para subir archivos a Google Drive
      provider.addScope('https://www.googleapis.com/auth/drive.file');
      
      // AHORA SÍ FUNCIONARÁ EL POPUP porque arreglaste vite.config.js
      const result = await signInWithPopup(auth, provider);
      
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential && credential.accessToken) {
        localStorage.setItem('cortex_google_token', credential.accessToken);
        setGoogleToken(credential.accessToken);
        setDriveAccess(true);
      }
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
    
    localStorage.removeItem('cortex_google_token'); 
    setGoogleToken(null);
    setDriveAccess(false);
    
    await signOut(auth);
  }, []);

  const value = useMemo(
    () => ({
      user, loading, authError, driveAccess, googleToken,
      firebaseConfigured: isFirebaseConfigured(),
      signInWithGoogle, logout,
    }),
    [user, loading, authError, driveAccess, googleToken, signInWithGoogle, logout],
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