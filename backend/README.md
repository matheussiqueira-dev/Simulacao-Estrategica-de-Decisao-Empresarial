# Business Decision Simulator API (reference)

FastAPI service with the reference implementation of the simulation engine. The public demo
computes in the browser with the TypeScript port (`frontend/src/lib/simulation/engine.ts`);
this API is not deployed. It exists for local use and for the parity tests that keep both
engines identical.

## Quick start
```bash
cd backend
python -m venv .venv
. .venv/Scripts/activate    # Windows
pip install -r requirements-dev.txt
uvicorn app.main:app --reload --port 8000
```

Python 3.12 is the target version (`.python-version`), the same one CI uses.

## Endpoints
- `GET /api/health` – liveness check
- `GET /api/scenarios/` – demo scenarios
- `POST /api/scenarios/run` – run a one-off simulation

## Validation
- Input bounds live in `app/simulation/schemas.py` and must never be stricter than the UI
  ranges in `frontend/src/lib/simulation/limits.ts`. `NaN` and `Infinity` are rejected.
- Invalid input returns 422 with FastAPI's `{"detail": [{"loc", "msg", "type"}]}` shape,
  without echoing the submitted value.

## Engine parity
`fixtures/simulation-golden.json` holds 13 scenarios that both engines must reproduce
(`tests/test_engine_golden.py` here, `engine.test.ts` in the frontend). After changing a
formula in both engines, regenerate the file:

```bash
cd backend
python scripts/generate_golden.py
```

## Environment
Copy `.env.example` to `.env` if you need to change the defaults. `ALLOWED_ORIGINS` must be a
JSON array (for example `'["http://localhost:3000"]'`); it only matters when a frontend on
another origin calls this API.

## Tests
```bash
cd backend
ruff check .
python -m pytest
```
