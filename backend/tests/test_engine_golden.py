"""The Python reference engine must reproduce fixtures/simulation-golden.json.

The same file drives the TypeScript engine's parity test, so both engines agree.
"""

import json
from datetime import date
from pathlib import Path

import pytest

from app.simulation.engine import SimulationEngine, price_factor
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


@pytest.mark.parametrize(
    "overrides",
    [{}, {"price": 220, "price_sensitivity": 0.5}, {"demand": 4000, "employees": 40}],
)
def test_monthly_profit_is_the_first_projected_month(overrides: dict[str, float]) -> None:
    result = SimulationEngine().run(SimulationInput.model_validate(overrides))
    assert result.monthly_profit == pytest.approx(result.profit_series[0], abs=MONEY_TOLERANCE)


def test_revenue_is_in_monthly_units_after_the_price_effect() -> None:
    data = SimulationInput(price=150, demand=2000, price_sensitivity=0.3)
    result = SimulationEngine().run(data)
    expected = data.price * data.demand * price_factor(data)
    assert result.revenue_series[0] == pytest.approx(expected, abs=MONEY_TOLERANCE)


@pytest.mark.parametrize("period", [1, 6, 12, 24])
def test_annual_profit_is_the_sum_of_twelve_months_for_any_horizon(period: int) -> None:
    twelve = SimulationEngine().run(SimulationInput(period_months=12))
    result = SimulationEngine().run(SimulationInput(period_months=period))
    assert result.annual_profit == pytest.approx(sum(twelve.profit_series), abs=0.05)
    assert len(result.profit_series) == period


def test_shrinking_demand_stops_at_zero_revenue() -> None:
    data = SimulationInput(churn_rate=0.25, period_months=24)
    result = SimulationEngine().run(data)
    assert min(result.revenue_series) == 0
    assert all(value >= 0 for value in result.revenue_series)


def test_month_labels_start_at_the_given_month_and_roll_over_years() -> None:
    data = SimulationInput(period_months=4)
    labels = SimulationEngine().run(data, start=date(2026, 11, 15)).month_labels
    assert labels == ["2026-11", "2026-12", "2027-01", "2027-02"]
