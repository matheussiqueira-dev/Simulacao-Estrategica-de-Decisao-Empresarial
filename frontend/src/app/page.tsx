'use client';

import { SimulationChart } from "./components/SimulationChart";
import { VariableSlider } from "./components/VariableSlider";
import { KpiCard } from "./components/KpiCard";
import { useSimulationState } from "./hooks/useSimulationState";
import { SimulationInput } from "./types";

const sliderConfig: {
  key: keyof SimulationInput;
  label: string;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  hint?: string;
}[] = [
  {
    key: "price",
    label: "Preço de venda",
    min: 60,
    max: 220,
    unit: "$",
    step: 1,
    hint: "Elasticidade afeta demanda",
  },
  {
    key: "variable_cost",
    label: "Custo variável",
    min: 10,
    max: 120,
    unit: "$",
  },
  {
    key: "fixed_cost",
    label: "Custos fixos / mês",
    min: 5000,
    max: 80000,
    unit: "$",
    step: 500,
  },
  {
    key: "employees",
    label: "Equipe",
    min: 5,
    max: 40,
    step: 1,
    hint: "Folha estimada a 4.2k por pessoa",
  },
  {
    key: "interest_rate",
    label: "Taxa de juros (a.a.)",
    min: 0,
    max: 0.25,
    step: 0.005,
    hint: "Impacta despesa financeira",
  },
  {
    key: "tax_rate",
    label: "Impostos",
    min: 0.05,
    max: 0.35,
    step: 0.01,
  },
  {
    key: "demand",
    label: "Demanda mensal",
    min: 200,
    max: 4000,
    step: 50,
    hint: "Unidades projetadas",
  },
  {
    key: "marketing_spend",
    label: "Marketing / mês",
    min: 0,
    max: 40000,
    step: 500,
    unit: "$",
  },
  {
    key: "churn_rate",
    label: "Churn",
    min: 0,
    max: 0.25,
    step: 0.005,
  },
  {
    key: "price_sensitivity",
    label: "Sensibilidade a preço",
    min: 0,
    max: 0.5,
    step: 0.01,
  },
];

function formatCurrency(value: number) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

export default function Home() {
  const { state, updateVariable } = useSimulationState();
  const { result, status, variables } = state;

  const riskWidth = `${Math.min(100, Math.max(0, result.risk_index * 100))}%`;

  return (
    <div className="min-h-screen bg-radial-glow pb-12">
      <div className="mx-auto max-w-7xl px-6 pt-8">
        <header className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-full px-6 py-4 shadow-glass">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 text-xl font-bold text-slate-950 shadow-glow-green">
              BD
            </div>
            <div>
              <p className="text-sm text-slate-300">Business Decision Simulator</p>
              <p className="text-xl font-semibold text-white">Performance Overview</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-slate-900/70 px-4 py-2 text-xs text-slate-300">
              {new Date().toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
            <span
              className={`rounded-full px-4 py-2 text-xs font-semibold ${
                status === "live"
                  ? "bg-green-500/15 text-green-300 border border-green-400/40"
                  : status === "connecting"
                  ? "bg-amber-400/10 text-amber-200 border border-amber-300/40"
                  : "bg-red-500/10 text-red-200 border border-red-300/40"
              }`}
            >
              {status === "live"
                ? "Conectado"
                : status === "connecting"
                ? "Conectando..."
                : "Offline / modo local"}
            </span>
          </div>
        </header>

        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <section className="space-y-4">
            <div className="glass-panel panel-accent rounded-3xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Controles de entrada
                  </p>
                  <p className="text-xl font-semibold text-white">Ajuste as premissas</p>
                </div>
                <span className="rounded-full bg-green-500/15 px-3 py-1 text-xs text-green-300">
                  Realtime
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {sliderConfig.map((slider) => (
                <VariableSlider
                  key={slider.key}
                  label={slider.label}
                  value={Number(variables[slider.key])}
                  min={slider.min}
                  max={slider.max}
                  step={slider.step}
                  unit={slider.unit}
                  hint={slider.hint}
                  onChange={(value) => updateVariable(slider.key, value)}
                />
              ))}
            </div>
          </section>

          <section className="xl:col-span-2 space-y-4">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <KpiCard
                title="Lucro mensal"
                value={formatCurrency(result.monthly_profit)}
                note="após impostos"
                trend={result.growth_rate * 100}
                accent="green"
              />
              <KpiCard
                title="Fluxo de caixa"
                value={formatCurrency(result.cash_flow)}
                note="livre"
                trend={result.cash_flow >= 0 ? 3.4 : -2.1}
                accent="blue"
              />
              <KpiCard
                title="Margem de segurança"
                value={formatPercent(result.safety_margin)}
                note="vs. ponto de equilíbrio"
                trend={result.safety_margin * 100}
                accent="amber"
              />
              <KpiCard
                title="Risco"
                value={`${(result.risk_index * 100).toFixed(0)} / 100`}
                note="quanto menor melhor"
                trend={-result.risk_index * 100}
                accent="green"
              />
            </div>

            <div className="glass-panel rounded-3xl p-4 shadow-glass">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Indicadores de risco
                  </p>
                  <p className="text-lg font-semibold text-white">Exposição & buffer</p>
                </div>
                <p className="text-sm text-slate-300">
                  Breakeven:{" "}
                  {(
                    (variables.fixed_cost +
                      variables.employees * 4200 +
                      variables.marketing_spend) /
                    Math.max(variables.price - variables.variable_cost, 1)
                  ).toLocaleString("en-US", { maximumFractionDigits: 0 })}{" "}
                  unidades
                </p>
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>Índice de risco</span>
                  <span>{(result.risk_index * 100).toFixed(0)}%</span>
                </div>
                <div className="h-3 w-full rounded-full bg-slate-800">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-emerald-400 via-yellow-400 to-orange-500"
                    style={{ width: riskWidth }}
                  />
                </div>
                <p className="text-xs text-slate-400">
                  Margem de segurança representa quanto a demanda pode cair antes do
                  prejuízo. Ajuste preço, marketing ou custos para abrir margem.
                </p>
              </div>
            </div>

            <SimulationChart
              labels={result.month_labels}
              revenue={result.revenue_series}
              profit={result.profit_series}
            />
          </section>
        </div>

        <footer className="mt-8 flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-5 py-4 text-sm text-slate-300 sm:flex-row sm:items-center sm:justify-between">
          <span>Desenvolvido por Matheus Siqueira</span>
          <a
            className="font-semibold text-green-300 transition hover:text-green-200"
            href="https://www.matheussiqueira.dev"
            rel="noopener noreferrer"
            target="_blank"
          >
            matheussiqueira.dev
          </a>
        </footer>
      </div>
    </div>
  );
}
