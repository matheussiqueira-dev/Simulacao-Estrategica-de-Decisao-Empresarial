# 0001. Publicar só o frontend na Vercel

- Status: aceito
- Data: 2026-10-12

## Contexto
O simulador começou com um WebSocket para um backend FastAPI. Na v0.1 ele virou HTTP e o deploy
passou a usar Vercel Services: Next.js em `/` e FastAPI em `/api/*`. Toda simulação ia ao
servidor, embora o cálculo seja aritmética de poucas dezenas de linhas, sem dados nem segredos.

Isso tinha custo e risco sem retorno para uma demo pública:
- uma Function Python e um endpoint aberto para limitar (WAF, rate limit);
- latência de rede a cada ajuste;
- dois motores com fórmulas divergentes (o do servidor e o fallback do navegador).

## Decisão
- O motor foi portado para TypeScript (`frontend/src/lib/simulation/engine.ts`) e roda no
  navegador. A página é estática.
- O projeto Vercel publica só o frontend: Root Directory `frontend`, preset Next.js, Node 24.x,
  sem `vercel.json` e sem variáveis de ambiente.
- O FastAPI continua no repositório como implementação de referência, sem deploy. Os dois
  motores reproduzem `fixtures/simulation-golden.json`, e o CI roda os dois lados.

## Consequências
- Custo zero de Functions e nenhuma API pública para proteger.
- Feedback imediato: nenhuma chamada de rede ao mexer nos controles.
- Mudar uma fórmula exige alterar `engine.ts` e `engine.py` juntos e regenerar as fixtures; a
  paridade quebra o CI se um lado ficar para trás.
- Para expor a API no futuro, a volta é Vercel Services com `/api/*` no backend e uma regra WAF
  de rate limit.
