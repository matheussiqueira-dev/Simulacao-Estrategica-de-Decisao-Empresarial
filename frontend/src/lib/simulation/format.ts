// pt-BR / BRL presentation helpers (A.6: Intl.NumberFormat("pt-BR"), percent with one decimal).

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const compactCurrency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  notation: "compact",
  maximumFractionDigits: 1,
});

const percent = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const integer = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });

const monthShort = new Intl.DateTimeFormat("pt-BR", { month: "short", year: "2-digit" });
const monthLong = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" });

export const formatCurrency = (value: number) => currency.format(value);
export const formatCompactCurrency = (value: number) => compactCurrency.format(value);
/** 0.084 → "8,4%" */
export const formatPercent = (value: number) => percent.format(value);
export const formatInteger = (value: number) => integer.format(value);
/** "out. de 26" → "out. 26" */
export const formatMonthShort = (date: Date) => monthShort.format(date).replace(" de ", " ");
export const formatMonthLong = (date: Date) => monthLong.format(date);

/** Plain number for an editable field: comma decimals, no thousands separators. */
export function formatEditable(value: number, maxFractionDigits: number): string {
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: maxFractionDigits,
    useGrouping: false,
  }).format(value);
}
