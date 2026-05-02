import ThemeSwitch from '../components/ui/ThemeSwitch.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { getMissingFirebaseEnvKeys } from '../services/firebase.js';

const ERROR_COPY = {
  denied: 'Acceso Denegado. Tu correo no está en la lista de invitados.',
  signin_failed: 'No se pudo completar el inicio de sesión. Inténtalo de nuevo.',
  config:
    'Faltan credenciales de Firebase. Crea un archivo `.env` en la raíz del proyecto con las variables indicadas en `.env.example`.',
};

function GoogleMark({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export default function AuthScreen() {
  const { theme } = useTheme();
  const { authError, signInWithGoogle, loading, firebaseConfigured } = useAuth();
  const isDark = theme === 'dark';

  const missingKeys = firebaseConfigured ? [] : getMissingFirebaseEnvKeys();

  const gradient = isDark
    ? 'bg-gradient-to-br from-[#0b0e14] via-slate-950 to-indigo-950'
    : 'bg-gradient-to-br from-[#f8f9fb] via-slate-100 to-sky-100';

  const errorMessage =
    authError === 'config'
      ? ERROR_COPY.config
      : authError === 'denied'
        ? ERROR_COPY.denied
        : authError === 'signin_failed'
          ? ERROR_COPY.signin_failed
          : null;

  return (
    <div
      className={`relative flex min-h-dvh flex-col items-center justify-center px-4 py-14 ${gradient} transition-[background] duration-500`}
    >
      <div className="absolute right-4 top-4 md:right-8 md:top-8">
        <ThemeSwitch />
      </div>

      <div className="glass-panel-cortex w-full max-w-md px-8 py-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--cortex-accent)]">
          Cortex
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--cortex-text)]">
          Producer OS
        </h1>
        <p className="mt-2 text-sm text-[color-mix(in_srgb,var(--cortex-text)_72%,transparent)]">
          Módulo de gastos y liquidación DAFO
        </p>

        {!firebaseConfigured && (
          <div
            className="mt-8 rounded-2xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-left text-xs leading-relaxed text-amber-950 dark:text-amber-100"
            role="status"
          >
            <p className="font-medium">Configura Firebase</p>
            <p className="mt-1 opacity-90">
              Añade un archivo <code className="rounded bg-black/10 px-1 py-0.5 dark:bg-white/10">.env</code> con
              las credenciales del SDK (mismo formato que{' '}
              <code className="rounded bg-black/10 px-1 py-0.5 dark:bg-white/10">.env.example</code>
              ). Reinicia el servidor de desarrollo tras guardar.
            </p>
            {missingKeys.length > 0 && (
              <ul className="mt-2 list-inside list-disc font-mono text-[11px] opacity-90">
                {missingKeys.map((key) => (
                  <li key={key}>{key}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {errorMessage && firebaseConfigured && (
          <div
            className="mt-8 rounded-2xl border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm text-red-950 dark:text-red-100"
            role="alert"
          >
            {errorMessage}
          </div>
        )}

        <button
          type="button"
          onClick={() => signInWithGoogle()}
          disabled={loading || !firebaseConfigured}
          className="mt-10 flex w-full items-center justify-center gap-3 rounded-[1.25rem] border border-white/25 bg-white/20 px-5 py-4 text-[var(--cortex-text)] backdrop-blur-md transition-[background-color,transform] duration-300 hover:bg-white/30 disabled:pointer-events-none disabled:opacity-40 dark:border-white/15 dark:bg-white/10 dark:hover:bg-white/15"
        >
          <GoogleMark className="h-6 w-6 shrink-0" />
          <span className="font-semibold">
            {loading ? 'Conectando…' : 'Acceder con Google'}
          </span>
        </button>
      </div>
    </div>
  );
}
