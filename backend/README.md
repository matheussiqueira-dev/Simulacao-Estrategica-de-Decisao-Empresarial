# Business Decision Simulator API

FastAPI backend that exposes REST endpoints and a WebSocket for real-time simulation results.

## Quick start
```bash
cd backend
python -m venv .venv
. .venv/Scripts/activate    # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Notable endpoints
- `GET /api/health/health` – liveness check
- `POST /api/auth/login` – demo JWT token (no persistence yet)
- `GET /api/scenarios/` – demo scenarios
- `POST /api/scenarios/run` – run a one-off simulation
- `WS /ws/simulate` – send simulation variables, receive computed KPIs and series

## WebSocket contract
- The handshake is refused (HTTP 403) unless the `Origin` header is one of `ALLOWED_ORIGINS`. Non-browser clients must send an allowed `Origin`.
- A message that fails validation (empty or non-numeric field, out of range, `NaN`/`Infinity`, invalid JSON) gets an error frame and the connection stays open:
  `{"error": {"code": "validation_error", "message": "...", "fields": [{"field": "price", "message": "..."}]}}`.
- Messages larger than 4 KiB close the connection with code 1009.
- Input bounds live in `app/simulation/schemas.py` and must never be stricter than the UI ranges in `frontend/src/app/types.ts`.

## Environment
Copy `.env.example` to `.env` and adjust credentials. `ALLOWED_ORIGINS` must be a JSON array (for example `'["http://localhost:3000"]'`); it drives both CORS and the WebSocket origin check. For a local Postgres instance you can change `DATABASE_URL` accordingly; routes are currently in-memory but the SQLAlchemy engine is wired for future persistence.

## Tests
```bash
cd backend
pip install -r requirements-dev.txt
python -m pytest
```
