/**
 * Parses a number typed by a pt-BR (or en) user. Returns null for anything that
 * is not a finite number.
 *
 * - "1234,5", "1.234,5" → 1234.5 (comma is the decimal separator, dots group)
 * - "25.000" → 25000 (dots in groups of three are thousands separators)
 * - "1234.5", "0.08", "1.5" → decimal dot
 */
export function parseDecimal(raw: string): number | null {
  let text = raw.trim().replace(/\s+/g, "");
  if (text === "") return null;

  if (text.includes(",")) {
    if (!/^-?\d{1,3}(\.\d{3})*(,\d+)?$|^-?\d+(,\d+)?$/.test(text)) return null;
    text = text.replace(/\./g, "").replace(",", ".");
  } else if (/^-?\d{1,3}(\.\d{3})+$/.test(text)) {
    text = text.replace(/\./g, "");
  } else if (!/^-?(\d+\.?\d*|\.\d+)$/.test(text)) {
    return null;
  }

  const value = Number(text);
  return Number.isFinite(value) ? value : null;
}
