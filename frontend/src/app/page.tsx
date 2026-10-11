'use client';

import { SimulationChart } from "./components/SimulationChart";
import { VariableSlider } from "./components/VariableSlider";
import { KpiCard } from "./components/KpiCard";
import { useSimulationState } from "./hooks/useSimulationState";
import { PORTFOLIO_CASE_URL, REPO_URL } from "./site";
import {
  formatCurrency,
  formatInteger,
  formatMonthShort,
  formatPercent,
} from "@/lib/simulation/format";
import { type SimulationInput, simulationInputLimits } from "@/lib/simulation/limits";

const projectLinkClass =
  "rounded-full px-3 py-2 text-sm text-slate-300 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-400";

const sliderConfig: {
  key: keyof SimulationInput;
  label: string;
  step?: number;
  unit?: string;
  hint?: string;
}[] = [
  {
    key: "price",
    label: "Preço de venda",
    unit: "R$",
    step: 1,
    hint: "Elasticidade afeta demanda",
  },
  {
    key: "variable_cost",
    label: "Custo variável",
    unit: "R$",
  },
  {
    key: "fixed_cost",
    label: "Custos fixos / mês",
    unit: "R$",
    step: 500,
  },
  {
    key: "employees",
    label: "Equipe",
    step: 1,
    hint: "Folha estimada a 4.2k por pessoa",
  },
  {
    key: "interest_rate",
    label: "Taxa de juros (a.a.)",
    step: 0.005,
    hint: "Impacta despesa financeira",
  },
  {
    key: "tax_rate",
    label: "Impostos",
    step: 0.01,
  },
  {
    key: "demand",
    label: "Demanda mensal",
    step: 50,
    hint: "Unidades projetadas",
  },
  {
    key: "marketing_spend",
    label: "Marketing / mês",
    step: 500,
    unit: "R$",
  },
  {
    key: "churn_rate",
    label: "Churn",
    step: 0.005,
  },
  {
    key: "price_sensitivity",
    label: "Sensibilidade a preço",
    step: 0.01,
  },
];

export default function Home() {
  const { variables, result, months, updateVariable } = useSimulationState();

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
          <div className="flex flex-wrap items-center gap-2">
            <nav aria-label="Projeto" className="flex items-center gap-1">
              <a href={PORTFOLIO_CASE_URL} className={projectLinkClass}>
                Portfólio
              </a>
              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={projectLinkClass}
              >
                Código<span className="ms-sr-only"> (abre em nova aba)</span>
              </a>
            </nav>
            <span className="rounded-full bg-slate-900/70 px-4 py-2 text-xs text-slate-300">
              {new Date().toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
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
                  min={simulationInputLimits[slider.key].min}
                  max={simulationInputLimits[slider.key].max}
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
              />
              <KpiCard
                title="Fluxo de caixa"
                value={formatCurrency(result.cash_flow)}
                note="livre"
              />
              <KpiCard
                title="Margem de segurança"
                value={formatPercent(result.safety_margin)}
                note="vs. ponto de equilíbrio"
              />
              <KpiCard
                title="Risco"
                value={`${(result.risk_index * 100).toFixed(0)} / 100`}
                note="quanto menor melhor"
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
                  {formatInteger(result.breakeven_units)}{" "}
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
              labels={result.revenue_series.map((_, index) =>
                months ? formatMonthShort(months[index]) : `Mês ${index + 1}`,
              )}
              revenue={result.revenue_series}
              profit={result.profit_series}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
