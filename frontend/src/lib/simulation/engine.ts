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
} as const;

export type SimulationResult = {
  monthly_profit: number;
  annual_profit: number;
  cash_flow: number;
  safety_margin: number;
  growth_rate: number;
  risk_index: number;
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

/** Units per month needed to cover operating costs and interest (taxes are zero at breakeven). */
export function breakevenUnits(input: SimulationInput): number {
  const contributionMargin = input.price - input.variable_cost;
  return (operatingCosts(input) + interestExpense(input)) / Math.max(contributionMargin, 1e-3);
}

export function runSimulation(input: SimulationInput, start: Date = new Date()): SimulationResult {
  const operating = operatingCosts(input);
  const interest = interestExpense(input);

  const revenue = input.price * input.demand;
  const grossProfit = revenue - input.variable_cost * input.demand;
  const profitBeforeTax = grossProfit - operating - interest;
  const taxes = Math.max(profitBeforeTax, 0) * input.tax_rate;
  const netProfit = profitBeforeTax - taxes;

  const depreciation = input.fixed_cost * MODEL_ASSUMPTIONS.depreciationRate;
  const workingCapitalChange = revenue * MODEL_ASSUMPTIONS.workingCapitalRatio;
  const cashFlow = netProfit + depreciation - workingCapitalChange / input.period_months;

  const breakeven = breakevenUnits(input);
  const safetyMargin = (input.demand - breakeven) / Math.max(input.demand, 1e-3);
  const riskIndex = clip(1 - safetyMargin, 0, 1);

  const marketingFactor = Math.log1p(input.marketing_spend) / 10_000;
  const pricePenalty = input.price_sensitivity * Math.max((input.price - 100) / 100, 0);
  const churnPenalty = input.churn_rate * 0.6;
  const monthlyGrowth = clip(0.01 + marketingFactor - pricePenalty - churnPenalty, -0.1, 0.25);

  const priceCompetitiveness = clip(
    1 - input.price_sensitivity * ((input.price - 100) / 100),
    0.6,
    1.3,
  );
  const months = input.period_months;
  const revenueSeries: number[] = [];
  const profitSeries: number[] = [];
  const monthDates: Date[] = [];
  for (let idx = 0; idx < months; idx += 1) {
    const seasonality =
      1 + MODEL_ASSUMPTIONS.seasonalityAmplitude * Math.sin((2 * Math.PI * idx) / 12);
    const trend = 1 + monthlyGrowth * idx;
    const demandProjection = (input.demand / months) * trend * seasonality * priceCompetitiveness;
    const monthRevenue = input.price * demandProjection;
    const monthProfit =
      monthRevenue -
      input.variable_cost * demandProjection -
      operating / months -
      interest / months -
      taxes / months;
    revenueSeries.push(round(monthRevenue, 2));
    profitSeries.push(round(monthProfit, 2));
    monthDates.push(new Date(start.getFullYear(), start.getMonth() + idx, 1));
  }

  return {
    monthly_profit: round(netProfit, 2),
    annual_profit: round(netProfit * 12, 2),
    cash_flow: round(cashFlow, 2),
    safety_margin: round(safetyMargin, 3),
    growth_rate: round(monthlyGrowth * 12, 3),
    risk_index: round(riskIndex, 3),
    breakeven_units: breakeven,
    revenue_series: revenueSeries,
    profit_series: profitSeries,
    months: monthDates,
  };
}
