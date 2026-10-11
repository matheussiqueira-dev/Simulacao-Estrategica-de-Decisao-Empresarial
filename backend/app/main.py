from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import auth, health, scenarios
from app.core.config import get_settings

settings = get_settings()
app = FastAPI(
    title=settings.app_name,
    contact={
        "name": "Matheus Siqueira",
        "url": "https://www.matheussiqueira.dev",
        "email": "hellomatheusdev@gmail.com",
    },
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# The demo login signs a token for any credentials, so it stays out of public
# Vercel deployments and only exists when running locally.
if not settings.running_on_vercel:
    app.include_router(auth.router, prefix=f"{settings.api_prefix}/auth", tags=["auth"])
app.include_router(
    scenarios.router, prefix=f"{settings.api_prefix}/scenarios", tags=["scenarios"]
)
app.include_router(health.router, prefix=settings.api_prefix, tags=["health"])


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
    }
