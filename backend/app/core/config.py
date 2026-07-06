"""
Crescendo — Application Configuration
Loads environment variables with Pydantic Settings.
"""

from pydantic import field_validator
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # --- App ---
    APP_NAME: str = "Crescendo"
    APP_VERSION: str = "1.0.0"
    APP_ENV: str = "development"
    DEBUG: bool = True

    @field_validator("DEBUG", mode="before")
    @classmethod
    def parse_debug(cls, value):
        """Accept common environment names when DEBUG is set by the shell."""
        if isinstance(value, str):
            normalized = value.strip().lower()
            if normalized in {"release", "production", "prod"}:
                return False
            if normalized in {"development", "dev"}:
                return True
        return value

    # --- Server ---
    BACKEND_HOST: str = "0.0.0.0"
    BACKEND_PORT: int = 8000
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
    ]

    # --- Security ---
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # --- Database (SQLite) ---
    SQLITE_DB_PATH: str = "./crescendo.db"

    @property
    def DATABASE_URL(self) -> str:
        from pathlib import Path
        sqlite_path = Path(self.SQLITE_DB_PATH)
        if not sqlite_path.is_absolute():
            sqlite_path = Path(__file__).resolve().parents[3] / sqlite_path
        return f"sqlite+aiosqlite:///{sqlite_path.as_posix()}"

    @property
    def DATABASE_URL_SYNC(self) -> str:
        from pathlib import Path
        sqlite_path = Path(self.SQLITE_DB_PATH)
        if not sqlite_path.is_absolute():
            sqlite_path = Path(__file__).resolve().parents[3] / sqlite_path
        return f"sqlite:///{sqlite_path.as_posix()}"

    # --- Spotify ---
    SPOTIFY_CLIENT_ID: str = ""
    SPOTIFY_CLIENT_SECRET: str = ""
    SPOTIFY_REDIRECT_URI: str = "http://localhost:8000/api/v1/auth/spotify/callback"

    # --- Genius ---
    GENIUS_ACCESS_TOKEN: str = ""

    # --- Stripe ---
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    STRIPE_PRO_PRICE_ID: str = ""
    STRIPE_STUDIO_PRICE_ID: str = ""
    STRIPE_PORTAL_RETURN_URL: str = "http://localhost:3000/dashboard/settings"
    FRONTEND_URL: str = "http://localhost:3000"

    # --- Pinecone ---
    PINECONE_API_KEY: str = ""
    PINECONE_ENVIRONMENT: str = "us-east-1"
    PINECONE_INDEX_NAME: str = "crescendo-embeddings"


    # --- ML ---
    MODEL_PATH: str = "./ml_pipeline/saved_models"
    MODEL_VERSION: str = "v1.0.0"
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_SENTIMENT_MODEL: str = "llama3.2:1b"
    OLLAMA_SENTIMENT_TIMEOUT: float = 45.0

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
        "extra": "ignore",
    }


def _resolve_env_file() -> str:
    """Find .env — check CWD, then parent dir, then project root."""
    from pathlib import Path
    candidates = [
        Path(".env"),
        Path("../.env"),
        Path(__file__).resolve().parents[3] / ".env",  # backend/app/core -> project root
    ]
    for candidate in candidates:
        if candidate.exists():
            return str(candidate.resolve())
    return ".env"  # Default — pydantic will just skip it


settings = Settings(_env_file=_resolve_env_file())
