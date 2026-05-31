from app.simulation.engine import SimulationEngine
from app.simulation.schemas import SimulationInput


def test_engine_returns_series_for_requested_horizon():
    result = SimulationEngine().run(SimulationInput(period_months=6))

    assert len(result.month_labels) == 6
    assert len(result.revenue_series) == 6
    assert len(result.profit_series) == 6


def test_risk_stays_normalized_under_stressed_inputs():
    result = SimulationEngine().run(
        SimulationInput(
            price=80,
            variable_cost=70,
            fixed_cost=70000,
            demand=250,
            marketing_spend=500,
            churn_rate=0.2,
            price_sensitivity=0.45,
        )
    )

    assert 0 <= result.risk_index <= 1
    assert result.monthly_profit < 0
