'use client';

import { useEffect, useMemo, useReducer, useSyncExternalStore } from "react";

import { runSimulation } from "@/lib/simulation/engine";
import {
  type InputKey,
  type SimulationInput,
  clampToLimit,
  defaultSimulationInput,
  simulationInputLimits,
} from "@/lib/simulation/limits";
import { inputFromSearch, searchFromInput } from "@/lib/simulation/scenario-url";

const URL_SYNC_DELAY_MS = 300;

type Action =
  | { type: "setVar"; key: InputKey; value: number }
  | { type: "replace"; input: SimulationInput };

function reducer(state: SimulationInput, action: Action): SimulationInput {
  switch (action.type) {
    case "setVar":
      return state[action.key] === action.value ? state : { ...state, [action.key]: action.value };
    case "replace":
      return action.input;
    default:
      return state;
  }
}

// The projection starts at the visitor's current month. The prerendered HTML has no
// visitor, so it renders without month names and the client fills them in on hydration.
const subscribeToNothing = () => () => {};
const currentMonthIndex = () => {
  const now = new Date();
  return now.getFullYear() * 12 + now.getMonth();
};
const noMonthOnServer = () => null;

export function useSimulationState() {
  const [variables, dispatch] = useReducer(reducer, defaultSimulationInput);
  const monthIndex = useSyncExternalStore(subscribeToNothing, currentMonthIndex, noMonthOnServer);

  // A shared link opens with its scenario; unknown or invalid values are dropped or clamped.
  useEffect(() => {
    const fromUrl = inputFromSearch(window.location.search);
    if (searchFromInput(fromUrl) !== "") dispatch({ type: "replace", input: fromUrl });
  }, []);

  // Keep the address bar shareable. Debounced: dragging a slider changes the value many
  // times per second, and browsers throttle (Safari throws on) rapid history updates.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const search = searchFromInput(variables);
      const next = search ? `${window.location.pathname}?${search}` : window.location.pathname;
      if (next === window.location.pathname + window.location.search) return;
      try {
        window.history.replaceState(window.history.state, "", next);
      } catch {
        // A rejected history update only leaves the previous URL in place.
      }
    }, URL_SYNC_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [variables]);

  const result = useMemo(() => {
    const start =
      monthIndex === null ? new Date(2000, 0, 1) : new Date(Math.floor(monthIndex / 12), monthIndex % 12, 1);
    return runSimulation(variables, start);
  }, [variables, monthIndex]);

  const updateVariable = (key: InputKey, value: number) => {
    // An empty or invalid field never reaches the engine; out-of-range values are clamped.
    if (!Number.isFinite(value)) return;
    dispatch({ type: "setVar", key, value: clampToLimit(value, simulationInputLimits[key]) });
  };

  return {
    variables,
    result,
    /** Projection months, or null until the visitor's month is known. */
    months: monthIndex === null ? null : result.months,
    updateVariable,
  };
}
