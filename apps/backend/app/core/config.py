from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env.local",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    app_name: str = "The Auto Judge Backend"
    database_uri: str

# lru_cache is used to ensure that the settings are only loaded once and cached for future use. 
# This is important because loading settings from the environment can be an expensive operation, 
# and we want to avoid doing it multiple times throughout the application.
@lru_cache
def get_settings() -> Settings:
    return Settings()  # pyright: ignore[reportCallIssue]


settings = get_settings()
