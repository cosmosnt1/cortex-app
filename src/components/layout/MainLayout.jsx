import { useState } from 'react';
import ThemeSwitch from '../ui/ThemeSwitch.jsx';
import Sidebar from './Sidebar.jsx';

function MenuIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export default function MainLayout({ children }) {
  const [activeNav, setActiveNav] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-dvh bg-[var(--cortex-bg)]">
      <Sidebar
        activeId={activeNav}
        onSelect={(id) => {
          setActiveNav(id);
          setMobileMenuOpen(false);
        }}
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="relative flex min-h-dvh min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-[color-mix(in_srgb,var(--cortex-sidebar-border)_65%,transparent)] bg-[color-mix(in_srgb,var(--cortex-bg)_82%,transparent)] px-4 py-3 backdrop-blur-xl transition-[background-color,border-color] duration-300 md:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[color-mix(in_srgb,var(--cortex-sidebar-border)_75%,transparent)] bg-[color-mix(in_srgb,var(--cortex-text)_6%,transparent)] text-[var(--cortex-text)] backdrop-blur-md transition-colors hover:bg-[color-mix(in_srgb,var(--cortex-text)_10%,transparent)] md:hidden"
              aria-expanded={mobileMenuOpen}
              aria-controls="app-sidebar"
              onClick={() => setMobileMenuOpen((open) => !open)}
            >
              <MenuIcon className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium uppercase tracking-[0.18em] text-[color-mix(in_srgb,var(--cortex-text)_55%,transparent)]">
                Panel
              </p>
              <p className="truncate text-sm font-semibold text-[var(--cortex-text)]">
                Vista general
              </p>
            </div>
          </div>

          <ThemeSwitch />
        </header>

        <main className="relative flex-1 overflow-auto bg-gradient-to-br from-[var(--cortex-bg)] via-[var(--cortex-main-muted)] to-[var(--cortex-bg)] px-4 py-8 transition-[background] duration-300 md:px-10">
          <div className="mx-auto max-w-6xl">
            {children ?? (
              <section className="rounded-[var(--radius-glass)] border border-[color-mix(in_srgb,var(--cortex-sidebar-border)_55%,transparent)] bg-[color-mix(in_srgb,var(--cortex-bg)_70%,transparent)] p-8 shadow-lg backdrop-blur-xl transition-[border-color,background-color] duration-300">
                <h1 className="text-2xl font-semibold tracking-tight text-[var(--cortex-text)]">
                  Bienvenido a Cortex
                </h1>
                <p className="mt-3 max-w-prose text-sm leading-relaxed text-[color-mix(in_srgb,var(--cortex-text)_72%,transparent)]">
                  Aquí irá el dashboard de proyectos y el flujo DAFO. Usa la
                  barra lateral para moverte entre Home, Proyectos, Análisis y
                  Ajustes.
                </p>
                <p className="mt-6 text-xs text-[color-mix(in_srgb,var(--cortex-text)_55%,transparent)]">
                  Sección activa (demo):{' '}
                  <span className="font-medium text-[var(--cortex-accent)]">
                    {activeNav}
                  </span>
                </p>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
