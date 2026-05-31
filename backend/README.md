# Business Decision Simulator API

FastAPI backend que expoe endpoints REST e WebSocket para simulacao financeira em tempo real.

## Quick start

```bash
cd backend
python -m venv .venv
. .venv/Scripts/activate    # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Endpoints principais

- `GET /api/health` - liveness check.
- `POST /api/auth/login` - token JWT demonstrativo, sem persistencia.
- `GET /api/scenarios/` - cenarios demonstrativos.
- `POST /api/scenarios/run` - simulacao on-demand.
- `WS /ws/simulate` - recebe variaveis e retorna KPIs e series calculadas.

## Testes

```bash
PYTHONPATH=. pytest
```

## Ambiente

Copie `.env.example` para `.env` e ajuste credenciais. As rotas atuais usam dados em memoria, mas SQLAlchemy ja esta preparado para persistencia futura.
