// Shareable scenarios: inputs that differ from the defaults live in the query string.

import {
  type InputKey,
  type SimulationInput,
  defaultSimulationInput,
  inputKeys,
  sanitizeInput,
} from "./limits";

/** Reads a query string; unknown keys, non-numbers and out-of-range values are dropped or clamped. */
export function inputFromSearch(search: string): SimulationInput {
  const params = new URLSearchParams(search);
  const candidate: Partial<Record<InputKey, unknown>> = {};
  for (const key of inputKeys) {
    const raw = params.get(key);
    if (raw !== null && raw.trim() !== "") candidate[key] = Number(raw);
  }
  return { ...defaultSimulationInput, ...sanitizeInput(candidate) };
}

/** Query string (without "?") holding only the values that differ from the defaults. */
export function searchFromInput(input: SimulationInput): string {
  const params = new URLSearchParams();
  for (const key of inputKeys) {
    if (input[key] !== defaultSimulationInput[key]) params.set(key, String(input[key]));
  }
  return params.toString();
}
