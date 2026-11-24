export function formatPKR(value: number): string {
  const abs = Math.abs(value);
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: abs % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(abs);
  return value < 0 ? `-PKR ${formatted}` : `PKR ${formatted}`;
}

export function formatSignedPKR(value: number): string {
  const abs = Math.abs(value);
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: abs % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(abs);
  if (value > 0) return `+PKR ${formatted}`;
  if (value < 0) return `-PKR ${formatted}`;
  return `PKR ${formatted}`;
}
