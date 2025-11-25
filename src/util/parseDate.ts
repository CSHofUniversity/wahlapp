// src/util/parseDate.ts

export function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;

  // Try native parsing first
  const d = new Date(value);
  if (!isNaN(d.getTime())) return d;

  // dd.mm.yyyy fallback
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(value)) {
    const [day, month, year] = value.split(".");
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  return null;
}
