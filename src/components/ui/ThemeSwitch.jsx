import { useTheme } from '../../context/ThemeContext.jsx';

function SunIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function ThemeSwitch({ className = '' }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
      className={[
        'inline-flex h-11 w-11 items-center justify-center rounded-full',
        'border border-[color-mix(in_srgb,var(--cortex-text)_12%,transparent)]',
        'bg-[color-mix(in_srgb,var(--cortex-text)_6%,transparent)]',
        'backdrop-blur-md transition-colors duration-300',
        'hover:bg-[color-mix(in_srgb,var(--cortex-text)_10%,transparent)]',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cortex-accent)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {isDark ? (
        <SunIcon className="h-5 w-5 text-amber-300" />
      ) : (
        <MoonIcon className="h-5 w-5 text-slate-600" />
      )}
    </button>
  );
}
