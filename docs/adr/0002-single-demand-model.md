# 0002. Um modelo de demanda para KPIs e projeção

- Status: aceito
- Data: 2026-10-12

## Contexto
O motor original tinha duas inconsistências que apareciam juntas na tela:
- a projeção dividia a demanda mensal e os custos mensais pelo número de meses, então o gráfico
  mostrava 1/12 dos valores com o rótulo "mensais" (receita do mês 1 de R$ 11.568 quando o
  preço × demanda dava R$ 144.000);
- os KPIs ignoravam o fator de preço (sensibilidade a preço) que a projeção aplicava.

No cenário padrão, a página dizia "Lucro mensal R$ 1.168" e, ao lado, "Prejuízo em todos os 12
meses". Além disso, a tendência de crescimento podia ficar negativa em horizontes longos, o que
gerava receita negativa.

## Decisão
- Uma **demanda efetiva** única: demanda mensal × fator de preço (entre 0,6 e 1,3).
- A projeção usa valores mensais reais: demanda efetiva × tendência × sazonalidade, com custos,
  juros e impostos de um mês.
- **Lucro mensal** = primeiro mês projetado. **Lucro anual** = soma dos próximos 12 meses,
  qualquer que seja o horizonte exibido.
- Margem de segurança e risco usam a demanda efetiva.
- A tendência nunca fica abaixo de zero: um mercado em queda para de vender, não vende negativo.
- Python e TypeScript mudaram juntos, e as fixtures foram regeneradas.

## Consequências
- KPIs, painel de risco e gráfico contam a mesma história. No cenário padrão, o lucro mensal
  passa a -R$ 1.640, coerente com a projeção.
- Os números mudaram em relação à v0.1. Quem comparar prints antigos verá valores diferentes.
- Testes de invariantes nos dois motores travam a regra: lucro mensal = mês 1, lucro anual =
  soma de 12 meses, receita em unidades mensais e nunca negativa.
