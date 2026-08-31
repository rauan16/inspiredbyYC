from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path
import secrets


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).resolve().parent.parent / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    SECRET_KEY: str = secrets.token_urlsafe(32)

    AI_API_BASE_URL: str = "http://localhost:20128/v1"
    AI_API_KEY: str = ""
    AI_MODEL: str = ""

    CORS_ALLOWED_ORIGINS: str = "http://localhost:3000"

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.CORS_ALLOWED_ORIGINS.split(",") if o.strip()]


settings = Settings()
