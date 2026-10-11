export type SimulationInput = {
  price: number;
  variable_cost: number;
  fixed_cost: number;
  employees: number;
  interest_rate: number;
  tax_rate: number;
  demand: number;
  marketing_spend: number;
  churn_rate: number;
  price_sensitivity: number;
  period_months: number;
};

export type InputKey = keyof SimulationInput;

export const defaultSimulationInput: Readonly<SimulationInput> = {
  price: 120,
  variable_cost: 45,
  fixed_cost: 25000,
  employees: 12,
  interest_rate: 0.08,
  tax_rate: 0.27,
  demand: 1200,
  marketing_spend: 12000,
  churn_rate: 0.04,
  price_sensitivity: 0.18,
  period_months: 12,
};

export type InputLimit = { min: number; max: number; integer?: boolean };

/**
 * UI ranges for every input, in engine units (rates are decimals: 0.08 = 8%).
 * The reference API bounds (backend/app/simulation/schemas.py) must never be stricter.
 */
export const simulationInputLimits: Readonly<Record<InputKey, InputLimit>> = {
  price: { min: 60, max: 220 },
  variable_cost: { min: 10, max: 120 },
  fixed_cost: { min: 5000, max: 80000 },
  employees: { min: 5, max: 40, integer: true },
  interest_rate: { min: 0, max: 0.25 },
  tax_rate: { min: 0.05, max: 0.35 },
  demand: { min: 200, max: 4000 },
  marketing_spend: { min: 0, max: 40000 },
  churn_rate: { min: 0, max: 0.25 },
  price_sensitivity: { min: 0, max: 0.5 },
  period_months: { min: 1, max: 24, integer: true },
};

export const inputKeys = Object.keys(defaultSimulationInput) as InputKey[];

export function clampToLimit(value: number, { min, max, integer }: InputLimit): number {
  const bounded = Math.min(max, Math.max(min, value));
  return integer ? Math.round(bounded) : bounded;
}

/** Keeps known keys with finite values, clamped to their range; everything else is dropped. */
export function sanitizeInput(candidate: Partial<Record<InputKey, unknown>>): Partial<SimulationInput> {
  const clean: Partial<SimulationInput> = {};
  for (const key of inputKeys) {
    const value = candidate[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      clean[key] = clampToLimit(value, simulationInputLimits[key]);
    }
  }
  return clean;
}
