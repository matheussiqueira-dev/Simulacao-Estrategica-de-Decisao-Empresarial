# Business Decision Simulator API

FastAPI backend that runs the simulation engine behind REST endpoints under `/api`.

## Quick start
```bash
cd backend
python -m venv .venv
. .venv/Scripts/activate    # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Python 3.12 is the target version (`.python-version`), matching the Vercel runtime.

## Notable endpoints
- `GET /api/health` – liveness check
- `POST /api/auth/login` – demo JWT token (no persistence yet). Registered only outside Vercel: it signs a token for any credentials.
- `GET /api/scenarios/` – demo scenarios
- `POST /api/scenarios/run` – run a one-off simulation

## Validation
- Input bounds live in `app/simulation/schemas.py` and must never be stricter than the UI ranges in `frontend/src/app/types.ts`. `NaN` and `Infinity` are rejected.
- Invalid input returns 422 with FastAPI's `{"detail": [{"loc", "msg", "type"}]}` shape, without echoing the submitted value.

## Environment
Copy `.env.example` to `.env` and adjust credentials. `ALLOWED_ORIGINS` must be a JSON array (for example `'["http://localhost:3000"]'`); it drives CORS when the frontend runs on another origin. For a local Postgres instance you can change `DATABASE_URL` accordingly; routes are currently in-memory but the SQLAlchemy engine is wired for future persistence.

On Vercel this backend is the `backend` service in the root `vercel.json` and receives every `/api/*` request with its original path.

## Tests
```bash
cd backend
pip install -r requirements-dev.txt
python -m pytest
```
