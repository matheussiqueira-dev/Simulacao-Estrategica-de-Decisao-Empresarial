import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { MODEL_ASSUMPTIONS, breakevenUnits, runSimulation } from "./engine";
import { type SimulationInput, defaultSimulationInput } from "./limits";

type GoldenCase = {
  name: string;
  input: SimulationInput;
  expected: Record<
    | "monthly_profit"
    | "annual_profit"
    | "cash_flow"
    | "safety_margin"
    | "growth_rate"
    | "risk_index",
    number
  > & { revenue_series: number[]; profit_series: number[] };
};

// Shared with backend/tests/test_engine_golden.py; regenerate with backend/scripts/generate_golden.py.
const goldenPath = fileURLToPath(
  new URL("../../../../fixtures/simulation-golden.json", import.meta.url),
);
const { cases } = JSON.parse(readFileSync(goldenPath, "utf8")) as { cases: GoldenCase[] };

const MONEY_TOLERANCE = 0.01;
const RATIO_TOLERANCE = 0.001;

describe("runSimulation matches the Python reference (golden fixtures)", () => {
  it("covers at least ten cases", () => {
    expect(cases.length).toBeGreaterThanOrEqual(10);
  });

  it.each(cases)("$name", ({ input, expected }) => {
    const result = runSimulation(input, new Date(2026, 0, 1));

    for (const key of ["monthly_profit", "annual_profit", "cash_flow"] as const) {
      expect(Math.abs(result[key] - expected[key]), key).toBeLessThanOrEqual(MONEY_TOLERANCE);
    }
    for (const key of ["safety_margin", "growth_rate", "risk_index"] as const) {
      expect(Math.abs(result[key] - expected[key]), key).toBeLessThanOrEqual(RATIO_TOLERANCE);
    }
    for (const key of ["revenue_series", "profit_series"] as const) {
      expect(result[key]).toHaveLength(expected[key].length);
      result[key].forEach((value, index) => {
        expect(Math.abs(value - expected[key][index]), `${key}[${index}]`).toBeLessThanOrEqual(
          MONEY_TOLERANCE,
        );
      });
    }
  });
});

describe("runSimulation", () => {
  it("projects months from the start month, rolling over the year", () => {
    const { months } = runSimulation(
      { ...defaultSimulationInput, period_months: 3 },
      new Date(2026, 10, 20),
    );
    expect(months.map((m) => [m.getFullYear(), m.getMonth() + 1, m.getDate()])).toEqual([
      [2026, 11, 1],
      [2026, 12, 1],
      [2027, 1, 1],
    ]);
  });

  it("only produces finite numbers across the extremes of every range", () => {
    const extremes: SimulationInput[] = [
      { ...defaultSimulationInput, price: 60, variable_cost: 120, demand: 200 },
      { ...defaultSimulationInput, price: 220, demand: 4000, marketing_spend: 40000 },
    ];
    for (const input of extremes) {
      const result = runSimulation(input);
      const numbers = [
        result.monthly_profit,
        result.cash_flow,
        result.safety_margin,
        result.risk_index,
        result.growth_rate,
        ...result.revenue_series,
        ...result.profit_series,
      ];
      expect(numbers.every(Number.isFinite)).toBe(true);
    }
  });
});

describe("breakevenUnits", () => {
  it("covers operating costs and interest at the contribution margin", () => {
    const input = defaultSimulationInput;
    const operating =
      input.employees * MODEL_ASSUMPTIONS.baseSalary + input.fixed_cost + input.marketing_spend;
    const interest = (MODEL_ASSUMPTIONS.debt * input.interest_rate) / 12;
    expect(breakevenUnits(input)).toBeCloseTo(
      (operating + interest) / (input.price - input.variable_cost),
      6,
    );
  });

  it("agrees with the safety margin reported by the engine", () => {
    const result = runSimulation(defaultSimulationInput);
    const margin = (defaultSimulationInput.demand - result.breakeven_units) / defaultSimulationInput.demand;
    expect(margin).toBeCloseTo(result.safety_margin, 3);
  });
});
