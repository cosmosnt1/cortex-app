import { ScanLine } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ExtractionDrawer from '../components/features/ExtractionDrawer.jsx';
import { fetchProjectById, getFirestoreDb } from '../services/firebase.js';
import { formatBankLastUpdate } from '../utils/dates.js';
import { formatPen } from '../utils/money.js';

function workspaceLiquidation(totalBudget, spentAmount) {
  const tb = Number(totalBudget);
  const sp = Number(spentAmount);
  if (!(tb > 0)) {
    return {
      pctRaw: sp > 0 ? 100 : 0,
      overBudget: sp > 0,
    };
  }
  const pctRaw = (sp / tb) * 100;
  return {
    pctRaw,
    overBudget: sp > tb,
  };
}

export default function ProjectWorkspaceView() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const loadProject = useCallback(async () => {
    const db = getFirestoreDb();
    if (!db || !id) return;
    try {
      const docSnap = await fetchProjectById(db, id);
      if (docSnap) {
        setProject(docSnap);
        setError(null);
      } else {
        setProject(null);
        setError('no-found');
      }
    } catch (err) {
      console.error('[ProjectWorkspace]', err);
      setError('load');
    }
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    const db = getFirestoreDb();

    async function load() {
      if (!db || !id) {
        setError('Proyecto no disponible.');
        setLoading(false);
        return;
      }
      try {
        const docSnap = await fetchProjectById(db, id);
        if (!cancelled) {
          if (!docSnap) {
            setProject(null);
            setError('no-found');
          } else {
            setProject(docSnap);
            setError(null);
          }
        }
      } catch (err) {
        console.error('[ProjectWorkspace]', err);
        if (!cancelled) setError('load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const liq = useMemo(() => {
    if (!project) return { pctRaw: 0, overBudget: false };
    return workspaceLiquidation(project.totalBudget, project.spentAmount);
  }, [project]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 max-w-md animate-pulse rounded-2xl bg-[color-mix(in_srgb,var(--cortex-text)_10%,transparent)]" />
        <div className="h-40 animate-pulse rounded-[var(--radius-glass)] bg-[color-mix(in_srgb,var(--cortex-text)_8%,transparent)]" />
      </div>
    );
  }

  if (error === 'no-found' || !project) {
    return (
      <div className="rounded-[var(--radius-glass)] border border-[color-mix(in_srgb,var(--cortex-sidebar-border)_55%,transparent)] bg-[color-mix(in_srgb,var(--cortex-bg)_65%,transparent)] p-8 text-center backdrop-blur-xl">
        <h2 className="text-lg font-semibold text-[var(--cortex-text)]">
          Proyecto no encontrado
        </h2>
        <p className="mt-2 text-sm text-[color-mix(in_srgb,var(--cortex-text)_65%,transparent)]">
          El ID no existe o fue eliminado de Firestore.
        </p>
        <Link
          to="/dashboard"
          className="mt-6 inline-flex rounded-2xl bg-[var(--cortex-accent)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:opacity-95"
        >
          Volver al dashboard
        </Link>
      </div>
    );
  }

  if (error === 'load') {
    return (
      <p
        className="rounded-2xl border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm text-red-950 dark:text-red-100"
        role="alert"
      >
        No se pudo cargar el proyecto.
      </p>
    );
  }

  const pctLabel = `${liq.pctRaw.toFixed(2)}%`;
  const bankLine =
    project.bankLastUpdate instanceof Date &&
    !Number.isNaN(project.bankLastUpdate.getTime())
      ? formatBankLastUpdate(project.bankLastUpdate)
      : null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link
            to="/dashboard"
            className="text-xs font-medium text-[var(--cortex-accent)] hover:underline"
          >
            ← Dashboard
          </Link>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--cortex-text)]">
            {project.name}
          </h1>
          <p className="mt-2 text-sm text-[color-mix(in_srgb,var(--cortex-text)_62%,transparent)]">
            Mesa de trabajo · liquidación{' '}
            <span
              className={[
                'font-semibold tabular-nums',
                liq.overBudget
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-[var(--cortex-text)]',
              ].join(' ')}
            >
              {pctLabel}
            </span>
            {liq.overBudget ? (
              <span className="ml-2 rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">
                Sobrecosto
              </span>
            ) : null}
          </p>
        </div>

        <div className="flex flex-col gap-3 lg:w-[min(100%,28rem)] lg:shrink-0">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--cortex-accent)] px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-95"
          >
            <ScanLine className="h-4 w-4" aria-hidden />
            Liquidar comprobante
          </button>
          <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-3xl border border-[color-mix(in_srgb,var(--cortex-sidebar-border)_55%,transparent)] bg-[color-mix(in_srgb,var(--cortex-bg)_55%,transparent)] px-5 py-4 backdrop-blur-md">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[color-mix(in_srgb,var(--cortex-text)_52%,transparent)]">
              Monto total DAFO
            </p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--cortex-text)]">
              {formatPen(project.totalBudget)}
            </p>
            <p className="mt-1 text-xs text-[color-mix(in_srgb,var(--cortex-text)_58%,transparent)]">
              Gastado {formatPen(project.spentAmount)}
            </p>
          </div>
          <div className="rounded-3xl border border-[color-mix(in_srgb,var(--cortex-accent)_35%,transparent)] bg-[color-mix(in_srgb,var(--cortex-accent)_12%,transparent)] px-5 py-4 backdrop-blur-md">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[color-mix(in_srgb,var(--cortex-text)_55%,transparent)]">
              Saldo en banco
            </p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--cortex-accent)]">
              {formatPen(project.bankBalance)}
            </p>
            <p className="mt-3 text-xs leading-snug text-[color-mix(in_srgb,var(--cortex-text)_58%,transparent)]">
              {bankLine
                ? `Última actualización: ${bankLine}`
                : 'Última actualización: sin fecha'}
            </p>
          </div>
          </div>
        </div>
      </div>

      <ExtractionDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        project={project}
        onSaved={() => void loadProject()}
      />

      <section className="rounded-[var(--radius-glass)] border border-[color-mix(in_srgb,var(--cortex-sidebar-border)_50%,transparent)] bg-[color-mix(in_srgb,var(--cortex-bg)_60%,transparent)] p-8 backdrop-blur-xl">
        <h2 className="text-sm font-semibold text-[var(--cortex-text)]">
          Actividades (próximo paso)
        </h2>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-[color-mix(in_srgb,var(--cortex-text)_65%,transparent)]">
          Aquí vivirá el grid de las 6 carpetas DAFO, últimos comprobantes y el
          drawer de extracción descritos en la arquitectura Cortex.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="rounded-3xl border border-dashed border-[color-mix(in_srgb,var(--cortex-sidebar-border)_65%,transparent)] bg-[color-mix(in_srgb,var(--cortex-text)_4%,transparent)] px-4 py-6 text-center text-xs text-[color-mix(in_srgb,var(--cortex-text)_55%,transparent)]"
            >
              Actividad {n}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
