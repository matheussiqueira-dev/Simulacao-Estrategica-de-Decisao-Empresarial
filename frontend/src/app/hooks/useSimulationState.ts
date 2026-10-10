'use client';

import { useEffect, useReducer, useRef } from "react";

import {
  SimulationInput,
  SimulationResult,
  clampToLimit,
  defaultSimulationInput,
  emptySimulationResult,
  simulationInputLimits,
} from "../types";

type Status = "idle" | "connecting" | "live" | "error";

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

const RECONNECT_BASE_MS = 1_000;
const RECONNECT_MAX_MS = 30_000;

const initialState: State = {
  variables: defaultSimulationInput,
  result: emptySimulationResult,
  status: "idle",
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

// Server frames are external data: error frames and malformed payloads must never
// replace the result being rendered.
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

export function useSimulationState() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const wsRef = useRef<WebSocket | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const variablesRef = useRef<SimulationInput>(defaultSimulationInput);

  useEffect(() => {
    dispatch({ type: "setResult", result: simulateLocally(defaultSimulationInput) });

    const wsUrl =
      process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000/ws/simulate";
    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;
    let disposed = false;

    const connect = () => {
      const ws = new WebSocket(wsUrl);
      socket = ws;
      wsRef.current = ws;

      ws.onopen = () => {
        attempts = 0;
        dispatch({ type: "setStatus", status: "live" });
        ws.send(JSON.stringify(variablesRef.current));
      };

      ws.onmessage = (event: MessageEvent) => {
        let payload: unknown = null;
        try {
          payload = JSON.parse(String(event.data));
        } catch {
          // Treated as an unexpected frame below.
        }
        if (isSimulationResult(payload)) {
          dispatch({ type: "setResult", result: payload });
        } else {
          dispatch({
            type: "setServerError",
            message:
              "O servidor recusou a última atualização; os resultados exibidos são os do último cálculo válido.",
          });
        }
      };

      ws.onerror = () => dispatch({ type: "setStatus", status: "error" });
      ws.onclose = () => {
        if (wsRef.current === ws) wsRef.current = null;
        if (disposed) return;
        dispatch({ type: "setStatus", status: "idle" });
        // Retry with exponential backoff so a dropped socket never needs a page reload.
        const delay = Math.min(RECONNECT_MAX_MS, RECONNECT_BASE_MS * 2 ** attempts);
        attempts += 1;
        reconnectTimer = setTimeout(connect, delay);
      };
    };

    dispatch({ type: "setStatus", status: "connecting" });
    connect();

    return () => {
      disposed = true;
      clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, []);

  const sendVariables = (vars: SimulationInput) => {
    const socket = wsRef.current;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(vars));
    } else {
      // Keep UI responsive while the socket is down; status follows the socket itself.
      dispatch({ type: "setResult", result: simulateLocally(vars) });
    }
  };

  const updateVariable = (key: keyof SimulationInput, value: number) => {
    // An empty or out-of-range field must never reach the server.
    if (!Number.isFinite(value)) return;
    const safeValue = clampToLimit(value, simulationInputLimits[key]);
    // Updated right away so two edits inside one debounce window both survive.
    variablesRef.current = { ...variablesRef.current, [key]: safeValue };
    dispatch({ type: "setVar", key, value: safeValue });

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => sendVariables(variablesRef.current), 160);
  };

  return {
    state,
    updateVariable,
  };
}
