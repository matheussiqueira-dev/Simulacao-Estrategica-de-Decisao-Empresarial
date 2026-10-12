"""Writes fixtures/simulation-golden.json from the Python reference engine.

The TypeScript engine (frontend/src/lib/simulation/engine.ts) and the Python
engine are both tested against this file, so a change to either formula fails a
test until the fixtures are regenerated on purpose:

    cd backend && python scripts/generate_golden.py

Month labels are not part of the fixtures: they depend on the current date.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

BACKEND = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND))

from app.simulation.engine import SimulationEngine  # noqa: E402
from app.simulation.schemas import SimulationInput  # noqa: E402

OUTPUT = BACKEND.parent / "fixtures" / "simulation-golden.json"

# Every value stays inside the UI ranges (frontend/src/lib/simulation/limits.ts).
CASES: dict[str, dict[str, float]] = {
    "default": {},
    "premium_price_sensitive": {"price": 220, "price_sensitivity": 0.5},
    "thin_margin": {"price": 60, "variable_cost": 50},
    "loss_making": {"demand": 200, "fixed_cost": 80_000},
    "no_marketing": {"marketing_spend": 0},
    "max_marketing": {"marketing_spend": 40_000},
    "one_month": {"period_months": 1},
    "two_years": {"period_months": 24},
    "high_churn": {"churn_rate": 0.25},
    "no_interest_low_tax": {"interest_rate": 0, "tax_rate": 0.05},
    "max_scale": {"demand": 4000, "employees": 40},
    "negative_contribution": {"price": 60, "variable_cost": 120},
    "all_minimums": {
        "price": 60,
        "variable_cost": 10,
        "fixed_cost": 5000,
        "employees": 5,
        "interest_rate": 0,
        "tax_rate": 0.05,
        "demand": 200,
        "marketing_spend": 0,
        "churn_rate": 0,
        "price_sensitivity": 0,
        "period_months": 1,
    },
}

RESULT_FIELDS = (
    "monthly_profit",
    "annual_profit",
    "cash_flow",
    "safety_margin",
    "growth_rate",
    "risk_index",
    "revenue_series",
    "profit_series",
)


def main() -> None:
    engine = SimulationEngine()
    cases = []
    for name, overrides in CASES.items():
        data = SimulationInput.model_validate(overrides)
        result = engine.run(data).model_dump()
        cases.append(
            {
                "name": name,
                "input": data.model_dump(),
                "expected": {field: result[field] for field in RESULT_FIELDS},
            }
        )
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps({"cases": cases}, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(cases)} cases to {OUTPUT}")


if __name__ == "__main__":
    main()
