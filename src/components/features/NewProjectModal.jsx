import { useEffect, useId, useState } from 'react';
import { createProject, getFirestoreDb } from '../../services/firebase.js';

function parseAmountInput(raw) {
  const normalized = String(raw).replace(',', '.').trim();
  if (normalized === '') return NaN;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : NaN;
}

export default function NewProjectModal({ open, onClose, onCreated }) {
  const titleId = useId();
  const [name, setName] = useState('');
  const [totalBudget, setTotalBudget] = useState('');
  const [spentAmount, setSpentAmount] = useState('0');
  const [bankBalance, setBankBalance] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    if (!open) return;
    setFormError(null);
    setSaving(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setFormError('Indica el nombre del proyecto.');
      return;
    }

    const tb = parseAmountInput(totalBudget);
    const spent = parseAmountInput(spentAmount);
    const bank = parseAmountInput(bankBalance);

    if (!Number.isFinite(tb) || tb < 0) {
      setFormError('El premio DAFO (presupuesto total) no es válido.');
      return;
    }
    if (!Number.isFinite(spent) || spent < 0) {
      setFormError('El monto gastado no es válido.');
      return;
    }
    if (!Number.isFinite(bank) || bank < 0) {
      setFormError('El saldo en banco inicial no es válido.');
      return;
    }

    const db = getFirestoreDb();
    if (!db) {
      setFormError('Firestore no disponible.');
      return;
    }

    setSaving(true);
    try {
      await createProject(db, {
        name: trimmedName,
        totalBudget: tb,
        spentAmount: Number.isFinite(spent) ? spent : 0,
        bankBalance: bank,
        status: 'active',
      });
      setName('');
      setTotalBudget('');
      setSpentAmount('0');
      setBankBalance('');
      onCreated?.();
      onClose?.();
    } catch (err) {
      console.error('[NewProject]', err);
      setFormError('No se pudo crear el proyecto. Revisa permisos en Firestore.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
      onMouseDown={(ev) => {
        if (ev.target === ev.currentTarget) onClose?.();
      }}
    >
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-sm transition-opacity"
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="glass-panel-cortex relative z-10 w-full max-w-lg border p-6 shadow-2xl md:p-8"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2
          id={titleId}
          className="text-xl font-semibold tracking-tight text-[var(--cortex-text)]"
        >
          Nuevo proyecto
        </h2>
        <p className="mt-2 text-sm text-[color-mix(in_srgb,var(--cortex-text)_68%,transparent)]">
          Los montos usan decimales (soles). La fecha de banco se registra
          automáticamente al guardar.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-[color-mix(in_srgb,var(--cortex-text)_55%,transparent)]">
              Nombre
            </span>
            <input
              className="mt-1.5 w-full rounded-2xl border border-[color-mix(in_srgb,var(--cortex-sidebar-border)_65%,transparent)] bg-[color-mix(in_srgb,var(--cortex-bg)_55%,transparent)] px-4 py-3 text-sm text-[var(--cortex-text)] outline-none ring-[var(--cortex-accent)] transition placeholder:text-[color-mix(in_srgb,var(--cortex-text)_45%,transparent)] focus:ring-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Documental Costa Norte"
              autoComplete="off"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-[color-mix(in_srgb,var(--cortex-text)_55%,transparent)]">
              Premio DAFO total (S/)
            </span>
            <input
              inputMode="decimal"
              className="mt-1.5 w-full rounded-2xl border border-[color-mix(in_srgb,var(--cortex-sidebar-border)_65%,transparent)] bg-[color-mix(in_srgb,var(--cortex-bg)_55%,transparent)] px-4 py-3 text-sm tabular-nums text-[var(--cortex-text)] outline-none ring-[var(--cortex-accent)] transition focus:ring-2"
              value={totalBudget}
              onChange={(e) => setTotalBudget(e.target.value)}
              placeholder="0.00"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-[color-mix(in_srgb,var(--cortex-text)_55%,transparent)]">
              Gastado acumulado (S/)
            </span>
            <input
              inputMode="decimal"
              className="mt-1.5 w-full rounded-2xl border border-[color-mix(in_srgb,var(--cortex-sidebar-border)_65%,transparent)] bg-[color-mix(in_srgb,var(--cortex-bg)_55%,transparent)] px-4 py-3 text-sm tabular-nums text-[var(--cortex-text)] outline-none ring-[var(--cortex-accent)] transition focus:ring-2"
              value={spentAmount}
              onChange={(e) => setSpentAmount(e.target.value)}
              placeholder="0"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-[color-mix(in_srgb,var(--cortex-text)_55%,transparent)]">
              Saldo en banco inicial (S/)
            </span>
            <input
              inputMode="decimal"
              className="mt-1.5 w-full rounded-2xl border border-[color-mix(in_srgb,var(--cortex-accent)_40%,transparent)] bg-[color-mix(in_srgb,var(--cortex-accent)_8%,transparent)] px-4 py-3 text-sm tabular-nums text-[var(--cortex-text)] outline-none ring-[var(--cortex-accent)] transition focus:ring-2"
              value={bankBalance}
              onChange={(e) => setBankBalance(e.target.value)}
              placeholder="0.00"
            />
          </label>

          {formError ? (
            <p
              className="rounded-2xl border border-red-500/35 bg-red-500/10 px-3 py-2 text-sm text-red-950 dark:text-red-100"
              role="alert"
            >
              {formError}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => onClose?.()}
              className="rounded-2xl border border-[color-mix(in_srgb,var(--cortex-sidebar-border)_70%,transparent)] px-5 py-3 text-sm font-semibold text-[var(--cortex-text)] transition hover:bg-[color-mix(in_srgb,var(--cortex-text)_8%,transparent)]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-[var(--cortex-accent)] px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-95 disabled:opacity-50"
            >
              {saving ? 'Guardando…' : 'Crear proyecto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
