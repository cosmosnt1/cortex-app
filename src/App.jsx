import MainLayout from './components/layout/MainLayout.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import AuthScreen from './views/AuthScreen.jsx';

function LoadingSplash() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[var(--cortex-bg)] px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--cortex-accent)]">
        Cortex
      </p>
      <p className="mt-4 text-sm text-[color-mix(in_srgb,var(--cortex-text)_70%,transparent)]">
        Cargando sesión…
      </p>
      <div
        className="mt-6 h-9 w-9 animate-spin rounded-full border-2 border-[color-mix(in_srgb,var(--cortex-accent)_35%,transparent)] border-t-[var(--cortex-accent)]"
        aria-hidden
      />
    </div>
  );
}

function Gate() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSplash />;
  }

  if (!user) {
    return <AuthScreen />;
  }

  return <MainLayout />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Gate />
      </AuthProvider>
    </ThemeProvider>
  );
}
