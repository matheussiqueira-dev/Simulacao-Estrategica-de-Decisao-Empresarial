import { describe, expect, it } from "vitest";

import { runSimulation } from "./engine";
import { projectionFileName, projectionToCsv } from "./export-csv";
import { defaultSimulationInput } from "./limits";

const start = new Date(2026, 10, 1);
const result = runSimulation({ ...defaultSimulationInput, period_months: 6 }, start);

describe("projectionToCsv", () => {
  it("writes a header and one line per projected month", () => {
    const lines = projectionToCsv(result).trimEnd().split("\r\n");
    expect(lines[0]).toBe("Mês;Receita (R$);Lucro (R$)");
    expect(lines).toHaveLength(7);
    expect(lines[1].startsWith("2026-11;")).toBe(true);
    expect(lines[6].startsWith("2027-04;")).toBe(true);
  });

  it("uses comma decimals, no grouping, and the engine values", () => {
    const [, revenue, profit] = projectionToCsv(result).split("\r\n")[1].split(";");
    expect(Number(revenue.replace(",", "."))).toBeCloseTo(result.revenue_series[0], 2);
    expect(Number(profit.replace(",", "."))).toBeCloseTo(result.profit_series[0], 2);
    expect(revenue).toMatch(/^-?\d+,\d{2}$/);
  });
});

describe("projectionFileName", () => {
  it("names the file after the first projected month", () => {
    expect(projectionFileName(result)).toBe("projecao-2026-11.csv");
  });
});
