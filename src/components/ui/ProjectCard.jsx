import { Link } from 'react-router-dom';
import { formatPen } from '../../utils/money.js';

function liquidationMetrics(totalBudget, spentAmount) {
  const tb = Number(totalBudget);
  const sp = Number(spentAmount);
  if (!(tb > 0)) {
    const pctRaw = sp > 0 ? 100 : 0;
    return {
      pctRaw,
      overBudget: sp > 0,
      trackNeutral: true,
    };
  }
  const pctRaw = (sp / tb) * 100;
  const overBudget = sp > tb;
  return { pctRaw, overBudget, trackNeutral: false };
}

export default function ProjectCard({ project }) {
  const { id, name, totalBudget, spentAmount, status } = project;
  const { pctRaw, overBudget, trackNeutral } = liquidationMetrics(
    totalBudget,
    spentAmount,
  );

  const pctLabel = `${pctRaw.toFixed(2)}%`;
  const barWidthPct = overBudget ? 100 : Math.min(Math.max(pctRaw, 0), 100);

  return (
    <Link
      to={`/proyecto/${id}`}
      className="group block outline-none focus-visible:ring-2 focus-visible:ring-[var(--cortex-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--cortex-bg)]"
    >
      <article
        className={[
          'relative overflow-hidden rounded-[32px] border border-[color-mix(in_srgb,var(--cortex-sidebar-border)_70%,transparent)]',
          'bg-[color-mix(in_srgb,var(--color-cortex-card-light)_94%,var(--cortex-accent)_6%)] shadow-[0_22px_60px_-28px_rgba(15,23,42,0.35)]',
          'transition-all duration-300 will-change-transform',
          'before:pointer-events-none before:absolute before:inset-x-4 before:top-3 before:h-[42%] before:rounded-3xl before:bg-gradient-to-br before:from-white/70 before:to-transparent before:opacity-90 before:content-[""]',
          'dark:border-[color-mix(in_srgb,var(--cortex-sidebar-border)_55%,transparent)]',
          'dark:bg-[color-mix(in_srgb,var(--color-cortex-card-dark)_92%,var(--cortex-accent)_8%)]',
          'dark:shadow-[0_26px_70px_-24px_rgba(0,0,0,0.65)]',
          'dark:before:from-white/10 dark:before:to-transparent dark:before:opacity-70',
          'hover:scale-105 hover:shadow-[0_28px_70px_-26px_rgba(15,23,42,0.45)] dark:hover:shadow-[0_30px_80px_-22px_rgba(0,0,0,0.75)]',
        ].join(' ')}
      >
        <div className="relative px-6 pb-5 pt-12">
          <div
            className="absolute left-7 top-0 h-9 w-[42%] max-w-[11rem] rounded-b-2xl rounded-t-xl border border-b-0 border-[color-mix(in_srgb,var(--cortex-sidebar-border)_65%,transparent)] bg-[color-mix(in_srgb,var(--cortex-bg)_55%,transparent)] shadow-[inset_0_-8px_16px_rgba(15,23,42,0.06)] backdrop-blur-md dark:border-[color-mix(in_srgb,var(--cortex-sidebar-border)_45%,transparent)] dark:bg-[color-mix(in_srgb,var(--cortex-bg)_40%,transparent)] dark:shadow-[inset_0_-10px_18px_rgba(0,0,0,0.35)]"
            aria-hidden
          />

          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color-mix(in_srgb,var(--cortex-text)_52%,transparent)]">
                Proyecto
              </p>
              <h3 className="mt-2 line-clamp-2 text-xl font-semibold tracking-tight text-[var(--cortex-text)]">
                {name}
              </h3>
              <p className="mt-3 text-xs text-[color-mix(in_srgb,var(--cortex-text)_58%,transparent)]">
                Presupuesto ·{' '}
                <span className="font-medium text-[var(--cortex-text)]">
                  {formatPen(totalBudget)}
                </span>
              </p>
            </div>
            <span
              className={[
                'shrink-0 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide',
                status === 'active'
                  ? 'border-[color-mix(in_srgb,var(--cortex-accent)_45%,transparent)] bg-[color-mix(in_srgb,var(--cortex-accent)_14%,transparent)] text-[var(--cortex-accent)]'
                  : 'border-[color-mix(in_srgb,var(--cortex-text)_18%,transparent)] bg-[color-mix(in_srgb,var(--cortex-text)_6%,transparent)] text-[color-mix(in_srgb,var(--cortex-text)_72%,transparent)]',
              ].join(' ')}
            >
              {status}
            </span>
          </div>

          <div className="mt-8 space-y-2">
            <div className="flex items-center justify-between text-xs text-[color-mix(in_srgb,var(--cortex-text)_62%,transparent)]">
              <span className="flex items-center gap-2">
                Liquidación
                {overBudget ? (
                  <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">
                    Sobrecosto
                  </span>
                ) : null}
              </span>
              <span
                className={[
                  'font-semibold tabular-nums',
                  overBudget
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-[var(--cortex-text)]',
                ].join(' ')}
              >
                {pctLabel}
              </span>
            </div>
            <div
              className={[
                'h-2.5 w-full overflow-hidden rounded-full',
                trackNeutral
                  ? 'bg-[color-mix(in_srgb,var(--cortex-text)_8%,transparent)] dark:bg-[color-mix(in_srgb,var(--cortex-text)_12%,transparent)]'
                  : 'bg-[color-mix(in_srgb,var(--cortex-text)_10%,transparent)] dark:bg-[color-mix(in_srgb,var(--cortex-text)_14%,transparent)]',
              ].join(' ')}
              role="progressbar"
              aria-valuenow={Number(pctRaw.toFixed(2))}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Liquidación ${pctLabel}`}
            >
              <div
                className={[
                  'h-full rounded-full transition-[width] duration-500 ease-out',
                  overBudget
                    ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.45)]'
                    : 'bg-[var(--cortex-accent)] shadow-[0_0_24px_color-mix(in_srgb,var(--cortex-accent)_55%,transparent)]',
                ].join(' ')}
                style={{ width: `${barWidthPct}%` }}
              />
            </div>
            <p className="text-[11px] text-[color-mix(in_srgb,var(--cortex-text)_55%,transparent)]">
              Gastado {formatPen(spentAmount)}
            </p>
          </div>
        </div>
      </article>
    </Link>
  );
}
