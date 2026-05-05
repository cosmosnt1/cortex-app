import {
  FileWarning,
  Loader2,
  Upload,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';

import { isGeminiConfigured } from '../../services/gemini.js';
import { processDocument } from '../../pipeline/processDocument.js';
import { saveToMemory } from '../../memory/storage.js'; 

import { getFirestoreDb, saveExpenseAndIncrementProject } from '../../services/firebase.js';
import { uploadFileToDrive } from '../../services/drive.js'; 
import { formatAmountByCurrency, formatPen } from '../../utils/money.js';
import { isValidPeruRuc11 } from '../../utils/ruc.js';

function FieldSkeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200 ${className}`} aria-hidden />;
}

const initialForm = () => ({
  actividad: 'Actividad 1 - Crew',
  fecha: '',
  tipoComprobante: '-',
  numeroComprobante: '',
  proveedor: '',
  ruc: '',
  itemDetalle: '',
  moneda: 'PEN',
  tipoCambio: '',
  montoUsd: '',
  montoTotal: '',
});

// CLASES FLEXIBLES
const selectGlassClass =
  'w-full cursor-pointer appearance-none rounded-xl border border-blue-200 bg-white py-3 pl-4 pr-10 text-sm text-slate-800 shadow-sm outline-none transition focus:border-blue-400 focus:shadow-[0_0_15px_rgba(59,130,246,0.15)] break-words whitespace-normal';

const inputGlassClass =
  'mt-1.5 w-full rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-blue-400 focus:shadow-[0_0_15px_rgba(59,130,246,0.15)] break-words';

export default function ExtractionDrawer({ open, onClose, project, onSaved }) {
  const titleId = useId();
  const inputRef = useRef(null);

  const [showBalance, setShowBalance] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const docsRef = useRef(documents);
  useEffect(() => {
    docsRef.current = documents;
  }, [documents]);

  const revokePreview = useCallback(() => {
    docsRef.current.forEach((d) => {
      if (d.previewUrl) URL.revokeObjectURL(d.previewUrl);
    });
  }, []);

  useEffect(() => {
    if (!open) {
      revokePreview();
      setDocuments([]);
      setCurrentIndex(0);
      setIsSaving(false);
    }
  }, [open, revokePreview]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  function handlePickFiles(files) {
    if (!files || files.length === 0) return;
    
    revokePreview();

    const newDocs = Array.from(files).map((f, i) => ({
      id: Date.now() + i,
      file: f,
      previewUrl: URL.createObjectURL(f),
      phase: 'idle',
      form: initialForm(),
      scanError: null,
      isSaved: false,
    }));
    setDocuments(newDocs);
    setCurrentIndex(0);
  }

  // 3. EFECTO DE PROCESAMIENTO (¡Ahora sí con 'documents' en las dependencias!)
  useEffect(() => {
    if (!open || documents.length === 0) return;
    
    const docIndex = currentIndex;
    const currentDoc = documents[docIndex];
    
    if (!currentDoc || currentDoc.phase !== 'idle' || currentDoc.isSaved) return;

    async function processExtraction(docId, file) {
      setDocuments((docs) =>
        docs.map((d) => (d.id === docId ? { ...d, phase: 'extracting', scanError: null } : d))
      );
      
      try {
        const data = await processDocument(file);
        
        setDocuments((prevDocs) =>
          prevDocs.map((d) => {
            if (d.id === docId) {
              return {
                ...d,
                phase: 'ready',
                form: {
                  ...d.form,
                  fecha: data.fecha || '',
                  tipoComprobante: data.tipoComprobante ?? '-',
                  numeroComprobante: data.numeroComprobante ?? '',
                  proveedor: data.proveedor || '',
                  ruc: data.ruc || '',
                  itemDetalle: data.itemDetalle || '',
                  moneda: data.moneda === 'USD' ? 'USD' : 'PEN',
                  tipoCambio: data.moneda === 'USD' && data.tipoCambio ? String(data.tipoCambio) : '',
                  montoUsd: data.moneda === 'USD' && data.montoTotal ? String(data.montoTotal) : '',
                  montoTotal: data.moneda !== 'USD' && data.montoTotal ? String(data.montoTotal) : '',
                },
              };
            }
            return d;
          })
        );
      } catch (err) {
        console.error('[ExtractionDrawer]', err);
        setDocuments((prevDocs) =>
          prevDocs.map((d) => (d.id === docId ? { ...d, phase: 'error', scanError: err?.message ?? 'Error al analizar.' } : d))
        );
      }
    }
    
    processExtraction(currentDoc.id, currentDoc.file);

  // 🔥 ¡AQUÍ ESTÁ LA SOLUCIÓN! Añadimos 'documents' de vuelta a la lista
  }, [open, documents, currentIndex]);

  const currentDoc = documents[currentIndex] || null;
  const form = currentDoc?.form || initialForm();
  const phase = currentDoc?.phase || 'idle';
  const scanError = currentDoc?.scanError || null;
  const isSaved = currentDoc?.isSaved || false;

  const updateForm = (updates) => {
    setDocuments((docs) =>
      docs.map((d, i) => (i === currentIndex ? { ...d, form: { ...d.form, ...updates } } : d))
    );
  };

  const isPdf = currentDoc?.file?.type === 'application/pdf' || currentDoc?.file?.name?.toLowerCase().endsWith('.pdf');
  const rucInvalidHighlight = form.ruc.length > 0 && !isValidPeruRuc11(form.ruc);

  const isUsd = form.moneda === 'USD';
  const montoPenInputNum = Number(String(form.montoTotal).replace(',', '.'));
  const montoUsdNum = Number(String(form.montoUsd).replace(',', '.'));
  const tipoCambioNum = Number(String(form.tipoCambio).replace(',', '.'));
  const montoPenCalculatedNum = isUsd && Number.isFinite(montoUsdNum) && Number.isFinite(tipoCambioNum) ? montoUsdNum * tipoCambioNum : NaN;
  const montoFinalPenNum = isUsd ? montoPenCalculatedNum : montoPenInputNum;

  const showForm = Boolean(currentDoc) && phase !== 'extracting';
  const formDisabled = !currentDoc || phase === 'extracting' || isSaving || isSaved;
  const canConfirm = showForm && !isSaving && !isSaved && Number.isFinite(montoFinalPenNum) && montoFinalPenNum > 0 && isGeminiConfigured();

  const projectId = project?.id ?? project?.projectId ?? project?._id ?? project?.uid ?? null;

  async function handleConfirm() {
    if (!projectId || !canConfirm) return;
    const db = getFirestoreDb();
    if (!db) return alert('Firestore no disponible.');
    setIsSaving(true);
    
    try {
      // 1. GENERAR NOMENCLATURA FORZADA
      const safeProveedor = (form.proveedor || 'Sin_Proveedor').replace(/[^a-zA-Z0-9 \-_]/g, '').trim();
      const safeNum = (form.numeroComprobante || 'S-N').replace(/[^a-zA-Z0-9\-_]/g, '');
      const safeFecha = form.fecha || 'Sin_Fecha';
      
      const originalName = currentDoc.file.name || '';
      const extMatch = originalName.match(/\.([a-z0-9]+)$/i);
      const ext = extMatch ? extMatch[1] : 'pdf';
      
      const forcedFileName = `${safeFecha} - ${safeProveedor} - ${safeNum}.${ext}`;

      // 🧠 ENTRENAMIENTO MANUAL: El sistema aprende lo que tú confirmas como correcto
      saveToMemory(form);

      // 2. SUBIR A GOOGLE DRIVE
      const token = localStorage.getItem('cortex_google_token');
      let driveUrl = null;
      
      if (token && currentDoc && currentDoc.file) {
        try {
          driveUrl = await uploadFileToDrive(currentDoc.file, forcedFileName, token);
        } catch (driveErr) {
          console.error('[Drive Upload Error]', driveErr);
          alert('Hubo un problema subiendo a Drive, pero se guardará el registro en la base de datos.');
        }
      } else {
        console.warn("No hay token de Drive o archivo físico. Guardando solo en Firestore.");
      }

      // 3. GUARDAR EN FIRESTORE
      await saveExpenseAndIncrementProject(db, projectId, {
        actividad: form.actividad,
        fecha: form.fecha,
        tipoComprobante: form.tipoComprobante,
        numeroComprobante: form.numeroComprobante,
        proveedor: form.proveedor,
        ruc: form.ruc,
        itemDetalle: form.itemDetalle,
        moneda: 'PEN', 
        tipoCambio: null,
        montoTotal: montoFinalPenNum,
      }, driveUrl);

      // 4. MARCAR COMO COMPLETADO Y AVANZAR
      setDocuments((docs) => docs.map((d, i) => (i === currentIndex ? { ...d, isSaved: true } : d)));
      onSaved?.();
      
      if (currentIndex < documents.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      }
    } catch (err) {
      console.error('[ExtractionDrawer save]', err);
      alert(err?.message ?? 'No se pudo guardar el gasto.');
    } finally {
      setIsSaving(false);
    }
  }

  if (!open) return null;
  const geminiReady = isGeminiConfigured();

  return (
    <div className="fixed inset-0 z-[60]" role="presentation">
      <button
        type="button"
        aria-label="Cerrar panel"
        className="fixed inset-0 h-screen w-screen bg-slate-800/40 backdrop-blur-md transition-opacity"
        onClick={() => onClose?.()}
      />

      <div className="fixed inset-0 pointer-events-none flex flex-col items-center justify-center p-4 md:p-8 z-[61]">
        <div className="flex items-center justify-center gap-6 w-full max-w-[85rem] h-full pointer-events-auto">
          
          {!geminiReady ? (
            <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white/90 p-8 text-center backdrop-blur-xl shadow-2xl">
              <FileWarning className="h-10 w-10 text-amber-500 mx-auto" aria-hidden />
              <p className="max-w-md text-sm text-slate-500 mt-4 mx-auto">
                Configura VITE_GEMINI_API_KEY en tu archivo .env y reinicia Vite.
              </p>
            </div>
          ) : (
            <>
              {/* CAJA IZQUIERDA: PREVIEW */}
              <section className="flex h-full w-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-slate-50/95 backdrop-blur-xl shadow-2xl lg:w-[48%]">
                <p className="shrink-0 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 md:px-6 border-b border-slate-200">
                  Vista previa
                </p>
                <div
                  className="relative flex-1 bg-slate-100/50"
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files) handlePickFiles(e.dataTransfer.files);
                  }}
                >
                  {!currentDoc ? (
                    <button
                      type="button"
                      onClick={() => inputRef.current?.click()}
                      className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center transition hover:bg-slate-200/50"
                    >
                      <Upload className="h-10 w-10 text-blue-500" aria-hidden />
                      <span className="text-sm font-bold text-slate-700">
                        Arrastra uno o varios comprobantes
                      </span>
                      <span className="text-xs text-slate-500">
                        Procesamiento por lotes (PDF, JPG, PNG)
                      </span>
                    </button>
                  ) : isPdf ? (
                    <div className="h-full w-full p-4">
                      <div className="h-full w-full overflow-hidden rounded-2xl border border-slate-300 shadow-inner bg-white">
                        <iframe 
                          src={`${currentDoc.previewUrl}#view=FitH&toolbar=0&navpanes=0`} 
                          className="h-full w-full bg-white" 
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="h-full w-full p-4 flex items-center justify-center overflow-hidden">
                      <div className="rounded-2xl border border-slate-300 shadow-inner bg-slate-100 overflow-hidden">
                         <img src={currentDoc.previewUrl} alt="Comprobante" className="max-h-[min(65vh,600px)] w-auto max-w-full object-contain" />
                      </div>
                    </div>
                  )}
                  <input
                    ref={inputRef}
                    type="file"
                    multiple
                    accept="application/pdf,image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) handlePickFiles(e.target.files);
                      e.target.value = '';
                    }}
                  />
                </div>

                <div className="flex items-center justify-between gap-4 p-5 border-t border-slate-200 bg-white">
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="rounded-xl border-2 border-yellow-400 bg-yellow-50 px-5 py-3 text-sm font-bold text-yellow-700 transition hover:bg-yellow-100 shadow-sm"
                  >
                    Subir nuevos
                  </button>

                  {documents.length > 0 && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={currentIndex === 0}
                        onClick={() => setCurrentIndex((c) => c - 1)}
                        className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md transition hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>

                      <div className="flex h-11 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-4 shadow-sm">
                        <span className="text-xs font-bold uppercase tracking-tight text-blue-700">
                          {currentIndex + 1} / {documents.length}
                        </span>
                      </div>

                      <button
                        type="button"
                        disabled={currentIndex === documents.length - 1}
                        onClick={() => setCurrentIndex((c) => c + 1)}
                        className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md transition hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>
              </section>

              {/* CAJA DERECHA: FORMULARIO */}
              <section className="flex h-full w-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white/95 backdrop-blur-xl shadow-2xl lg:w-[52%]">
                <header className="shrink-0 p-5 md:p-6 border-b border-slate-200 bg-white/90 backdrop-blur-xl z-20 flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 id={titleId} className="text-xl font-bold tracking-tight text-slate-900">
                        {project?.name || 'Proyecto sin nombre'}
                      </h2>
                      <p className="text-xs font-medium text-slate-500 mt-1">
                        {project?.empresa || 'Empresa no definida'} - {project?.fondoGanado || 'Fondo no definido'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowBalance(!showBalance)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition shadow-sm"
                      >
                        <span className="text-base">{showBalance ? '🙈' : '👁️'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onClose?.()}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition shadow-sm text-slate-400"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {showBalance && (
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-900 text-[11px] font-bold tracking-wide border border-emerald-200 shadow-sm">
                        Dinero liquidado: {formatPen(project?.spentAmount)}
                      </span>
                      <span className="px-3 py-1.5 rounded-lg bg-purple-100 text-purple-900 text-[11px] font-bold tracking-wide border border-purple-200 shadow-sm">
                        Dinero por liquidar: {formatPen((project?.totalBudget || 0) - (project?.spentAmount || 0))}
                      </span>
                    </div>
                  )}

                  <label className="block mt-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider flex items-center text-slate-500 mb-1.5">
                      <span className="text-[13px] text-black mr-1.5 opacity-100">📁</span>
                      Actividad a la que pertenece este comprobante
                    </span>
                    <div className="relative mt-1.5">
                      <select
                        className={selectGlassClass}
                        value={form.actividad}
                        disabled={formDisabled}
                        onChange={(e) => updateForm({ actividad: e.target.value })}
                      >
                        <option value="Actividad 1 - Crew">Actividad 1 - Crew</option>
                        <option value="Actividad 2 - Pre-producción">Actividad 2 - Pre-producción</option>
                        <option value="Actividad 3 - Rodaje">Actividad 3 - Rodaje</option>
                        <option value="+ Añadir nueva actividad">+ Añadir nueva actividad</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    </div>
                  </label>
                </header>

                <div className="flex-1 overflow-y-auto p-5 md:p-6 bg-slate-50/30">
                  <div className="mb-6">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                      Datos extraídos
                    </p>
                    <p className="mt-1 text-xs text-slate-500 font-medium">
                      Revisa cada campo antes de confirmar la liquidación.
                    </p>
                  </div>

                  {scanError && (
                    <p className="mb-5 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 shadow-sm break-words">
                      {scanError}
                    </p>
                  )}

                  <div className="space-y-4">
                    {phase === 'extracting' ? (
                      <div className="space-y-4">
                        <FieldSkeleton className="h-12 w-full" />
                        <FieldSkeleton className="h-12 w-full" />
                        <FieldSkeleton className="h-12 w-full" />
                        <FieldSkeleton className="h-24 w-full" />
                        <div className="flex items-center gap-3 justify-center text-xs font-bold text-blue-600 mt-8 bg-blue-50 py-3 rounded-xl border border-blue-100">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Procesando el documento...
                        </div>
                      </div>
                    ) : null}

                    {showForm ? (
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-12">
                        
                        {/* Fila 1 */}
                        <label className="block sm:col-span-4">
                          <span className="text-xs font-semibold flex items-center text-slate-600 mb-1">
                            <span className="text-[13px] text-black mr-1.5 opacity-100">📅</span>
                            Fecha (YYYY-MM-DD)
                          </span>
                          <input
                            className={inputGlassClass}
                            value={form.fecha}
                            onChange={(e) => updateForm({ fecha: e.target.value })}
                            placeholder="2026-04-17"
                            disabled={formDisabled}
                          />
                        </label>

                        <label className="block relative sm:col-span-8">
                          <span className="text-xs font-semibold flex items-center text-slate-600 mb-1">
                            <span className="text-[13px] text-black mr-1.5 opacity-100">🧾</span>
                            TC (tipo de comprobante)
                          </span>
                          <div className="relative mt-1.5 h-full">
                            <select
                              className={selectGlassClass}
                              value={form.tipoComprobante}
                              onChange={(e) => updateForm({ tipoComprobante: e.target.value })}
                              disabled={formDisabled}
                            >
                              <option value="01">01 — Factura / Factura electrónica</option>
                              <option value="02">02 — RHE / Recibo por honorarios</option>
                              <option value="03">03 — Boleta / Boleta de venta</option>
                              <option value="-">— Otros / no aplicable</option>
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                          </div>
                        </label>

                        {/* Fila 2 */}
                        <label className="block sm:col-span-4">
                          <span className="text-xs font-semibold flex items-center text-slate-600 mb-1">
                            <span className="text-[13px] text-black mr-1.5 opacity-100">🔢</span> 
                            N° comprobante
                          </span>
                          <input
                            className={inputGlassClass}
                            value={form.numeroComprobante}
                            onChange={(e) => updateForm({ numeroComprobante: e.target.value })}
                            placeholder="F003-00003217"
                            disabled={formDisabled}
                          />
                        </label>

                        <label className="block sm:col-span-8">
                          <span className="text-xs font-semibold flex items-center text-slate-600 mb-1">
                            <span className="text-[13px] text-black mr-1.5 opacity-100">🏢</span> 
                            Proveedor
                          </span>
                          <input
                            className={inputGlassClass}
                            value={form.proveedor}
                            onChange={(e) => updateForm({ proveedor: e.target.value })}
                            disabled={formDisabled}
                          />
                        </label>

                        {/* Fila 3 */}
                        <label className="block sm:col-span-5">
                          <span className="text-xs font-semibold flex items-center text-slate-600 mb-1">
                            <span className="text-[13px] text-black mr-1.5 opacity-100">🆔</span> 
                            RUC (11 dígitos)
                          </span>
                          <input
                            inputMode="numeric"
                            className={`${inputGlassClass} tabular-nums ${rucInvalidHighlight ? '!border-amber-400 !bg-amber-50' : ''}`}
                            value={form.ruc}
                            onChange={(e) => updateForm({ ruc: e.target.value.replace(/\D/g, '').slice(0, 11) })}
                            placeholder="20123456789"
                            disabled={formDisabled}
                          />
                        </label>

                        {/* Fila 4: Detalle ocupa el 100% */}
                        <label className="block sm:col-span-12">
                          <span className="text-xs font-semibold flex items-center text-slate-600 mb-1">
                            <span className="text-[13px] text-black mr-1.5 opacity-100">📝</span> 
                            Detalle de gasto
                          </span>
                          <textarea
                            rows={3}
                            className={`${inputGlassClass} resize-none`}
                            value={form.itemDetalle}
                            onChange={(e) => updateForm({ itemDetalle: e.target.value })}
                            disabled={formDisabled}
                          />
                        </label>

                        {/* Fila 5: Moneda y Totales dinámicos */}
                        {isUsd ? (
                          <>
                            {/* DÓLARES: 3 cajas arriba, 1 caja grande abajo */}
                            <label className="block relative sm:col-span-4">
                              <span className="text-xs font-semibold flex items-center text-slate-600 mb-1">
                                <span className="text-[13px] text-black mr-1.5 opacity-100">💱</span> 
                                Moneda
                              </span>
                              <div className="relative mt-1.5 h-full">
                                <select
                                  className={selectGlassClass}
                                  value={form.moneda}
                                  onChange={(e) => {
                                    const next = e.target.value;
                                    updateForm({
                                      moneda: next,
                                      tipoCambio: next === 'PEN' ? '' : form.tipoCambio,
                                      montoUsd: next === 'USD' ? form.montoUsd || form.montoTotal : form.montoUsd,
                                    });
                                  }}
                                  disabled={formDisabled}
                                >
                                  <option value="PEN">PEN — Soles (S/)</option>
                                  <option value="USD">USD — Dólares ($)</option>
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                              </div>
                            </label>

                            <label className="block sm:col-span-4">
                              <span className="text-xs font-semibold flex items-center text-slate-600 mb-1">
                                <span className="text-[13px] text-black mr-1.5 opacity-100">💵</span>
                                Importe (USD)
                              </span>
                              <input
                                inputMode="decimal"
                                className={`${inputGlassClass} tabular-nums font-bold`}
                                value={form.montoUsd}
                                onChange={(e) => updateForm({ montoUsd: e.target.value })}
                                placeholder="0.00"
                                disabled={formDisabled}
                              />
                            </label>

                            <label className="block sm:col-span-4">
                              <span className="text-xs font-semibold flex items-center text-slate-600 mb-1">
                                <span className="text-[13px] text-black mr-1.5 opacity-100">📈</span> 
                                Tipo de cambio
                              </span>
                              <input
                                inputMode="decimal"
                                className={`${inputGlassClass} tabular-nums`}
                                value={form.tipoCambio}
                                onChange={(e) => updateForm({ tipoCambio: e.target.value })}
                                placeholder="Ej. 3.75"
                                disabled={formDisabled}
                              />
                            </label>

                            <label className="block sm:col-span-12">
                              <span className="text-xs font-semibold flex items-center text-slate-600 mb-1">
                                <span className="text-[13px] text-black mr-1.5 opacity-100">💰</span>
                                Importe total (S/) calculado
                              </span>
                              <input
                                inputMode="decimal"
                                className={`${inputGlassClass} tabular-nums bg-slate-100 text-slate-500 font-bold`}
                                value={Number.isFinite(montoPenCalculatedNum) ? montoPenCalculatedNum.toFixed(2) : ''}
                                placeholder="0.00"
                                disabled
                                readOnly
                              />
                            </label>
                          </>
                        ) : (
                          <>
                            {/* SOLES: Moneda es ancha (7 col), Importe es corto (5 col) */}
                            <label className="block relative sm:col-span-7">
                              <span className="text-xs font-semibold flex items-center text-slate-600 mb-1">
                                <span className="text-[13px] text-black mr-1.5 opacity-100">💱</span> 
                                Moneda
                              </span>
                              <div className="relative mt-1.5 h-full">
                                <select
                                  className={selectGlassClass}
                                  value={form.moneda}
                                  onChange={(e) => {
                                    const next = e.target.value;
                                    updateForm({
                                      moneda: next,
                                      tipoCambio: next === 'PEN' ? '' : form.tipoCambio,
                                      montoUsd: next === 'USD' ? form.montoUsd || form.montoTotal : form.montoUsd,
                                    });
                                  }}
                                  disabled={formDisabled}
                                >
                                  <option value="PEN">PEN — Soles (S/)</option>
                                  <option value="USD">USD — Dólares ($)</option>
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                              </div>
                            </label>

                            <label className="block sm:col-span-5">
                              <span className="text-xs font-semibold flex items-center text-slate-600 mb-1">
                                <span className="text-[13px] text-black mr-1.5 opacity-100">💰</span>
                                Importe total
                              </span>
                              <input
                                inputMode="decimal"
                                className={`${inputGlassClass} tabular-nums font-bold`}
                                value={form.montoTotal}
                                onChange={(e) => updateForm({ montoTotal: e.target.value })}
                                placeholder="0.00"
                                disabled={formDisabled}
                              />
                            </label>
                          </>
                        )}
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() => onClose?.()}
                      className="rounded-xl border border-red-200 bg-red-50 px-6 py-3.5 text-sm font-bold text-red-600 transition hover:bg-red-100 hover:shadow-[0_0_15px_rgba(248,113,113,0.3)]"
                    >
                      Cancelar
                    </button>
                    
                    {isSaved ? (
                      <button
                        type="button"
                        disabled
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-100 border border-emerald-300 px-6 py-3.5 text-sm font-bold text-emerald-800 opacity-100"
                      >
                        ✅ Comprobante Liquidado
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={!canConfirm}
                        onClick={() => void handleConfirm()}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] disabled:opacity-40"
                      >
                        {isSaving ? (
                          <><Loader2 className="h-5 w-5 animate-spin" aria-hidden /> Guardando…</>
                        ) : (
                          'Confirmar liquidación'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </section>

            </>
          )}
        </div>
      </div>
    </div>
  );
}