"use client";

import { useId, useState } from "react";
import clsx from "clsx";

type VariableSliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  hint?: string;
  onChange: (next: number) => void;
};

type Feedback = { kind: "error" | "info"; text: string } | null;

/** Accepts "1234.5" or the pt-BR "1234,5"; anything else is not a number. */
function parseDecimal(raw: string): number | null {
  const normalized = raw.trim().replace(",", ".");
  if (!/^-?(\d+\.?\d*|\.\d+)$/.test(normalized)) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatLimit(value: number) {
  return value.toLocaleString("en-US", { maximumFractionDigits: 3 });
}

export function VariableSlider({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  hint,
  onChange,
}: VariableSliderProps) {
  const id = useId();
  const labelId = `${id}-label`;
  const feedbackId = `${id}-feedback`;
  // Text typed in the number field; null while the field mirrors `value`.
  const [draft, setDraft] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const handleTyping = (raw: string) => {
    setDraft(raw);
    const parsed = parseDecimal(raw);
    // Only in-range numbers update the simulation while typing; the rest is judged on blur.
    if (parsed !== null && parsed >= min && parsed <= max) {
      setFeedback(null);
      onChange(parsed);
    }
  };

  const handleBlur = () => {
    if (draft === null) return;
    const parsed = parseDecimal(draft);
    if (parsed === null) {
      const problem = draft.trim() === "" ? "Campo vazio." : "Valor inválido.";
      setFeedback({
        kind: "error",
        text: `${problem} Digite um número entre ${formatLimit(min)} e ${formatLimit(max)}; a simulação segue com ${formatLimit(value)}.`,
      });
      return;
    }

    const clamped = Math.min(max, Math.max(min, parsed));
    setDraft(null);
    setFeedback(
      clamped === parsed
        ? null
        : { kind: "info", text: `Fora da faixa; ajustado para ${formatLimit(clamped)}.` }
    );
    if (clamped !== value) onChange(clamped);
  };

  const invalid = feedback?.kind === "error";

  return (
    <div className="glass-panel rounded-2xl p-4 shadow-glass transition-all hover:shadow-glow-green">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p id={labelId} className="text-sm font-semibold text-slate-200">
            {label}
          </p>
          {hint ? (
            <p className="text-xs text-slate-400">{hint}</p>
          ) : null}
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-slate-50">
            {value.toLocaleString("en-US", {
              maximumFractionDigits: 2,
              minimumFractionDigits: step < 1 ? 1 : 0,
            })}
            {unit ? <span className="ml-1 text-xs text-slate-400">{unit}</span> : null}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-labelledby={labelId}
          onChange={(e) => {
            setDraft(null);
            setFeedback(null);
            onChange(Number(e.target.value));
          }}
          className={clsx(
            "h-2 w-full appearance-none rounded-full bg-slate-800",
            "accent-green-400"
          )}
        />
        <div className="flex items-center gap-2 rounded-lg bg-slate-900/60 px-3 py-2">
          <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={draft ?? String(value)}
            aria-labelledby={labelId}
            aria-invalid={invalid || undefined}
            aria-describedby={feedbackId}
            onChange={(e) => handleTyping(e.target.value)}
            onBlur={handleBlur}
            className={clsx(
              "w-full rounded-md border bg-slate-950/60 px-2 py-1 text-sm outline-none ring-0 focus:bg-slate-900",
              invalid
                ? "border-red-400 focus:border-red-400"
                : "border-slate-800 focus:border-green-400"
            )}
          />
          {unit ? (
            <span className="rounded-md bg-slate-800 px-2 py-1 text-xs text-slate-300">
              {unit}
            </span>
          ) : null}
        </div>
        <p
          id={feedbackId}
          aria-live="polite"
          className={clsx("text-xs", invalid ? "text-red-300" : "text-slate-400")}
        >
          {feedback?.text}
        </p>
      </div>
    </div>
  );
}
