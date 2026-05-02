import { useCallback, useEffect, useMemo, useState } from 'react';
import NewProjectModal from '../components/features/NewProjectModal.jsx';
import ProjectCard from '../components/ui/ProjectCard.jsx';
import { fetchProjects, getFirestoreDb } from '../services/firebase.js';
import { formatBankLastUpdate } from '../utils/dates.js';
import { formatPen } from '../utils/money.js';

function BudgetBanner({ premioTotal, saldoBanco, lastBankUpdate }) {
  const stamp =
    lastBankUpdate instanceof Date &&
    !Number.isNaN(lastBankUpdate.getTime())
      ? formatBankLastUpdate(lastBankUpdate)
      : null;
  const updateLine = stamp
    ? `Última actualización: ${stamp}`
    : 'Última actualización: sin datos en proyectos';

  return (
    <section className="relative overflow-hidden rounded-[var(--radius-glass)] border border-[color-mix(in_srgb,var(--cortex-sidebar-border)_55%,transparent)] bg-[color-mix(in_srgb,var(--cortex-bg)_68%,transparent)] p-6 shadow-xl backdrop-blur-2xl transition-[border-color,background-color] duration-300 md:p-8">
      <div
        className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle_at_center,color-mix(in_srgb,var(--cortex-accent)_35%,transparent)_0%,transparent_68%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-28 -left-10 h-52 w-52 rounded-full bg-[radial-gradient(circle_at_center,color-mix(in_srgb,var(--cortex-accent)_22%,transparent)_0%,transparent_70%)]"
        aria-hidden
      />

      <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--cortex-accent)]">
            DAFO · Pulse ejecutivo
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--cortex-text)] md:text-3xl">
            Wanna check your budget?
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[color-mix(in_srgb,var(--cortex-text)_68%,transparent)]">
            Premio consolidado frente al saldo declarado en banco por proyecto.
            La marca de tiempo refleja el último movimiento registrado en
            Firestore.
          </p>
        </div>

        <div className="grid w-full gap-3 sm:grid-cols-2 md:w-auto md:min-w-[340px]">
          <div className="rounded-3xl border border-[color-mix(in_srgb,var(--cortex-sidebar-border)_60%,transparent)] bg-[color-mix(in_srgb,var(--cortex-bg)_55%,transparent)] px-5 py-4 backdrop-blur-md">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[color-mix(in_srgb,var(--cortex-text)_52%,transparent)]">
              Premio DAFO total
            </p>
            <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-[var(--cortex-text)]">
              {formatPen(premioTotal)}
            </p>
          </div>
          <div className="rounded-3xl border border-[color-mix(in_srgb,var(--cortex-accent)_35%,transparent)] bg-[color-mix(in_srgb,var(--cortex-accent)_12%,transparent)] px-5 py-4 backdrop-blur-md">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[color-mix(in_srgb,var(--cortex-text)_55%,transparent)]">
              Saldo en banco
            </p>
            <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-[var(--cortex-accent)]">
              {formatPen(saldoBanco)}
            </p>
            <p className="mt-3 text-xs leading-snug text-[color-mix(in_srgb,var(--cortex-text)_58%,transparent)]">
              {updateLine}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function EmptyProjectsState({ onCreateClick }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[var(--radius-glass)] border border-dashed border-[color-mix(in_srgb,var(--cortex-sidebar-border)_75%,transparent)] bg-[color-mix(in_srgb,var(--cortex-bg)_45%,transparent)] px-8 py-16 text-center backdrop-blur-xl">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-[28px] border border-[color-mix(in_srgb,var(--cortex-accent)_35%,transparent)] bg-[color-mix(in_srgb,var(--cortex-accent)_10%,transparent)] text-[var(--cortex-accent)]"
        aria-hidden
      >
        <svg
          viewBox="0 0 24 24"
          className="h-8 w-8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 2H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z" />
          <path d="M12 11v6M9 14h6" />
        </svg>
      </div>
      <h3 className="mt-6 text-lg font-semibold text-[var(--cortex-text)]">
        Aún no hay proyectos
      </h3>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-[color-mix(in_srgb,var(--cortex-text)_65%,transparent)]">
        Crea tu primer título desde Cortex o añade documentos en la colección{' '}
        <code className="rounded-md bg-[color-mix(in_srgb,var(--cortex-text)_8%,transparent)] px-1.5 py-0.5 text-xs">
          projects
        </code>{' '}
        con{' '}
        <code className="rounded-md bg-[color-mix(in_srgb,var(--cortex-text)_8%,transparent)] px-1.5 py-0.5 text-xs">
          name
        </code>
        ,{' '}
        <code className="rounded-md bg-[color-mix(in_srgb,var(--cortex-text)_8%,transparent)] px-1.5 py-0.5 text-xs">
          totalBudget
        </code>
        ,{' '}
        <code className="rounded-md bg-[color-mix(in_srgb,var(--cortex-text)_8%,transparent)] px-1.5 py-0.5 text-xs">
          spentAmount
        </code>
        ,{' '}
        <code className="rounded-md bg-[color-mix(in_srgb,var(--cortex-text)_8%,transparent)] px-1.5 py-0.5 text-xs">
          bankBalance
        </code>
        ,{' '}
        <code className="rounded-md bg-[color-mix(in_srgb,var(--cortex-text)_8%,transparent)] px-1.5 py-0.5 text-xs">
          bankLastUpdate
        </code>{' '}
        y{' '}
        <code className="rounded-md bg-[color-mix(in_srgb,var(--cortex-text)_8%,transparent)] px-1.5 py-0.5 text-xs">
          status
        </code>
        .
      </p>
      <button
        type="button"
        onClick={onCreateClick}
        className="mt-8 rounded-2xl bg-[var(--cortex-accent)] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-95"
      >
        Nuevo proyecto
      </button>
    </div>
  );
}

