import pytest
from fastapi.testclient import TestClient
from starlette.websockets import WebSocketDisconnect

from app.core.config import get_settings
from app.main import MAX_WS_MESSAGE_BYTES, app

WS_ROUTE = get_settings().websocket_route
ALLOWED_ORIGIN = get_settings().allowed_origins[0]


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


def connect(client: TestClient, origin: str | None = ALLOWED_ORIGIN):
    headers = {"origin": origin} if origin is not None else {}
    return client.websocket_connect(WS_ROUTE, headers=headers)


@pytest.mark.parametrize("origin", ["https://evil.example", "null", None])
def test_rejects_origin_outside_allowlist(client: TestClient, origin: str | None) -> None:
    with pytest.raises(WebSocketDisconnect) as exc_info:
        with connect(client, origin):
            pass
    assert exc_info.value.code == 1008


def test_allowed_origin_receives_result(client: TestClient) -> None:
    with connect(client) as ws:
        ws.send_json({})
        result = ws.receive_json()
    assert len(result["revenue_series"]) == 12
    assert "error" not in result


@pytest.mark.parametrize(
    "raw",
    [
        '{"price": 0}',  # what an emptied number field used to send
        '{"employees": -3}',
        '{"price": 5000}',
        '{"price": Infinity}',
        '{"demand": NaN}',
        '{"price": ""}',
        "not json",
        "",
    ],
)
def test_invalid_message_keeps_session_open(client: TestClient, raw: str) -> None:
    with connect(client) as ws:
        ws.send_text(raw)
        frame = ws.receive_json()
        assert frame["error"]["code"] == "validation_error"
        assert frame["error"]["fields"]

        ws.send_json({"price": 150})
        assert "monthly_profit" in ws.receive_json()


def test_error_frame_does_not_echo_input(client: TestClient) -> None:
    with connect(client) as ws:
        ws.send_text('{"price": "<script>"}')
        frame = ws.receive_json()
    assert frame["error"]["fields"][0]["field"] == "price"
    assert "<script>" not in str(frame)


def test_oversized_message_closes_with_1009(client: TestClient) -> None:
    with connect(client) as ws:
        ws.send_text("x" * (MAX_WS_MESSAGE_BYTES + 1))
        with pytest.raises(WebSocketDisconnect) as exc_info:
            ws.receive_json()
    assert exc_info.value.code == 1009


@pytest.mark.parametrize(
    "body",
    ['{"price": Infinity}', '{"demand": 1e12}', '{"employees": 0}'],
)
def test_rest_run_rejects_out_of_range_with_422(client: TestClient, body: str) -> None:
    response = client.post(
        "/api/scenarios/run",
        content=body,
        headers={"content-type": "application/json"},
    )
    assert response.status_code == 422


def test_rest_run_accepts_ui_range_limits(client: TestClient) -> None:
    response = client.post(
        "/api/scenarios/run",
        json={"price": 220, "variable_cost": 120, "demand": 4000, "employees": 40},
    )
    assert response.status_code == 200
