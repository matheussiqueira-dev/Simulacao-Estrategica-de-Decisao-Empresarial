// Simulation engine: the single source of the formulas used by the app.
// A port of the reference Python engine (backend/app/simulation/engine.py); both
// must reproduce fixtures/simulation-golden.json (see engine.test.ts).

import type { SimulationInput } from "./limits";

/** Model assumptions that are not inputs. Shown to visitors in "Premissas do modelo". */
export const MODEL_ASSUMPTIONS = {
  baseSalary: 4200,
  debt: 150_000,
  workingCapitalRatio: 0.12,
  depreciationRate: 0.05,
  seasonalityAmplitude: 0.08,
  /** Price competitiveness factor bounds (demand multiplier caused by the price). */
  minPriceFactor: 0.6,
  maxPriceFactor: 1.3,
} as const;

/** Months summed into the annual profit, whatever the displayed horizon. */
const MONTHS_PER_YEAR = 12;

export type SimulationResult = {
  /** First projected month (the current month), after costs, interest and taxes. */
  monthly_profit: number;
  /** Sum of the next 12 projected months. */
  annual_profit: number;
  cash_flow: number;
  safety_margin: number;
  growth_rate: number;
  risk_index: number;
  /** Monthly units after the price effect; the demand both KPIs and projection use. */
  effective_demand: number;
  breakeven_units: number;
  revenue_series: number[];
  profit_series: number[];
  /** First day of each projected month (local time). */
  months: Date[];
};

const clip = (value: number, low: number, high: number) => Math.min(Math.max(value, low), high);

/** Python's round(x, n) for the magnitudes used here (ties only differ beyond the tolerance). */
const round = (value: number, digits: number) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

function operatingCosts(input: SimulationInput) {
  return input.employees * MODEL_ASSUMPTIONS.baseSalary + input.fixed_cost + input.marketing_spend;
}

function interestExpense(input: SimulationInput) {
  return (MODEL_ASSUMPTIONS.debt * input.interest_rate) / 12;
}

/** Demand multiplier from the price: above R$ 100, sensitive markets buy less. */
export function priceFactor(input: SimulationInput): number {
  return clip(
    1 - input.price_sensitivity * ((input.price - 100) / 100),
    MODEL_ASSUMPTIONS.minPriceFactor,
    MODEL_ASSUMPTIONS.maxPriceFactor,
  );
}

/** Units per month needed to cover operating costs and interest (taxes are zero at breakeven). */
export function breakevenUnits(input: SimulationInput): number {
  const contributionMargin = input.price - input.variable_cost;
  return (operatingCosts(input) + interestExpense(input)) / Math.max(contributionMargin, 1e-3);
}

function monthOutcome(input: SimulationInput, units: number) {
  const revenue = input.price * units;
  const profitBeforeTax =
    revenue - input.variable_cost * units - operatingCosts(input) - interestExpense(input);
  const taxes = Math.max(profitBeforeTax, 0) * input.tax_rate;
  return { revenue, profit: profitBeforeTax - taxes };
}

export function runSimulation(input: SimulationInput, start: Date = new Date()): SimulationResult {
  const effectiveDemand = input.demand * priceFactor(input);

  const marketingFactor = Math.log1p(input.marketing_spend) / 10_000;
  const pricePenalty = input.price_sensitivity * Math.max((input.price - 100) / 100, 0);
  const churnPenalty = input.churn_rate * 0.6;
  const monthlyGrowth = clip(0.01 + marketingFactor - pricePenalty - churnPenalty, -0.1, 0.25);

  // Projected long enough to also cover a full year for the annual figure.
  const projected = Math.max(input.period_months, MONTHS_PER_YEAR);
  const outcomes = Array.from({ length: projected }, (_, idx) => {
    const seasonality =
      1 + MODEL_ASSUMPTIONS.seasonalityAmplitude * Math.sin((2 * Math.PI * idx) / 12);
    // A shrinking market stops at zero: demand never goes negative.
    const trend = Math.max(1 + monthlyGrowth * idx, 0);
    return monthOutcome(input, effectiveDemand * trend * seasonality);
  });

  const current = outcomes[0];
  const depreciation = input.fixed_cost * MODEL_ASSUMPTIONS.depreciationRate;
  const workingCapitalChange = current.revenue * MODEL_ASSUMPTIONS.workingCapitalRatio;
  const cashFlow = current.profit + depreciation - workingCapitalChange / input.period_months;

  const breakeven = breakevenUnits(input);
  const safetyMargin = (effectiveDemand - breakeven) / Math.max(effectiveDemand, 1e-3);
  const riskIndex = clip(1 - safetyMargin, 0, 1);

  const shown = outcomes.slice(0, input.period_months);
  const annualProfit = outcomes
    .slice(0, MONTHS_PER_YEAR)
    .reduce((total, outcome) => total + outcome.profit, 0);

  return {
    monthly_profit: round(current.profit, 2),
    annual_profit: round(annualProfit, 2),
    cash_flow: round(cashFlow, 2),
    safety_margin: round(safetyMargin, 3),
    growth_rate: round(monthlyGrowth * 12, 3),
    risk_index: round(riskIndex, 3),
    effective_demand: effectiveDemand,
    breakeven_units: breakeven,
    revenue_series: shown.map((outcome) => round(outcome.revenue, 2)),
    profit_series: shown.map((outcome) => round(outcome.profit, 2)),
    months: shown.map((_, idx) => new Date(start.getFullYear(), start.getMonth() + idx, 1)),
  };
}
