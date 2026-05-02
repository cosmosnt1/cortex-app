/** RUC Perú: 11 dígitos (sin validar dígito verificador SUNAT). */
export function normalizeRucDigits(value) {
  if (value == null) return '';
  return String(value).replace(/\D/g, '');
}

export function isValidPeruRuc11(value) {
  return normalizeRucDigits(value).length === 11;
}
