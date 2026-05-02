import { useTheme } from '../../context/ThemeContext.jsx';

const NAV = [
  {
    id: 'home',
    label: 'Home',
    Icon: IconHome,
  },
  {
    id: 'projects',
    label: 'Proyectos',
    Icon: IconProjects,
  },
  {
    id: 'analysis',
    label: 'Análisis',
    Icon: IconAnalysis,
  },
  {
    id: 'settings',
    label: 'Ajustes',
    Icon: IconSettings,
  },
];

function IconHome({ className }) {
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
      <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
    </svg>
  );
}

function IconProjects({ className }) {
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
      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 2H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z" />
    </svg>
  );
}

function IconAnalysis({ className }) {
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
      <path d="M3 3v18h18" />
      <path d="M7 15 11 11l4 3 4-6" />
    </svg>
  );
}

function IconSettings({ className }) {
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
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

export default function Sidebar({
  activeId = 'home',
  onSelect,
  mobileOpen,
  onClose,
}) {
  const { theme } = useTheme();

  return (
    <>
      <aside
        id="app-sidebar"
        aria-label="Navegación principal"
        className={[
          'fixed inset-y-0 left-0 z-40 flex w-[min(17rem,88vw)] flex-col transition-[transform,opacity] duration-300 md:static md:z-0 md:w-56 md:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        ].join(' ')}
      >
        <div
          className={[
            'mx-3 mb-3 mt-3 flex flex-1 flex-col rounded-[var(--radius-glass)] border p-3 shadow-xl backdrop-blur-xl transition-[background-color,border-color,box-shadow] duration-300 md:mx-0 md:mb-4 md:mt-4 md:p-4',
            theme === 'dark'
              ? 'border-[var(--cortex-sidebar-border)] bg-[color-mix(in_srgb,var(--cortex-sidebar-bg)_92%,transparent)]'
              : 'border-[var(--cortex-sidebar-border)] bg-[color-mix(in_srgb,var(--cortex-sidebar-bg)_88%,white)]',
          ].join(' ')}
        >
          <div className="mb-6 px-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--cortex-accent)]">
              Cortex
            </p>
            <p className="mt-1 text-sm font-semibold tracking-tight text-[var(--cortex-text)]">
              Producer OS
            </p>
          </div>

          <nav className="flex flex-1 flex-col gap-2">
            {NAV.map(({ id, label, Icon }) => {
              const active = id === activeId;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    onSelect?.(id);
                  }}
                  className={[
                    'flex items-center gap-3 rounded-[var(--radius-glass)] px-3 py-3 text-left text-sm font-medium transition-[background-color,color,transform] duration-300',
                    active
                      ? 'bg-[color-mix(in_srgb,var(--cortex-accent)_20%,transparent)] text-[var(--cortex-text)] shadow-inner'
                      : 'text-[color-mix(in_srgb,var(--cortex-text)_78%,transparent)] hover:bg-[color-mix(in_srgb,var(--cortex-text)_8%,transparent)]',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border transition-[border-color,background-color] duration-300',
                      active
                        ? 'border-[color-mix(in_srgb,var(--cortex-accent)_45%,transparent)] bg-[color-mix(in_srgb,var(--cortex-accent)_12%,transparent)] text-[var(--cortex-accent)]'
                        : 'border-[color-mix(in_srgb,var(--cortex-sidebar-border)_70%,transparent)] bg-[color-mix(in_srgb,var(--cortex-text)_5%,transparent)]',
                    ].join(' ')}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="truncate">{label}</span>
                </button>
              );
            })}
          </nav>

          <button
            type="button"
            className="mt-4 rounded-2xl border border-[color-mix(in_srgb,var(--cortex-sidebar-border)_80%,transparent)] px-3 py-2 text-xs text-[color-mix(in_srgb,var(--cortex-text)_65%,transparent)] md:hidden"
            onClick={onClose}
          >
            Cerrar menú
          </button>
        </div>
      </aside>

      {mobileOpen ? (
        <button
          type="button"
          aria-label="Cerrar menú de navegación"
          className="fixed inset-0 z-30 bg-black/35 backdrop-blur-sm transition-opacity duration-300 md:hidden"
          onClick={onClose}
        />
      ) : null}
    </>
  );
}
