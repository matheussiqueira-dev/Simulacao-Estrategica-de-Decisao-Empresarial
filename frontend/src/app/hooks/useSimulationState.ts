'use client';

import { useMemo, useReducer, useSyncExternalStore } from "react";

import { runSimulation } from "@/lib/simulation/engine";
import {
  type InputKey,
  type SimulationInput,
  clampToLimit,
  defaultSimulationInput,
  simulationInputLimits,
} from "@/lib/simulation/limits";

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
