import { describe, expect, it } from "vitest";

import {
  formatCompactCurrency,
  formatCurrency,
  formatEditable,
  formatInteger,
  formatMonthLong,
  formatMonthShort,
  formatPercent,
} from "./format";
import { clampToLimit, defaultSimulationInput, sanitizeInput, simulationInputLimits } from "./limits";
import { parseDecimal } from "./parse";
import { inputFromSearch, searchFromInput } from "./scenario-url";

// Intl separates "R$" from the number with a no-break space.
const normalizeSpaces = (text: string) => text.replace(/\s/g, " ");

describe("parseDecimal", () => {
  it.each([
    ["1234,5", 1234.5],
    ["1.234,5", 1234.5],
    ["25.000", 25000],
    ["1234.5", 1234.5],
    ["0.08", 0.08],
    ["0,08", 0.08],
    ["1.5", 1.5],
    [" 42 ", 42],
    ["-3", -3],
    [".5", 0.5],
  ])("parses %j as %d", (raw, expected) => {
    expect(parseDecimal(raw)).toBe(expected);
  });

  it.each(["", "   ", "abc", "1,2,3", "1..2", "12a", "Infinity", "NaN", "1e3", "1.23.4,5,6"])(
    "rejects %j",
    (raw) => {
      expect(parseDecimal(raw)).toBeNull();
    },
  );
});

describe("limits", () => {
  it("clamps to the range and rounds integer inputs", () => {
    expect(clampToLimit(300, simulationInputLimits.price)).toBe(220);
    expect(clampToLimit(1, simulationInputLimits.price)).toBe(60);
    expect(clampToLimit(12.6, simulationInputLimits.employees)).toBe(13);
  });

  it("sanitizes untrusted values: drops unknown keys and non-finite numbers", () => {
    expect(
      sanitizeInput({
        price: 999,
        demand: Number.NaN,
        tax_rate: Number.POSITIVE_INFINITY,
        employees: "12" as unknown as number,
      }),
    ).toEqual({ price: 220 });
  });
});

describe("scenario query string", () => {
  it("round-trips only the values that differ from the defaults", () => {
    const input = { ...defaultSimulationInput, price: 150, interest_rate: 0.1 };
    const search = searchFromInput(input);
    expect(search).toBe("price=150&interest_rate=0.1");
    expect(inputFromSearch(`?${search}`)).toEqual(input);
  });

  it("ignores garbage and clamps out-of-range values", () => {
    expect(inputFromSearch("?price=abc&demand=999999&employees=&foo=1")).toEqual({
      ...defaultSimulationInput,
      demand: simulationInputLimits.demand.max,
    });
  });

  it("is empty for the default scenario", () => {
    expect(searchFromInput(defaultSimulationInput)).toBe("");
  });
});

describe("pt-BR formatting", () => {
  it("formats BRL, percentages and editable numbers", () => {
    expect(normalizeSpaces(formatCurrency(1168))).toBe("R$ 1.168");
    expect(normalizeSpaces(formatCurrency(-76400))).toBe("-R$ 76.400");
    expect(formatPercent(0.0184)).toBe("1,8%");
    expect(formatEditable(1234.5, 2)).toBe("1234,5");
    expect(normalizeSpaces(formatCompactCurrency(12500))).toMatch(/^R\$ 12,5 mil$/);
  });

  it("labels months in Portuguese", () => {
    expect(formatMonthShort(new Date(2026, 9, 1))).toBe("out. 26");
    expect(formatMonthLong(new Date(2026, 9, 1))).toBe("outubro de 2026");
  });

  it.each([
    [1234.56, "1.235"],
    [0, "0"],
    [-1500.4, "-1.500"],
    [999_999.5, "1.000.000"],
    [42, "42"],
  ])("groups %d as %j with dots and no decimals", (value, expected) => {
    expect(formatInteger(value)).toBe(expected);
  });
});
