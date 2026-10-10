'use client';

import { useCallback, useEffect, useReducer, useRef } from "react";

import {
  SimulationInput,
  SimulationResult,
  clampToLimit,
  defaultSimulationInput,
  emptySimulationResult,
  simulationInputLimits,
} from "../types";

type Status = "connecting" | "live" | "error";

type State = {
  variables: SimulationInput;
  result: SimulationResult;
  status: Status;
  lastUpdated: number | null;
  serverError: string | null;
};

type Action =
  | { type: "setVar"; key: keyof SimulationInput; value: number }
  | { type: "setResult"; result: SimulationResult }
  | { type: "setStatus"; status: Status }
  | { type: "setServerError"; message: string }
  | { type: "replaceVars"; vars: SimulationInput };

// Same origin by default: on Vercel the backend service owns /api. Set it to the API
// origin (e.g. http://localhost:8000) when running the Next and FastAPI dev servers apart.
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");
const RUN_ENDPOINT = `${API_BASE_URL}/api/scenarios/run`;
const DEBOUNCE_MS = 160;
const REQUEST_TIMEOUT_MS = 8_000;

const initialState: State = {
  variables: defaultSimulationInput,
  result: emptySimulationResult,
  status: "connecting",
  lastUpdated: null,
  serverError: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "setVar": {
      const variables = { ...state.variables, [action.key]: action.value };
      return { ...state, variables, lastUpdated: Date.now() };
    }
    case "replaceVars":
      return { ...state, variables: action.vars, lastUpdated: Date.now() };
    case "setResult":
      return { ...state, result: action.result, serverError: null, lastUpdated: Date.now() };
    case "setStatus":
      return { ...state, status: action.status };
    case "setServerError":
      return { ...state, serverError: action.message };
    default:
      return state;
  }
}

const resultNumberKeys = [
  "monthly_profit",
  "annual_profit",
  "cash_flow",
  "safety_margin",
  "growth_rate",
  "risk_index",
] as const;

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

// API responses are external data: malformed payloads must never replace the result
// being rendered.
function isSimulationResult(value: unknown): value is SimulationResult {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    resultNumberKeys.every((key) => isFiniteNumber(record[key])) &&
    Array.isArray(record.revenue_series) &&
    record.revenue_series.every(isFiniteNumber) &&
    Array.isArray(record.profit_series) &&
    record.profit_series.every(isFiniteNumber) &&
    Array.isArray(record.month_labels) &&
    record.month_labels.every((label) => typeof label === "string")
  );
}

function simulateLocally(input: SimulationInput): SimulationResult {
  const payroll = input.employees * 4200;
  const revenue = input.price * input.demand;
  const variable = input.variable_cost * input.demand;
  const operating = payroll + input.fixed_cost + input.marketing_spend;
  const interest = 150_000 * input.interest_rate / 12;
  const ebit = revenue - variable - operating;
  const taxable = ebit - interest;
  const tax = Math.max(taxable, 0) * input.tax_rate;
  const net = taxable - tax;

  const monthly_profit = Number(net.toFixed(2));
  const annual_profit = Number((net * 12).toFixed(2));
  const cash_flow = Number((net + input.fixed_cost * 0.05).toFixed(2));

  const contribution = input.price - input.variable_cost || 1;
  const breakeven_units = (operating + interest) / contribution;
  const safety_margin = Number(
    ((input.demand - breakeven_units) / Math.max(input.demand, 1)).toFixed(3)
  );
  const risk_index = Number(Math.min(1, Math.max(0, 1 - safety_margin)).toFixed(3));
  const growth_rate = Number(
    (Math.log1p(input.marketing_spend) / 100 - input.churn_rate * 0.5).toFixed(3)
  );

  const labels = emptySimulationResult.month_labels.slice(0, input.period_months);
  const revenue_series = Array.from({ length: input.period_months }, (_, idx) =>
    Number(((revenue / input.period_months) * (1 + growth_rate * idx)).toFixed(2))
  );
  const profit_series = Array.from({ length: input.period_months }, (_, idx) =>
    Number(((monthly_profit) * (1 + growth_rate * idx * 0.5)).toFixed(2))
  );

  return {
    monthly_profit,
    annual_profit,
    cash_flow,
    safety_margin,
    growth_rate,
    risk_index,
    revenue_series,
    profit_series,
    month_labels: labels,
  };
}

type RunOutcome =
  | { kind: "result"; result: SimulationResult }
  // The API answered but refused the input (422).
  | { kind: "rejected" }
  // Network failure, timeout, server error or malformed body.
  | { kind: "unavailable" };

async function requestSimulation(
  vars: SimulationInput,
  signal: AbortSignal
): Promise<RunOutcome> {
  try {
    const response = await fetch(RUN_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(vars),
      signal,
    });
    if (response.status === 422) return { kind: "rejected" };
    if (!response.ok) return { kind: "unavailable" };

    const body: unknown = await response.json();
    const result =
      typeof body === "object" && body !== null
        ? (body as Record<string, unknown>).result
        : null;
    return isSimulationResult(result) ? { kind: "result", result } : { kind: "unavailable" };
  } catch {
    return { kind: "unavailable" };
  }
}

export function useSimulationState() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestRef = useRef<AbortController | null>(null);
  const variablesRef = useRef<SimulationInput>(defaultSimulationInput);

  const runSimulation = useCallback((vars: SimulationInput) => {
    // Only the latest request may update the screen; older ones are cancelled.
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    void requestSimulation(vars, controller.signal).then((outcome) => {
      clearTimeout(timeout);
      if (requestRef.current !== controller) return;

      if (outcome.kind === "result") {
        dispatch({ type: "setResult", result: outcome.result });
        dispatch({ type: "setStatus", status: "live" });
      } else if (outcome.kind === "rejected") {
        dispatch({
          type: "setServerError",
          message:
            "O servidor recusou os valores enviados; os resultados exibidos são os do último cálculo válido.",
        });
        dispatch({ type: "setStatus", status: "live" });
      } else {
        // Keep the UI responsive without the API.
        dispatch({ type: "setResult", result: simulateLocally(vars) });
        dispatch({ type: "setStatus", status: "error" });
      }
    });
  }, []);

  useEffect(() => {
    dispatch({ type: "setResult", result: simulateLocally(defaultSimulationInput) });
    runSimulation(defaultSimulationInput);
  }, [runSimulation]);

  const updateVariable = (key: keyof SimulationInput, value: number) => {
    // An empty or out-of-range field must never reach the server.
    if (!Number.isFinite(value)) return;
    const safeValue = clampToLimit(value, simulationInputLimits[key]);
    // Updated right away so two edits inside one debounce window both survive.
    variablesRef.current = { ...variablesRef.current, [key]: safeValue };
    dispatch({ type: "setVar", key, value: safeValue });

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSimulation(variablesRef.current), DEBOUNCE_MS);
  };

  return {
    state,
    updateVariable,
  };
}
