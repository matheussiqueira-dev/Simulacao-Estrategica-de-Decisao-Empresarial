import { MODEL_ASSUMPTIONS } from "@/lib/simulation/engine";
import { formatCurrency, formatEditable, formatPercent } from "@/lib/simulation/format";
import { defaultSimulationInput } from "@/lib/simulation/limits";

const assumptions = [
  {
    term: "Salário por pessoa",
    value: `${formatCurrency(MODEL_ASSUMPTIONS.baseSalary)} por mês`,
    note: "Multiplicado pelo tamanho da equipe para estimar a folha.",
  },
  {
    term: "Dívida da empresa",
    value: formatCurrency(MODEL_ASSUMPTIONS.debt),
    note: "Juros mensais = dívida × taxa anual ÷ 12.",
  },
  {
    term: "Capital de giro",
    value: `${formatPercent(MODEL_ASSUMPTIONS.workingCapitalRatio)} da receita`,
    note: "Diluído no horizonte da projeção e descontado do fluxo de caixa.",
  },
  {
    term: "Depreciação",
    value: `${formatPercent(MODEL_ASSUMPTIONS.depreciationRate)} do custo fixo`,
    note: "Somada de volta ao fluxo de caixa, porque não sai do caixa.",
  },
  {
    term: "Efeito do preço",
    value: `fator entre ${formatEditable(MODEL_ASSUMPTIONS.minPriceFactor, 1)} e ${formatEditable(MODEL_ASSUMPTIONS.maxPriceFactor, 1)}`,
    note: "Acima de R$ 100, a demanda cai na proporção da sensibilidade a preço; abaixo, sobe.",
  },
  {
    term: "Sazonalidade",
    value: `±${formatPercent(MODEL_ASSUMPTIONS.seasonalityAmplitude)}`,
    note: "Variação da demanda ao longo de um ciclo de 12 meses.",
  },
  {
    term: "Horizonte",
    value: `${defaultSimulationInput.period_months} meses`,
    note: "Período da projeção de receita e lucro, a partir do mês atual.",
  },
];

export function ModelAssumptions() {
  return (
    <section aria-labelledby="assumptions-heading" className="mt-16">
      <h2 id="assumptions-heading" className="text-h2 text-fg">
        Premissas do modelo
      </h2>
      <p className="mt-2 text-small text-fg-secondary">
        Valores fixos em todos os cenários. É um modelo simplificado para demonstração e não
        substitui uma análise financeira.
      </p>
      <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {assumptions.map((item) => (
          <div key={item.term} className="rounded-card border border-line bg-surface p-5">
            <dt className="text-caption font-semibold text-fg-secondary">{item.term}</dt>
            <dd className="ms-num mt-1 text-body font-semibold text-fg">{item.value}</dd>
            <dd className="mt-1 text-fine text-fg-tertiary">{item.note}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
