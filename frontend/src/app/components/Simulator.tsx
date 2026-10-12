"use client";

import dynamic from "next/dynamic";
import clsx from "clsx";

import { MODEL_ASSUMPTIONS } from "@/lib/simulation/engine";
import {
  formatCurrency,
  formatCurrencyCents,
  formatEditable,
  formatInteger,
  formatMonthLong,
  formatMonthShort,
  formatPercent,
} from "@/lib/simulation/format";
import { type InputKey, simulationInputLimits } from "@/lib/simulation/limits";

import { useSimulationState } from "../hooks/useSimulationState";
import { KpiCard } from "./KpiCard";
import type { ChartPoint } from "./SimulationChart";
import { type FieldDisplay, VariableSlider } from "./VariableSlider";

const SimulationChart = dynamic(() => import("./SimulationChart").then((m) => m.SimulationChart), {
  ssr: false,
  loading: () => (
    <div className="h-72 w-full rounded-xs bg-surface-raised" aria-hidden="true" />
  ),
});

type Field = {
  key: InputKey;
  label: string;
  hint?: string;
  display: FieldDisplay;
  format: (value: number) => string;
};

const currencyField: FieldDisplay = { unit: "R$", unitPosition: "prefix", step: 500, fractionDigits: 0 };
const percentField = (step: number): FieldDisplay => ({
  unit: "%",
  scale: 100,
  step,
  fractionDigits: 1,
});

const fieldGroups: { title: string; fields: Field[] }[] = [
  {
    title: "Preço e custos",
    fields: [
      {
        key: "price",
        label: "Preço de venda",
        hint: "Por unidade. Acima de R$ 100, a sensibilidade a preço reduz a demanda.",
        display: { unit: "R$", unitPosition: "prefix", step: 1, fractionDigits: 2 },
        format: formatCurrencyCents,
      },
      {
        key: "variable_cost",
        label: "Custo variável",
        hint: "Por unidade vendida.",
        display: { unit: "R$", unitPosition: "prefix", step: 1, fractionDigits: 2 },
        format: formatCurrencyCents,
      },
      {
        key: "fixed_cost",
        label: "Custos fixos por mês",
        hint: "Aluguel, sistemas e o que não varia com as vendas.",
        display: currencyField,
        format: formatCurrency,
      },
    ],
  },
  {
    title: "Equipe e marketing",
    fields: [
      {
        key: "employees",
        label: "Pessoas na equipe",
        hint: `Folha estimada em ${formatCurrency(MODEL_ASSUMPTIONS.baseSalary)} por pessoa.`,
        display: { unit: "pessoas", step: 1, fractionDigits: 0 },
        format: (value) => `${formatInteger(value)} pessoas`,
      },
      {
        key: "marketing_spend",
        label: "Marketing por mês",
        display: currencyField,
        format: formatCurrency,
      },
    ],
  },
  {
    title: "Mercado",
    fields: [
      {
        key: "demand",
        label: "Demanda mensal",
        hint: "Unidades por mês antes do efeito do preço.",
        display: { unit: "un.", step: 50, fractionDigits: 0 },
        format: (value) => `${formatInteger(value)} un.`,
      },
      {
        key: "churn_rate",
        label: "Churn mensal",
        hint: "Clientes perdidos por mês; reduz o crescimento projetado.",
        display: percentField(0.5),
        format: formatPercent,
      },
      {
        key: "price_sensitivity",
        label: "Sensibilidade a preço",
        hint: "Elasticidade: 0 ignora o preço; 0,5 é a reação mais forte.",
        display: { step: 0.01, fractionDigits: 2 },
        format: (value) => formatEditable(value, 2),
      },
    ],
  },
  {
    title: "Financeiro",
    fields: [
      {
        key: "interest_rate",
        label: "Juros ao ano",
        hint: `Sobre a dívida de ${formatCurrency(MODEL_ASSUMPTIONS.debt)}.`,
        display: percentField(0.5),
        format: formatPercent,
      },
      {
        key: "tax_rate",
        label: "Impostos sobre o lucro",
        display: percentField(1),
        format: formatPercent,
      },
    ],
  },
];

function riskLevel(riskIndex: number) {
  if (riskIndex < 0.34) return { label: "Baixo", fill: "bg-positive" };
  if (riskIndex < 0.67) return { label: "Moderado", fill: "bg-warning" };
  return { label: "Alto", fill: "bg-danger" };
}

function chartHeadline(profits: number[]) {
  const positive = profits.filter((value) => value > 0).length;
  const total = profits.length;
  if (positive === total) return `Lucro positivo em todos os ${total} meses projetados`;
  if (positive === 0) return `Prejuízo em todos os ${total} meses projetados`;
  return `Lucro positivo em ${positive} de ${total} meses projetados`;
}

