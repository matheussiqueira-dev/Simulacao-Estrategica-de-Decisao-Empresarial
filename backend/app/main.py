from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import health, scenarios
from app.core.config import get_settings

settings = get_settings()
app = FastAPI(
    title=settings.app_name,
    description=(
        "Reference API for the simulation engine. The public demo computes in the browser "
        "with the TypeScript port; this service is for local use and parity tests."
    ),
    contact={
        "name": "Matheus Siqueira",
        "url": "https://www.matheussiqueira.dev",
        "email": "hellomatheusdev@gmail.com",
    },
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["content-type"],
)

app.include_router(scenarios.router, prefix=f"{settings.api_prefix}/scenarios", tags=["scenarios"])
app.include_router(health.router, prefix=settings.api_prefix, tags=["health"])


@app.exception_handler(RequestValidationError)
async def request_validation_handler(
    _request: Request, exc: RequestValidationError
) -> JSONResponse:
    # The default handler echoes the rejected input: NaN/Infinity cannot be serialized,
    # which turned the 422 into a 500. Keep FastAPI's documented shape without the input.
    detail = [{"loc": err["loc"], "msg": err["msg"], "type": err["type"]} for err in exc.errors()]
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, content={"detail": detail}
    )


@app.get("/")
async def index() -> dict[str, str]:
    return {"name": settings.app_name, "docs": "/docs"}
