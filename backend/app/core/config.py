from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = ConfigDict(env_file=".env", case_sensitive=True)

    # Database
    DATABASE_URL: str = "postgresql://loan_user:loan_pass@localhost:5432/loan_orchestrator"

    # API
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Loan Orchestrator"

    # CORS - stored as string, converted to list
    BACKEND_CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173"

    # OpenAI (optional for bonus)
    OPENAI_API_KEY: str | None = None

    def get_cors_origins(self) -> list[str]:
        """Parse CORS origins from comma-separated string"""
        return [origin.strip() for origin in self.BACKEND_CORS_ORIGINS.split(",")]


@lru_cache()
def get_settings() -> Settings:
    return Settings()
