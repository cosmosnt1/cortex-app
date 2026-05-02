/** Formato único para todos los montos en PEN (con decimales según locale). */
const penFormatter = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
});

export function formatPen(value) {
  const n = Number(value);
  return penFormatter.format(Number.isFinite(n) ? n : 0);
}
