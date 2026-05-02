import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';
import MainLayout from './components/layout/MainLayout.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import AuthScreen from './views/AuthScreen.jsx';
import DashboardView from './views/DashboardView.jsx';
import PlaceholderView from './views/PlaceholderView.jsx';
import ProjectWorkspaceView from './views/ProjectWorkspaceView.jsx';

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

function AuthenticatedRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardView />} />
          <Route path="proyecto/:id" element={<ProjectWorkspaceView />} />
          <Route
            path="analisis"
            element={
              <PlaceholderView
                title="Análisis"
                description="Aquí conectarás métricas consolidadas de liquidación y DAFO. Esta vista está lista para el siguiente ciclo de Cortex."
              />
            }
          />
          <Route
            path="ajustes"
            element={
              <PlaceholderView
                title="Ajustes"
                description="Preferencias de cuenta y permisos llegarán aquí. Por ahora puedes usar el interruptor de tema en la cabecera y cerrar sesión desde la barra lateral."
              />
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
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

  return <AuthenticatedRoutes />;
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