export function Simulator() {
  const { variables, result, months, updateVariable } = useSimulationState();

  const labels = result.revenue_series.map((_, index) =>
    months ? formatMonthShort(months[index]) : `Mês ${index + 1}`
  );
  const chartData: ChartPoint[] = labels.map((label, index) => ({
    label,
    revenue: result.revenue_series[index],
    profit: result.profit_series[index],
  }));
  const headline = chartHeadline(result.profit_series);
  const period = months
    ? `de ${formatMonthLong(months[0])} a ${formatMonthLong(months[months.length - 1])}`
    : `nos próximos ${labels.length} meses`;
  const risk = riskLevel(result.risk_index);
  const riskScore = Math.round(result.risk_index * 100);

  return (
    <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-10">
      <section aria-labelledby="inputs-heading">
        <h2 id="inputs-heading" className="text-h2 text-fg">
          Premissas da decisão
        </h2>
        <p className="mt-2 text-small text-fg-secondary">
          Use o controle deslizante ou digite o valor; aceita vírgula decimal.
        </p>
        <div className="mt-6 space-y-6">
          {fieldGroups.map((group) => (
            <div key={group.title} className="rounded-card border border-line bg-surface p-5 lg:p-6">
              <fieldset className="min-w-0">
                <legend>
                  <h3 className="text-h4 text-fg">{group.title}</h3>
                </legend>
                <div className="mt-4 divide-y divide-line">
                  {group.fields.map((field) => (
                    <VariableSlider
                      key={field.key}
                      label={field.label}
                      hint={field.hint}
                      value={variables[field.key]}
                      limit={simulationInputLimits[field.key]}
                      display={field.display}
                      formattedValue={field.format(variables[field.key])}
                      onChange={(value) => updateVariable(field.key, value)}
                    />
                  ))}
                </div>
              </fieldset>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="results-heading">
        <h2 id="results-heading" className="text-h2 text-fg">
          Resultado
        </h2>
        <p className="mt-2 text-small text-fg-secondary">
          Recalculado a cada ajuste, com as premissas do modelo descritas abaixo.
        </p>

        <div className="mt-6 grid gap-4 min-[480px]:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
          <KpiCard
            label="Lucro mensal"
            value={formatCurrency(result.monthly_profit)}
            context="Mês atual projetado, depois de custos, juros e impostos."
          />
          <KpiCard
            label="Fluxo de caixa mensal"
            value={formatCurrency(result.cash_flow)}
            context="Lucro mais depreciação, menos capital de giro."
          />
          <KpiCard
            label="Margem de segurança"
            value={formatPercent(result.safety_margin)}
            context="Quanto as vendas podem cair antes do prejuízo."
          />
          <KpiCard
            label="Lucro anual"
            value={formatCurrency(result.annual_profit)}
            context="Soma dos próximos 12 meses projetados."
          />
        </div>

        <div className="mt-4 rounded-card border border-line bg-surface p-5 lg:p-6">
          <h3 className="text-h4 text-fg">Risco e equilíbrio</h3>
          <dl className="mt-4 grid gap-5 min-[480px]:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
            <div>
              <dt className="text-caption font-semibold text-fg-secondary">Ponto de equilíbrio</dt>
              <dd className="ms-num mt-1 text-h3 text-fg">
                {formatInteger(result.breakeven_units)} un. por mês
              </dd>
              <dd className="mt-1 text-fine text-fg-tertiary">
                Vendas que cobrem custos fixos, equipe, marketing e juros.
              </dd>
            </div>
            <div>
              <dt className="text-caption font-semibold text-fg-secondary">Índice de risco</dt>
              <dd className="ms-num mt-1 text-h3 text-fg">
                {riskScore} de 100 · {risk.label}
              </dd>
              <dd className="mt-2 h-1 w-full rounded-xs bg-surface-raised" aria-hidden="true">
                <div
                  className={clsx("h-1 rounded-xs", risk.fill)}
                  style={{ width: `${riskScore}%` }}
                />
              </dd>
            </div>
            <div>
              <dt className="text-caption font-semibold text-fg-secondary">Demanda efetiva</dt>
              <dd className="ms-num mt-1 text-h3 text-fg">
                {formatInteger(result.effective_demand)} un. por mês
              </dd>
              <dd className="mt-1 text-fine text-fg-tertiary">
                Demanda mensal ajustada pelo efeito do preço.
              </dd>
            </div>
            <div>
              <dt className="text-caption font-semibold text-fg-secondary">
                Tendência anual da demanda
              </dt>
              <dd className="ms-num mt-1 text-h3 text-fg">{formatPercent(result.growth_rate)}</dd>
              <dd className="mt-1 text-fine text-fg-tertiary">
                Crescimento mensal do modelo vezes 12, a partir de marketing, churn e preço.
              </dd>
            </div>
          </dl>
        </div>

        <figure className="mt-4 rounded-card border border-line bg-surface p-5 lg:p-6">
          <figcaption>
            <h3 className="text-h4 text-fg">{headline}</h3>
            <p className="mt-1 text-caption text-fg-secondary">
              Receita e lucro mensais em R$, {period}.
            </p>
          </figcaption>
          <div className="mt-4">
            <SimulationChart data={chartData} summary={`${headline}. Receita e lucro mensais ${period}.`} />
          </div>
          <details className="mt-4">
            <summary className="inline-flex min-h-control cursor-pointer items-center rounded-control text-small font-medium text-accent">
              Ver dados em tabela
            </summary>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-caption">
                <caption className="sr-only">Receita e lucro mensais projetados, em R$</caption>
                <thead>
                  <tr className="border-b border-line-strong text-left text-fg-secondary">
                    <th scope="col" className="py-2 pr-4 font-semibold">
                      Mês
                    </th>
                    <th scope="col" className="py-2 pr-4 text-right font-semibold">
                      Receita (R$)
                    </th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      Lucro (R$)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((point) => (
                    <tr key={point.label} className="border-b border-line text-fg">
                      <th scope="row" className="py-2 pr-4 text-left font-normal">
                        {point.label}
                      </th>
                      <td className="py-2 pr-4 text-right">{formatInteger(point.revenue)}</td>
                      <td className="py-2 text-right">{formatInteger(point.profit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
          <p className="mt-4 text-fine text-fg-tertiary">
            Projeção do modelo com tendência, efeito do preço e sazonalidade de ±
            {formatPercent(MODEL_ASSUMPTIONS.seasonalityAmplitude)}; não é previsão.
          </p>
        </figure>
      </section>
    </div>
  );
}
