from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "The Auto Judge Backend"


settings = Settings()
