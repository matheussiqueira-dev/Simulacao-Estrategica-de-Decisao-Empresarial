import pytest
from fastapi.testclient import TestClient

from app.main import app

RUN_URL = "/api/scenarios/run"


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


def test_run_returns_result_for_valid_input(client: TestClient) -> None:
    response = client.post(RUN_URL, json={"price": 150})
    assert response.status_code == 200
    body = response.json()
    assert body["inputs"]["price"] == 150
    assert len(body["result"]["revenue_series"]) == 12


@pytest.mark.parametrize(
    "body",
    [
        '{"price": 0}',  # what an emptied number field used to send
        '{"price": null}',
        '{"demand": null}',
        '{"employees": -3}',
        '{"employees": 41}',  # one past the UI maximum
        '{"price": 220.01}',  # just past the UI maximum
        '{"tax_rate": 1.01}',
        '{"price": 5000}',
        '{"demand": 1e12}',
        '{"price": Infinity}',
        '{"demand": NaN}',
        '{"price": ""}',
        "not json",
    ],
)
def test_run_rejects_invalid_input_with_422(client: TestClient, body: str) -> None:
    response = client.post(RUN_URL, content=body, headers={"content-type": "application/json"})
    assert response.status_code == 422
    assert response.json()["detail"]


def test_validation_error_does_not_echo_input(client: TestClient) -> None:
    response = client.post(RUN_URL, json={"price": "<script>"})
    assert response.status_code == 422
    assert "<script>" not in response.text


@pytest.mark.parametrize(
    "payload",
    [
        {"price": 220, "variable_cost": 120, "demand": 4000, "employees": 40},
        {"price": 60, "variable_cost": 10, "demand": 200, "employees": 5},
        {"interest_rate": 0, "marketing_spend": 0, "churn_rate": 0},
    ],
)
def test_run_accepts_ui_range_limits(client: TestClient, payload: dict[str, float]) -> None:
    assert client.post(RUN_URL, json=payload).status_code == 200


def test_health_and_scenarios_respond(client: TestClient) -> None:
    assert client.get("/api/health").json() == {"status": "ok"}
    scenarios = client.get("/api/scenarios/").json()["scenarios"]
    assert [s["name"] for s in scenarios] == ["Base case", "High marketing"]


def test_demo_login_no_longer_exists(client: TestClient) -> None:
    response = client.post("/api/auth/login", json={"email": "a@example.com", "password": "x"})
    assert response.status_code == 404
