from __future__ import annotations

import numpy as np
import pandas as pd

from app.simulation.schemas import SimulationInput, SimulationResult


class SimulationEngine:
    """
    Lightweight vectorized simulation core that estimates profit, cash flow,
    growth, and risk using the incoming variable set.
    """

    def __init__(self) -> None:
        self.base_salary = 4200.0
        self.working_capital_ratio = 0.12
        self.debt = 150_000.0

    def run(self, data: SimulationInput) -> SimulationResult:
        payroll = data.employees * self.base_salary
        contribution_margin = data.price - data.variable_cost

        revenue = data.price * data.demand
        variable_costs = data.variable_cost * data.demand
        gross_profit = revenue - variable_costs

        operating_costs = payroll + data.fixed_cost + data.marketing_spend
        ebit = gross_profit - operating_costs

        interest_expense = self.debt * data.interest_rate / 12
        profit_before_tax = ebit - interest_expense
        taxes = max(profit_before_tax, 0) * data.tax_rate

        net_profit = profit_before_tax - taxes
        monthly_profit = float(np.round(net_profit, 2))
        annual_profit = float(np.round(net_profit * 12, 2))

        depreciation = data.fixed_cost * 0.05
        working_capital_change = revenue * self.working_capital_ratio
        cash_flow = float(
            np.round(
                net_profit + depreciation - working_capital_change / data.period_months,
                2,
            )
        )

        breakeven_units = (operating_costs + interest_expense) / max(
            contribution_margin, 1e-3
        )
        safety_margin = (data.demand - breakeven_units) / max(data.demand, 1e-3)
        risk_index = float(np.clip(1 - safety_margin, 0, 1))

        marketing_factor = np.log1p(data.marketing_spend) / 10_000
        price_penalty = data.price_sensitivity * max((data.price - 100) / 100, 0)
        churn_penalty = data.churn_rate * 0.6
        monthly_growth = np.clip(
            0.01 + marketing_factor - price_penalty - churn_penalty, -0.1, 0.25
        )

        idx = np.arange(data.period_months)
        seasonality = 1 + 0.08 * np.sin(2 * np.pi * idx / 12)
        trend = 1 + monthly_growth * idx
        price_competitiveness = np.clip(
            1 - data.price_sensitivity * ((data.price - 100) / 100), 0.6, 1.3
        )
        demand_projection = (
            (data.demand / data.period_months) * trend * seasonality * price_competitiveness
        )

        revenue_series = data.price * demand_projection
        variable_series = data.variable_cost * demand_projection
        profit_series = (
            revenue_series
            - variable_series
            - (operating_costs / data.period_months)
            - (interest_expense / data.period_months)
            - (taxes / data.period_months)
        )

        months = pd.date_range("2024-01-01", periods=data.period_months, freq="ME")
        month_labels = months.strftime("%b").tolist()

        df = pd.DataFrame(
            {"month": month_labels, "revenue": revenue_series, "profit": profit_series}
        )

        return SimulationResult(
            monthly_profit=monthly_profit,
            annual_profit=annual_profit,
            cash_flow=cash_flow,
            safety_margin=float(np.round(safety_margin, 3)),
            growth_rate=float(np.round(monthly_growth * 12, 3)),
            risk_index=float(np.round(risk_index, 3)),
            revenue_series=[float(np.round(x, 2)) for x in df["revenue"].tolist()],
            profit_series=[float(np.round(x, 2)) for x in df["profit"].tolist()],
            month_labels=month_labels,
        )
