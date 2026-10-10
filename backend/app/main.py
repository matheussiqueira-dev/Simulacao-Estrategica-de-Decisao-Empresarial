import logging
from typing import Any

from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from starlette.websockets import WebSocketState

from app.api.routes import auth, health, scenarios
from app.core.config import get_settings
from app.simulation.engine import SimulationEngine
from app.simulation.schemas import SimulationInput

logger = logging.getLogger(__name__)

# A valid simulation payload is ~300 bytes; anything this large is not one.
MAX_WS_MESSAGE_BYTES = 4096

settings = get_settings()
app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=f"{settings.api_prefix}/auth", tags=["auth"])
app.include_router(
    scenarios.router, prefix=f"{settings.api_prefix}/scenarios", tags=["scenarios"]
)
app.include_router(health.router, prefix=settings.api_prefix, tags=["health"])

engine = SimulationEngine()


@app.exception_handler(RequestValidationError)
async def request_validation_handler(
    _request: Request, exc: RequestValidationError
) -> JSONResponse:
    # The default handler echoes the rejected input: NaN/Infinity cannot be serialized,
    # which turned the 422 into a 500. Keep FastAPI's documented shape without the input.
    detail = [
        {"loc": err["loc"], "msg": err["msg"], "type": err["type"]} for err in exc.errors()
    ]
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, content={"detail": detail}
    )


@app.get("/")
async def index():
    return {
        "name": settings.app_name,
        "docs": "/docs",
        "websocket": settings.websocket_route,
    }


def validation_error_frame(exc: ValidationError) -> dict[str, Any]:
    """Error envelope for a rejected message; never echoes the submitted values."""
    return {
        "error": {
            "code": "validation_error",
            "message": "Invalid simulation input.",
            "fields": [
                {"field": ".".join(str(part) for part in err["loc"]), "message": err["msg"]}
                for err in exc.errors(include_url=False, include_input=False)
            ],
        }
    }


@app.websocket(settings.websocket_route)
async def simulation_socket(websocket: WebSocket):
    # CORSMiddleware does not cover WebSocket handshakes, so without this check any
    # website could drive the socket from a visitor's browser. Closing before accept
    # makes the server answer the handshake with 403.
    if websocket.headers.get("origin") not in settings.allowed_origins:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await websocket.accept()
    try:
        while True:
            message = await websocket.receive()
            if message["type"] == "websocket.disconnect":
                return

            raw = message.get("text") or message.get("bytes") or b""
            if isinstance(raw, str):
                raw = raw.encode()
            if len(raw) > MAX_WS_MESSAGE_BYTES:
                await websocket.close(code=status.WS_1009_MESSAGE_TOO_BIG)
                return

            try:
                variables = SimulationInput.model_validate_json(raw)
            except ValidationError as exc:
                # Reject only this message; the session stays usable for the next one.
                await websocket.send_json(validation_error_frame(exc))
                continue

            result = engine.run(variables)
            await websocket.send_json(result.model_dump())
    except WebSocketDisconnect:
        # Client closed the connection; nothing to do.
        return
    except Exception:
        logger.exception("Simulation socket failed")
        if websocket.client_state == WebSocketState.CONNECTED:
            await websocket.close(code=status.WS_1011_INTERNAL_ERROR)
