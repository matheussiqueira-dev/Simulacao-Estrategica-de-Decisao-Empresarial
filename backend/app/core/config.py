import os
from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Business Decision Simulator API"
    api_prefix: str = "/api"

    # Vercel sets VERCEL=1 at build time and at runtime.
    running_on_vercel: bool = Field(default=False, validation_alias="VERCEL")

    # Database
    database_url: str = (
        "postgresql+asyncpg://bds_user:bds_pass@localhost:5432/bds"
    )

    # Security
    jwt_secret: str = "change-this-secret"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 4

    # CORS
    allowed_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    """
    Cached settings loader so we don't re-parse environment variables.
    """
    return Settings()
