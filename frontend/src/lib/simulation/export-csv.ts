import type { SimulationResult } from "./engine";

const decimal = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  useGrouping: false,
});

const monthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

/** Spreadsheet-ready projection: semicolons and comma decimals, as Excel pt-BR expects. */
export function projectionToCsv(result: SimulationResult): string {
  const rows = result.months.map((month, index) =>
    [
      monthKey(month),
      decimal.format(result.revenue_series[index]),
      decimal.format(result.profit_series[index]),
    ].join(";"),
  );
  return [["Mês", "Receita (R$)", "Lucro (R$)"].join(";"), ...rows].join("\r\n") + "\r\n";
}

/** File name carrying the first projected month. */
export function projectionFileName(result: SimulationResult): string {
  return `projecao-${monthKey(result.months[0])}.csv`;
}
