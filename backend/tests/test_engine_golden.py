"""The Python reference engine must reproduce fixtures/simulation-golden.json.

The same file drives the TypeScript engine's parity test, so both engines agree.
"""

import json
from datetime import date
from pathlib import Path

import pytest

from app.simulation.engine import SimulationEngine
from app.simulation.schemas import SimulationInput

GOLDEN = Path(__file__).resolve().parents[2] / "fixtures" / "simulation-golden.json"
CASES = json.loads(GOLDEN.read_text(encoding="utf-8"))["cases"]
MONEY_TOLERANCE = 0.01
RATIO_TOLERANCE = 0.001


@pytest.mark.parametrize("case", CASES, ids=[case["name"] for case in CASES])
def test_engine_matches_golden_case(case: dict) -> None:
    result = SimulationEngine().run(SimulationInput(**case["input"])).model_dump()
    expected = case["expected"]

    for field in ("monthly_profit", "annual_profit", "cash_flow"):
        assert result[field] == pytest.approx(expected[field], abs=MONEY_TOLERANCE), field
    for field in ("safety_margin", "growth_rate", "risk_index"):
        assert result[field] == pytest.approx(expected[field], abs=RATIO_TOLERANCE), field
    for field in ("revenue_series", "profit_series"):
        assert result[field] == pytest.approx(expected[field], abs=MONEY_TOLERANCE), field


def test_golden_file_covers_enough_cases() -> None:
    assert len(CASES) >= 10


def test_month_labels_start_at_the_given_month_and_roll_over_years() -> None:
    data = SimulationInput(period_months=4)
    labels = SimulationEngine().run(data, start=date(2026, 11, 15)).month_labels
    assert labels == ["2026-11", "2026-12", "2027-01", "2027-02"]
