import { ModelAssumptions } from "./components/ModelAssumptions";
import { Simulator } from "./components/Simulator";

export default function Home() {
  return (
    <div className="ms-container pt-8 md:pt-12">
      <h1 className="text-h1 text-fg">Simule o efeito das suas decisões no resultado</h1>
      <p className="mt-3 max-w-measure text-lead text-fg-secondary">
        Ajuste preço, custos, equipe, juros, impostos e demanda e acompanhe lucro, caixa, risco e a
        projeção mensal. O cálculo roda no seu navegador, e o endereço da página guarda o cenário
        para você compartilhar.
      </p>
      <Simulator />
      <ModelAssumptions />
    </div>
  );
}
