from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    app_name: str = "Business Decision Simulator API"
    api_prefix: str = "/api"

    # JSON array, e.g. '["http://localhost:3000"]'. Only needed when a frontend
    # on another origin calls this API (local development).
    allowed_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]


@lru_cache
def get_settings() -> Settings:
    """Cached settings loader so environment variables are parsed once."""
    return Settings()
