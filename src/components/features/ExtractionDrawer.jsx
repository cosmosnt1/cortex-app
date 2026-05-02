import {
  FileWarning,
  Loader2,
  ScanLine,
  Upload,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { extractInvoiceData, isGeminiConfigured } from '../../services/gemini.js';
import {
  getFirestoreDb,
  saveExpenseAndIncrementProject,
} from '../../services/firebase.js';
import { formatAmountByCurrency } from '../../utils/money.js';
import { isValidPeruRuc11 } from '../../utils/ruc.js';

function FieldSkeleton({ className = '' }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-[color-mix(in_srgb,var(--cortex-text)_12%,transparent)] ${className}`}
      aria-hidden
    />
  );
}

const initialForm = () => ({
  fecha: '',
  tipoComprobante: '-',
  numeroComprobante: '',
  proveedor: '',
  ruc: '',
  itemDetalle: '',
  moneda: 'PEN',
  tipoCambio: '',
  montoTotal: '',
});

const selectGlassClass =
  'mt-1.5 w-full rounded-2xl border border-[color-mix(in_srgb,var(--cortex-sidebar-border)_60%,transparent)] bg-[color-mix(in_srgb,var(--cortex-bg)_52%,transparent)] px-4 py-3 text-sm text-[var(--cortex-text)] outline-none ring-[var(--cortex-accent)] focus:ring-2 dark:bg-[color-mix(in_srgb,var(--cortex-bg)_42%,transparent)]';

const inputGlassClass =
  'mt-1.5 w-full rounded-2xl border border-[color-mix(in_srgb,var(--cortex-sidebar-border)_60%,transparent)] bg-[color-mix(in_srgb,var(--cortex-bg)_45%,transparent)] px-4 py-3 text-sm text-[var(--cortex-text)] outline-none ring-[var(--cortex-accent)] focus:ring-2 dark:bg-[color-mix(in_srgb,var(--cortex-bg)_38%,transparent)]';

export default function ExtractionDrawer({
  open,
  onClose,
  projectId,
  onSaved,
}) {
  const titleId = useId();
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [phase, setPhase] = useState('idle');
  const [form, setForm] = useState(initialForm);
  const [scanError, setScanError] = useState(null);
  const [saveError, setSaveError] = useState(null);

  const revokePreview = useCallback(() => {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  useEffect(() => {
    if (!open) {
      revokePreview();
      setFile(null);
      setPhase('idle');
      setForm(initialForm());
      setScanError(null);
      setSaveError(null);
    }
  }, [open, revokePreview]);

  useEffect(() => {
    if (!open || !file) return undefined;

    let cancelled = false;

    async function runExtract() {
      setPhase('extracting');
      setScanError(null);
      setSaveError(null);
      try {
        const data = await extractInvoiceData(file);
        if (cancelled) return;
        setForm({
          fecha: data.fecha,
          tipoComprobante: data.tipoComprobante ?? '-',
          numeroComprobante: data.numeroComprobante ?? '',
          proveedor: data.proveedor,
          ruc: data.ruc,
          itemDetalle: data.itemDetalle,
          moneda: data.moneda === 'USD' ? 'USD' : 'PEN',
          tipoCambio:
            data.moneda === 'USD' &&
            data.tipoCambio != null &&
            Number.isFinite(data.tipoCambio)
              ? String(data.tipoCambio)
              : '',
          montoTotal:
            data.montoTotal != null && Number.isFinite(data.montoTotal)
              ? String(data.montoTotal)
              : '',
        });
        setPhase('ready');
      } catch (err) {
        console.error('[ExtractionDrawer]', err);
        if (!cancelled) {
          setScanError(err?.message ?? 'Error al analizar el comprobante.');
          setPhase('error');
        }
      }
    }

    runExtract();
    return () => {
      cancelled = true;
    };
  }, [open, file]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  function handlePickFile(next) {
    if (!next) return;
    revokePreview();
    const url = URL.createObjectURL(next);
    setPreviewUrl(url);
    setFile(next);
    setForm(initialForm());
    setPhase('idle');
    setScanError(null);
  }

  const isPdf = file?.type === 'application/pdf' || file?.name?.toLowerCase().endsWith('.pdf');
  const rucInvalidHighlight =
    form.ruc.length > 0 && !isValidPeruRuc11(form.ruc);

  const montoNum = Number(String(form.montoTotal).replace(',', '.'));
  const isUsd = form.moneda === 'USD';
  const showForm = Boolean(file) && phase !== 'extracting';
  const formDisabled = !file || phase === 'extracting' || phase === 'saving';
  const canConfirm =
    showForm &&
    phase !== 'saving' &&
    Number.isFinite(montoNum) &&
    montoNum > 0 &&
    isGeminiConfigured();

  async function handleConfirm() {
    if (!projectId || !canConfirm) return;
    const db = getFirestoreDb();
    if (!db) {
      setSaveError('Firestore no disponible.');
      return;
    }
    setPhase('saving');
    setSaveError(null);
    try {
      await saveExpenseAndIncrementProject(db, projectId, {
        fecha: form.fecha,
        tipoComprobante: form.tipoComprobante,
        numeroComprobante: form.numeroComprobante,
        proveedor: form.proveedor,
        ruc: form.ruc,
        itemDetalle: form.itemDetalle,
        moneda: form.moneda,
        tipoCambio: isUsd ? form.tipoCambio.trim() : null,
        montoTotal: montoNum,
      });
      onSaved?.();
      onClose?.();
    } catch (err) {
      console.error('[ExtractionDrawer save]', err);
      setSaveError(err?.message ?? 'No se pudo guardar el gasto.');
      setPhase('ready');
    }
  }

  if (!open) return null;

  const geminiReady = isGeminiConfigured();

  return (
    <div className="fixed inset-0 z-[60] flex justify-end" role="presentation">
      <button
        type="button"
        aria-label="Cerrar panel"
        className="absolute inset-0 bg-black/45 backdrop-blur-xl transition-opacity"
        onClick={() => onClose?.()}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="extraction-drawer-panel relative z-[61] flex h-full max-h-dvh w-full max-w-6xl flex-col overflow-hidden border-l border-[color-mix(in_srgb,var(--cortex-sidebar-border)_55%,transparent)] bg-[color-mix(in_srgb,var(--cortex-bg)_88%,transparent)] shadow-[-24px_0_80px_-20px_rgba(0,0,0,0.35)] backdrop-blur-xl dark:bg-[color-mix(in_srgb,var(--cortex-bg)_92%,transparent)]"
      >
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-[color-mix(in_srgb,var(--cortex-sidebar-border)_55%,transparent)] px-5 py-4 md:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--cortex-accent)_15%,transparent)] text-[var(--cortex-accent)]">
              <ScanLine className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h2
                id={titleId}
                className="text-lg font-semibold tracking-tight text-[var(--cortex-text)]"
              >
                Extracción inteligente
              </h2>
              <p className="text-xs text-[color-mix(in_srgb,var(--cortex-text)_58%,transparent)]">
                Gemini · valida y liquida en un solo paso
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onClose?.()}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[color-mix(in_srgb,var(--cortex-sidebar-border)_70%,transparent)] text-[var(--cortex-text)] transition hover:bg-[color-mix(in_srgb,var(--cortex-text)_8%,transparent)]"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </header>

        {!geminiReady ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <FileWarning className="h-10 w-10 text-amber-500" aria-hidden />
            <p className="max-w-md text-sm text-[color-mix(in_srgb,var(--cortex-text)_72%,transparent)]">
              Configura{' '}
              <code className="rounded bg-[color-mix(in_srgb,var(--cortex-text)_10%,transparent)] px-1">
                VITE_GEMINI_API_KEY
              </code>{' '}
              en tu archivo{' '}
              <code className="rounded bg-[color-mix(in_srgb,var(--cortex-text)_10%,transparent)] px-1">
                .env
              </code>{' '}
              y reinicia Vite.
            </p>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
            <div className="flex min-h-[220px] flex-1 flex-col border-b border-[color-mix(in_srgb,var(--cortex-sidebar-border)_45%,transparent)] lg:min-h-0 lg:max-w-[52%] lg:border-b-0 lg:border-r">
              <p className="shrink-0 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[color-mix(in_srgb,var(--cortex-text)_52%,transparent)] md:px-6">
                Vista previa
              </p>
              <div
                className="relative min-h-0 flex-1 bg-[color-mix(in_srgb,var(--cortex-text)_6%,transparent)]"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const f = e.dataTransfer.files?.[0];
                  if (f) handlePickFile(f);
                }}
              >
                {!file ? (
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="flex h-full min-h-[200px] w-full flex-col items-center justify-center gap-3 p-6 text-center transition hover:bg-[color-mix(in_srgb,var(--cortex-text)_8%,transparent)]"
                  >
                    <Upload className="h-10 w-10 text-[var(--cortex-accent)]" aria-hidden />
                    <span className="text-sm font-medium text-[var(--cortex-text)]">
                      Arrastra un PDF o imagen
                    </span>
                    <span className="text-xs text-[color-mix(in_srgb,var(--cortex-text)_55%,transparent)]">
                      Factura, boleta o nota · JPG, PNG, WEBP o PDF
                    </span>
                  </button>
                ) : isPdf ? (
                  <iframe
                    title="Vista previa PDF"
                    src={previewUrl ?? ''}
                    className="h-full min-h-[280px] w-full bg-[var(--cortex-bg)] lg:min-h-0"
                  />
                ) : (
                  <img
                    src={previewUrl ?? ''}
                    alt=""
                    className="mx-auto max-h-[min(55vh,520px)] w-auto max-w-full object-contain p-4"
                  />
                )}
                <input
                  ref={inputRef}
                  type="file"
                  accept="application/pdf,image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handlePickFile(f);
                    e.target.value = '';
                  }}
                />
              </div>
              <div className="flex shrink-0 gap-2 border-t border-[color-mix(in_srgb,var(--cortex-sidebar-border)_45%,transparent)] p-3 md:p-4">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="rounded-2xl border border-[color-mix(in_srgb,var(--cortex-sidebar-border)_65%,transparent)] px-4 py-2.5 text-sm font-semibold text-[var(--cortex-text)] transition hover:bg-[color-mix(in_srgb,var(--cortex-text)_8%,transparent)]"
                >
                  Cambiar archivo
                </button>
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:max-w-[48%]">
              <div className="px-4 py-4 md:px-6 md:py-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color-mix(in_srgb,var(--cortex-text)_52%,transparent)]">
                  Datos extraídos
                </p>
                <p className="mt-1 text-xs text-[color-mix(in_srgb,var(--cortex-text)_58%,transparent)]">
                  Revisa cada campo antes de confirmar la liquidación.
                </p>

                {scanError ? (
                  <p
                    className="mt-4 rounded-2xl border border-red-500/35 bg-red-500/10 px-3 py-2 text-sm text-red-950 dark:text-red-100"
                    role="alert"
                  >
                    {scanError}
                  </p>
                ) : null}

                {saveError ? (
                  <p
                    className="mt-4 rounded-2xl border border-red-500/35 bg-red-500/10 px-3 py-2 text-sm text-red-950 dark:text-red-100"
                    role="alert"
                  >
                    {saveError}
                  </p>
                ) : null}

                <div className="mt-6 space-y-4">
                  {!file ? (
                    <p className="rounded-2xl border border-dashed border-[color-mix(in_srgb,var(--cortex-sidebar-border)_70%,transparent)] bg-[color-mix(in_srgb,var(--cortex-text)_4%,transparent)] px-4 py-8 text-center text-sm text-[color-mix(in_srgb,var(--cortex-text)_62%,transparent)]">
                      Selecciona o arrastra un comprobante para que Gemini extraiga
                      fecha, RUC, montos y detalle.
                    </p>
                  ) : null}

                  {phase === 'extracting' ? (
                    <>
                      <FieldSkeleton className="h-11 w-full" />
                      <FieldSkeleton className="h-11 w-full" />
                      <FieldSkeleton className="h-11 w-full" />
                      <FieldSkeleton className="h-11 w-full" />
                      <FieldSkeleton className="h-11 w-full" />
                      <FieldSkeleton className="h-11 w-full" />
                      <FieldSkeleton className="h-24 w-full" />
                      <FieldSkeleton className="h-11 w-full" />
                      <div className="flex items-center gap-2 text-xs text-[color-mix(in_srgb,var(--cortex-text)_55%,transparent)]">
                        <Loader2 className="h-4 w-4 animate-spin text-[var(--cortex-accent)]" aria-hidden />
                        Gemini está leyendo el comprobante…
                      </div>
                    </>
                  ) : null}

                  {showForm ? (
                    <>
                      <label className="block">
                        <span className="text-xs font-medium text-[color-mix(in_srgb,var(--cortex-text)_58%,transparent)]">
                          Fecha (YYYY-MM-DD)
                        </span>
                        <input
                          className={inputGlassClass}
                          value={form.fecha}
                          onChange={(e) =>
                            setForm((s) => ({ ...s, fecha: e.target.value }))
                          }
                          placeholder="2025-05-01"
                          disabled={formDisabled}
                        />
                      </label>

                      <label className="block">
                        <span className="text-xs font-medium text-[color-mix(in_srgb,var(--cortex-text)_58%,transparent)]">
                          TC (tipo de comprobante)
                        </span>
                        <select
                          className={selectGlassClass}
                          value={form.tipoComprobante}
                          onChange={(e) =>
                            setForm((s) => ({
                              ...s,
                              tipoComprobante: e.target.value,
                            }))
                          }
                          disabled={formDisabled}
                        >
                          <option value="01">01 — Factura / Factura electrónica</option>
                          <option value="02">
                            02 — RHE / Recibo por honorarios
                          </option>
                          <option value="03">03 — Boleta / Boleta de venta</option>
                          <option value="-">— Otros / no aplicable</option>
                        </select>
                      </label>

                      <label className="block">
                        <span className="text-xs font-medium text-[color-mix(in_srgb,var(--cortex-text)_58%,transparent)]">
                          N° de comprobante
                        </span>
                        <input
                          className={inputGlassClass}
                          value={form.numeroComprobante}
                          onChange={(e) =>
                            setForm((s) => ({
                              ...s,
                              numeroComprobante: e.target.value,
                            }))
                          }
                          placeholder="F003-00003217"
                          disabled={formDisabled}
                          autoComplete="off"
                        />
                      </label>

                      <label className="block">
                        <span className="text-xs font-medium text-[color-mix(in_srgb,var(--cortex-text)_58%,transparent)]">
                          Proveedor
                        </span>
                        <input
                          className={inputGlassClass}
                          value={form.proveedor}
                          onChange={(e) =>
                            setForm((s) => ({ ...s, proveedor: e.target.value }))
                          }
                          disabled={formDisabled}
                        />
                      </label>

                      <label className="block">
                        <span className="text-xs font-medium text-[color-mix(in_srgb,var(--cortex-text)_58%,transparent)]">
                          RUC (11 dígitos)
                        </span>
                        <input
                          inputMode="numeric"
                          className={[
                            inputGlassClass,
                            'tabular-nums',
                            rucInvalidHighlight
                              ? '!border-amber-500 !ring-amber-500/35 focus:!ring-amber-500/50'
                              : '',
                          ].join(' ')}
                          value={form.ruc}
                          onChange={(e) =>
                            setForm((s) => ({
                              ...s,
                              ruc: e.target.value.replace(/\D/g, '').slice(0, 11),
                            }))
                          }
                          placeholder="20123456789"
                          disabled={formDisabled}
                          aria-invalid={rucInvalidHighlight}
                        />
                        {rucInvalidHighlight ? (
                          <span className="mt-1 block text-[11px] text-amber-600 dark:text-amber-400">
                            Revisa el RUC: debe tener 11 dígitos.
                          </span>
                        ) : null}
                      </label>

                      <label className="block">
                        <span className="text-xs font-medium text-[color-mix(in_srgb,var(--cortex-text)_58%,transparent)]">
                          Detalle de gasto
                        </span>
                        <textarea
                          rows={3}
                          className={`${inputGlassClass} resize-none`}
                          value={form.itemDetalle}
                          onChange={(e) =>
                            setForm((s) => ({
                              ...s,
                              itemDetalle: e.target.value,
                            }))
                          }
                          disabled={formDisabled}
                        />
                      </label>

                      <label className="block">
                        <span className="text-xs font-medium text-[color-mix(in_srgb,var(--cortex-text)_58%,transparent)]">
                          Moneda
                        </span>
                        <select
                          className={selectGlassClass}
                          value={form.moneda}
                          onChange={(e) => {
                            const next = e.target.value;
                            setForm((s) => ({
                              ...s,
                              moneda: next,
                              tipoCambio: next === 'PEN' ? '' : s.tipoCambio,
                            }));
                          }}
                          disabled={formDisabled}
                        >
                          <option value="PEN">PEN — Soles (S/)</option>
                          <option value="USD">USD — Dólares ($)</option>
                        </select>
                      </label>

                      {isUsd ? (
                        <label className="block">
                          <span className="text-xs font-medium text-[color-mix(in_srgb,var(--cortex-text)_58%,transparent)]">
                            Tipo de cambio del día
                          </span>
                          <input
                            inputMode="decimal"
                            className={inputGlassClass}
                            value={form.tipoCambio}
                            onChange={(e) =>
                              setForm((s) => ({
                                ...s,
                                tipoCambio: e.target.value,
                              }))
                            }
                            placeholder="Ej. 3.75"
                            disabled={formDisabled}
                          />
                        </label>
                      ) : null}

                      <label className="block">
                        <span className="text-xs font-medium text-[color-mix(in_srgb,var(--cortex-text)_58%,transparent)]">
                          Importe total
                        </span>
                        <input
                          inputMode="decimal"
                          className={`${inputGlassClass} tabular-nums`}
                          value={form.montoTotal}
                          onChange={(e) =>
                            setForm((s) => ({
                              ...s,
                              montoTotal: e.target.value,
                            }))
                          }
                          placeholder="0.00"
                          disabled={formDisabled}
                        />
                        {Number.isFinite(montoNum) ? (
                          <span className="mt-1 block text-[11px] font-medium tabular-nums text-[color-mix(in_srgb,var(--cortex-text)_62%,transparent)]">
                            {formatAmountByCurrency(montoNum, form.moneda)}
                          </span>
                        ) : null}
                      </label>
                    </>
                  ) : null}
                </div>

                <div className="mt-8 flex flex-col-reverse gap-3 pb-6 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => onClose?.()}
                    className="rounded-2xl border border-[color-mix(in_srgb,var(--cortex-sidebar-border)_65%,transparent)] px-5 py-3 text-sm font-semibold text-[var(--cortex-text)] transition hover:bg-[color-mix(in_srgb,var(--cortex-text)_8%,transparent)]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={!canConfirm || phase === 'saving'}
                    onClick={() => void handleConfirm()}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--cortex-accent)] px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-95 disabled:opacity-45"
                  >
                    {phase === 'saving' ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                        Guardando…
                      </>
                    ) : (
                      'Confirmar liquidación'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
