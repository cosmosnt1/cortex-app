import { createContext, useContext, useEffect, useMemo } from 'react';

const ThemeContext = createContext(undefined);

export function ThemeProvider({ children }) {
  useEffect(() => {
    // Forzamos la limpieza de la clase 'dark' en el HTML al cargar la app
    document.documentElement.classList.remove('dark');
    
    // También limpiamos el localStorage por si el usuario lo tenía guardado antes
    try {
      localStorage.removeItem('cortex-theme');
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({
      // Definimos estrictamente el tema claro
      theme: 'light',
      mode: 'light',
      // Dejamos una función vacía para no romper otros componentes que la llamen
      toggleTheme: () => console.warn('El modo oscuro está deshabilitado en esta versión.'),
    }),
    []
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