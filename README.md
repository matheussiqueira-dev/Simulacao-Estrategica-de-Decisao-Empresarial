# Business Decision Simulator

Plataforma web interativa para testar decisoes estrategicas de negocio e visualizar impacto em lucro, caixa, crescimento e risco.

![Demonstracao](docs/demo.gif)

## Destaques

- Atualizacao em tempo real: sliders disparam calculos via WebSocket; se o socket cair, ha fallback local.
- KPIs e graficos dinamicos: lucro, fluxo de caixa, margem de seguranca, risco e projecao de receita/lucro.
- UX inspirada em cockpit financeiro, com controles a esquerda e indicadores a direita.
- Engine vetorizada com NumPy/Pandas para simulacoes rapidas e extensao simples.
- SEO, PWA, headers de seguranca e Vercel config preparados no frontend.
- Creditos profissionais permanentes para Matheus Siqueira.

## Stack

- **Frontend**: Next.js 16.2, React 19.2, Tailwind 3, Recharts, Playwright.
- **Backend**: FastAPI, WebSocket, Pydantic v2, SQLAlchemy, JWT demo.
- **Engine**: NumPy + Pandas para calculo de lucro, caixa, risco e crescimento.
- **DB**: PostgreSQL planejado; models ja estao preparados.

## Arquitetura

- `frontend/` - UI, componentes, metadata, PWA e estado via `useSimulationState`.
- `backend/app/main.py` - FastAPI + rota WS `/ws/simulate`.
- `backend/app/simulation/engine.py` - motor de calculo vetorizado.
- `backend/app/api/routes/` - auth demo, cenarios mock e health.

## Como rodar localmente

### Backend

```bash
cd backend
python -m venv .venv
. .venv/Scripts/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev -- --hostname 0.0.0.0 --port 3000
```

O frontend espera `ws://localhost:8000/ws/simulate`. Para apontar para outro host/porta, defina `NEXT_PUBLIC_WS_URL`.

## Endpoints uteis

- `GET /api/health` - liveness.
- `POST /api/auth/login` - emite JWT de demonstracao, sem persistencia.
- `GET /api/scenarios` - cenarios mock.
- `POST /api/scenarios/run` - executa simulacao on-demand.
- `WS /ws/simulate` - envia variaveis, recebe KPIs e series.

## Variaveis simuladas

```json
{
  "price": 120,
  "variable_cost": 45,
  "fixed_cost": 25000,
  "employees": 12,
  "interest_rate": 0.08,
  "tax_rate": 0.27,
  "demand": 1200,
  "marketing_spend": 12000,
  "churn_rate": 0.04,
  "price_sensitivity": 0.18,
  "period_months": 12
}
```

## Validacao

```bash
cd frontend
npm run lint
npm run build
npm audit --audit-level=moderate
```

```bash
PYTHONPATH=backend pytest backend/tests
python -m compileall backend/app
```

## Deploy na Vercel

Configure a Vercel com `frontend/` como root directory. O arquivo `frontend/vercel.json` define `npm ci` e `npm run build`.

## Proximos passos sugeridos

- Persistir usuarios/cenarios com PostgreSQL + Alembic.
- Proteger WebSocket com JWT e adicionar rate limiting.
- Evoluir testes E2E com Playwright.
- Adicionar pipeline CI para frontend e backend.

## Creditos

Desenvolvido por [Matheus Siqueira](https://www.matheussiqueira.dev).

## Sobre o GIF

O arquivo `docs/demo.gif` foi gerado a partir da UI atual. Para recriar:

1. Inicie frontend e backend.
2. Gere o PNG: `cd frontend && node scripts/screenshot.mjs`.
3. Converta para GIF com Pillow, se desejar.
4. Faca o commit de `docs/demo.png` ou `docs/demo.gif`.
