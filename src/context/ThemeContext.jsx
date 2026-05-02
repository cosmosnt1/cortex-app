import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const STORAGE_KEY = 'cortex-theme';

function getSystemTheme() {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function readStoredTheme() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'light' || v === 'dark') return v;
  } catch {
    /* localStorage unavailable */
  }
  return null;
}

const ThemeContext = createContext(undefined);

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => readStoredTheme());
  const [systemTheme, setSystemTheme] = useState(() => getSystemTheme());

  const resolvedTheme = mode ?? systemTheme;

  useEffect(() => {
    document.documentElement.classList.toggle(
      'dark',
      resolvedTheme === 'dark',
    );
  }, [resolvedTheme]);

  useEffect(() => {
    try {
      if (mode === null) localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* ignore */
    }
  }, [mode]);

  useEffect(() => {
    if (mode !== null) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () =>
      setSystemTheme(mq.matches ? 'dark' : 'light');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [mode]);

  const toggleTheme = useCallback(() => {
    setMode((prev) => {
      const current = prev ?? getSystemTheme();
      return current === 'dark' ? 'light' : 'dark';
    });
  }, []);

  const value = useMemo(
    () => ({
      /** Resolved visual theme applied to the document */
      theme: resolvedTheme,
      /** null = follow OS; otherwise fixed preference */
      mode,
      toggleTheme,
    }),
    [resolvedTheme, mode, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (ctx === undefined) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
