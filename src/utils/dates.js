/**
 * Ej.: "12 May, 10:30 AM" (legible para productores; mes en inglés corto).
 */
export function formatBankLastUpdate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return null;
  }
  const day = date.getDate();
  const month = date.toLocaleString('en-GB', { month: 'short' });
  const time = date.toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return `${day} ${month}, ${time}`;
}
