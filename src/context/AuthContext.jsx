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
  
  // 1. NUEVO: Estado para mantener el token de Google en memoria
  const [googleToken, setGoogleToken] = useState(null); 

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
        setGoogleToken(null); // Limpieza de token
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
          setGoogleToken(null); // Limpieza de token
          return;
        }

        setUser(firebaseUser);
        // Nota: driveAccess ahora lo setearemos principalmente al hacer login con popup
      } catch (err) {
        console.error('[Auth]', err);
        setAuthError('signin_failed');
        await signOut(auth).catch(() => {});
        setUser(null);
        setDriveAccess(false);
        setGoogleToken(null);
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
      // 2. NUEVO: Configuramos el Provider para pedir permisos de Drive
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/drive.file');
      
      const result = await signInWithPopup(auth, provider);
      
      // 3. NUEVO: Capturamos el Token de Google para usarlo en la API de Drive
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential) {
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
    
    // 4. NUEVO: Limpiamos la sesión de Google Drive al salir
    localStorage.removeItem('cortex_google_token'); 
    setGoogleToken(null);
    setDriveAccess(false);
    
    await signOut(auth);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      authError,
      driveAccess,
      googleToken, // 5. NUEVO: Lo exponemos en el contexto
      firebaseConfigured: isFirebaseConfigured(),
      signInWithGoogle,
      logout,
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