export default function DashboardView() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadProjects = useCallback(async () => {
    const db = getFirestoreDb();
    if (!db) {
      setError('Firestore no disponible.');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const list = await fetchProjects(db);
      setProjects(list);
      setError(null);
    } catch (err) {
      console.error('[Dashboard]', err);
      setError('No se pudieron cargar los proyectos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const { premioTotal, saldoBanco, lastBankUpdate } = useMemo(() => {
    const premio = projects.reduce((acc, p) => acc + (p.totalBudget || 0), 0);
    const saldo = projects.reduce((acc, p) => acc + (p.bankBalance || 0), 0);
    const latest = projects.reduce((best, p) => {
      const d = p.bankLastUpdate;
      if (!(d instanceof Date) || Number.isNaN(d.getTime())) return best;
      if (!best || d > best) return d;
      return best;
    }, null);
    return {
      premioTotal: premio,
      saldoBanco: saldo,
      lastBankUpdate: latest,
    };
  }, [projects]);

  return (
    <div className="space-y-10">
      <BudgetBanner
        premioTotal={premioTotal}
        saldoBanco={saldoBanco}
        lastBankUpdate={lastBankUpdate}
      />

      <section>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-[var(--cortex-text)]">
              Proyectos
            </h2>
            <p className="mt-1 text-sm text-[color-mix(in_srgb,var(--cortex-text)_62%,transparent)]">
              Carpetas con volumen, liquidación decimal y alerta de sobrecosto.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {!loading && !error && projects.length > 0 ? (
              <p className="text-xs text-[color-mix(in_srgb,var(--cortex-text)_48%,transparent)]">
                {projects.length}{' '}
                {projects.length === 1 ? 'proyecto' : 'proyectos'}
              </p>
            ) : null}
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="rounded-2xl bg-[var(--cortex-accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-95"
            >
              Nuevo proyecto
            </button>
          </div>
        </div>

        {loading ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((key) => (
              <div
                key={key}
                className="h-[280px] animate-pulse rounded-[32px] bg-[color-mix(in_srgb,var(--cortex-text)_8%,transparent)]"
              />
            ))}
          </div>
        ) : null}

        {error ? (
          <p
            className="mt-8 rounded-2xl border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm text-red-950 dark:text-red-100"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        {!loading && !error && projects.length === 0 ? (
          <div className="mt-8">
            <EmptyProjectsState onCreateClick={() => setModalOpen(true)} />
          </div>
        ) : null}

        {!loading && !error && projects.length > 0 ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        ) : null}
      </section>

      <NewProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => loadProjects()}
      />
    </div>
  );
}
