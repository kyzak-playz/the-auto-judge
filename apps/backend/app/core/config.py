from functools import lru_cache
import logging
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env.local",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    app_name: str = "The Auto Judge Backend"
    app_env: str = "development"
    database_uri: str = Field(validation_alias="DATABASE_URI")
    supabase_url: str = Field(validation_alias="SUPABASE_URL")
    supabase_secret: str = Field(validation_alias="SUPABASE_SECRET")
    supabase_publishable_key: str = Field(validation_alias="SUPABASE_PUBLISHABLE_KEY")

    def validate_runtime_requirements(self) -> None:
        required = {
            "DATABASE_URI": self.database_uri,
            "SUPABASE_URL": self.supabase_url,
            "SUPABASE_SECRET": self.supabase_secret,
            "SUPABASE_PUBLISHABLE_KEY": self.supabase_publishable_key,
        }
        missing = [key for key, value in required.items() if not value]
        if not missing:
            return

        message = f"Missing required backend configuration values: {', '.join(missing)}."


        if self.app_env.lower() in {"development", "dev", "local"}:
            logger.warning(message)
            return

        raise RuntimeError(message)


@lru_cache
def get_settings() -> Settings:
    return Settings()  # pyright: ignore[reportCallIssue]


settings = get_settings()
