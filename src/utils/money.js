/** Formato único para todos los montos en PEN (con decimales según locale). */
const penFormatter = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
});

export function formatPen(value) {
  const n = Number(value);
  return penFormatter.format(Number.isFinite(n) ? n : 0);
}

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export function formatUsd(value) {
  const n = Number(value);
  return usdFormatter.format(Number.isFinite(n) ? n : 0);
}

/** Vista previa según moneda DAFO (PEN / USD). */
export function formatAmountByCurrency(value, moneda) {
  const m = String(moneda ?? 'PEN').toUpperCase();
  return m === 'USD' ? formatUsd(value) : formatPen(value);
}
