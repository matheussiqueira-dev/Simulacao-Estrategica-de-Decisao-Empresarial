from typing import List

from pydantic import BaseModel, ConfigDict, Field


class SimulationInput(BaseModel):
    # NaN/Infinity would propagate through the engine and serialize as invalid JSON.
    # Bounds must never be stricter than the UI ranges in frontend/src/app/types.ts.
    model_config = ConfigDict(allow_inf_nan=False)

    price: float = Field(120.0, gt=0, le=220, description="Sale price per unit")
    variable_cost: float = Field(45.0, gt=0, le=120, description="Variable cost per unit")
    fixed_cost: float = Field(25000.0, ge=0, le=80_000, description="Monthly fixed costs")
    employees: int = Field(12, ge=1, le=40, description="Headcount on payroll")
    interest_rate: float = Field(
        0.08, ge=0, le=0.25, description="Annual interest rate (decimal)"
    )
    tax_rate: float = Field(0.27, ge=0, le=1, description="Effective tax rate")
    demand: float = Field(1200.0, ge=0, le=4000, description="Expected monthly demand units")
    marketing_spend: float = Field(
        12000.0, ge=0, le=40_000, description="Monthly marketing investment"
    )
    churn_rate: float = Field(0.04, ge=0, le=1, description="Customer churn rate (decimal)")
    price_sensitivity: float = Field(0.18, ge=0, le=2, description="Demand elasticity to price")
    period_months: int = Field(12, ge=1, le=24, description="Projection horizon in months")


class SimulationResult(BaseModel):
    monthly_profit: float
    annual_profit: float
    cash_flow: float
    safety_margin: float
    growth_rate: float
    risk_index: float
    revenue_series: List[float]
    profit_series: List[float]
    month_labels: List[str]


class SimulationResponse(BaseModel):
    inputs: SimulationInput
    result: SimulationResult
