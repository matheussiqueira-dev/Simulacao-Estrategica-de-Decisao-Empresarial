import { useId, useState } from "react";
import clsx from "clsx";

import { formatEditable } from "@/lib/simulation/format";
import type { InputLimit } from "@/lib/simulation/limits";
import { parseDecimal } from "@/lib/simulation/parse";

export type FieldDisplay = {
  /** Adornment next to the number field, outside the editable text ("R$", "%"). */
  unit?: string;
  unitPosition?: "prefix" | "suffix";
  /** Engine value × scale = displayed value (rates are stored as decimals, shown in %). */
  scale?: number;
  /** Step of the slider, in displayed units. */
  step: number;
  /** Decimals accepted and shown in the number field. */
  fractionDigits: number;
};

type VariableSliderProps = {
  label: string;
  hint?: string;
  /** Current value, in engine units. */
  value: number;
  /** Allowed range, in engine units. */
  limit: InputLimit;
  display: FieldDisplay;
  /** Formatted current value for the <output> next to the label. */
  formattedValue: string;
  /** Receives the new value in engine units. */
  onChange: (next: number) => void;
};

type Feedback = { kind: "error" | "info"; text: string } | null;

// Display conversions round away binary noise (0.05 × 100 = 5.000000000000001).
const toDisplay = (value: number, scale: number) => Math.round(value * scale * 1e6) / 1e6;

export function VariableSlider({
  label,
  hint,
  value,
  limit,
  display,
  formattedValue,
  onChange,
}: VariableSliderProps) {
  const id = useId();
  const labelId = `${id}-label`;
  const rangeId = `${id}-range`;
  const fieldId = `${id}-field`;
  const hintId = `${id}-hint`;
  const feedbackId = `${id}-feedback`;

  const scale = display.scale ?? 1;
  const min = toDisplay(limit.min, scale);
  const max = toDisplay(limit.max, scale);
  const shown = toDisplay(value, scale);
  const showLimit = (n: number) => formatEditable(n, display.fractionDigits);
  const emit = (displayValue: number) => onChange(displayValue / scale);

  // Text typed in the number field; null while the field mirrors `value`.
  const [draft, setDraft] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const handleTyping = (raw: string) => {
    setDraft(raw);
    const parsed = parseDecimal(raw);
    // Only in-range numbers update the simulation while typing; the rest is judged on blur.
    if (parsed !== null && parsed >= min && parsed <= max) {
      setFeedback(null);
      emit(parsed);
    }
  };

  const handleBlur = () => {
    if (draft === null) return;
    const parsed = parseDecimal(draft);
    if (parsed === null) {
      const problem = draft.trim() === "" ? "Campo vazio." : "Valor inválido.";
      setFeedback({
        kind: "error",
        text: `${problem} Digite um número entre ${showLimit(min)} e ${showLimit(max)}; a simulação segue com ${showLimit(shown)}.`,
      });
      return;
    }

    const clamped = Math.min(max, Math.max(min, parsed));
    setDraft(null);
    setFeedback(
      clamped === parsed
        ? null
        : { kind: "info", text: `Fora da faixa; ajustado para ${showLimit(clamped)}.` }
    );
    if (clamped !== shown) emit(clamped);
  };

  const invalid = feedback?.kind === "error";
  const unit = display.unit ? (
    <span className="shrink-0 text-small text-fg-secondary" aria-hidden="true">
      {display.unit}
    </span>
  ) : null;

  return (
    <div className="py-5 first:pt-0 last:pb-0">
      <div className="flex items-baseline justify-between gap-3">
        <label id={labelId} htmlFor={fieldId} className="text-small font-semibold text-fg">
          {label}
        </label>
        <output htmlFor={`${rangeId} ${fieldId}`} className="ms-num text-small text-fg-secondary">
          {formattedValue}
        </output>
      </div>
      {hint ? (
        <p id={hintId} className="mt-1 text-caption text-fg-secondary">
          {hint}
        </p>
      ) : null}

      <div className="mt-3 flex min-h-control items-center">
        <input
          id={rangeId}
          type="range"
          min={min}
          max={max}
          step={display.step}
          value={shown}
          aria-labelledby={labelId}
          aria-describedby={hint ? hintId : undefined}
          onChange={(event) => {
            setDraft(null);
            setFeedback(null);
            emit(Number(event.target.value));
          }}
          className="w-full cursor-pointer"
        />
      </div>
      <div className="flex justify-between text-micro text-fg-tertiary" aria-hidden="true">
        <span className="ms-num">{showLimit(min)}</span>
        <span className="ms-num">{showLimit(max)}</span>
      </div>

      <div className="mt-3 flex items-center gap-2">
        {display.unitPosition === "prefix" ? unit : null}
        <input
          id={fieldId}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={draft ?? formatEditable(shown, display.fractionDigits)}
          aria-invalid={invalid || undefined}
          aria-describedby={[hint ? hintId : null, feedbackId].filter(Boolean).join(" ")}
          onChange={(event) => handleTyping(event.target.value)}
          onBlur={handleBlur}
          className={clsx(
            "ms-num h-control w-full min-w-0 rounded-control border bg-canvas px-3 text-right text-body text-fg",
            "transition-colors duration-micro ease-creative",
            invalid ? "border-danger" : "border-line-control hover:border-line-control-hover"
          )}
        />
        {display.unitPosition === "prefix" ? null : unit}
      </div>
      <p
        id={feedbackId}
        aria-live="polite"
        className={clsx(
          "text-caption",
          feedback ? "mt-2" : null,
          invalid ? "text-danger" : "text-fg-secondary"
        )}
      >
        {feedback?.text}
      </p>
    </div>
  );
}
