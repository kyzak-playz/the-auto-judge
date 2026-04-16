import logging

import pytest

from app.core.config import Settings, get_settings


# Verifies required settings can be loaded from environment variables.
def test_settings_loads_required_fields() -> None:
    settings = Settings(
        database_uri="postgresql://user:pass@localhost:5432/db",
        app_env="development",
    )

    assert settings.database_uri == "postgresql://user:pass@localhost:5432/db"


# Verifies get_settings is cached and returns the same object instance.
def test_get_settings_returns_same_instance(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("DATABASE_URI", "postgresql://user:pass@localhost:5432/db")

    first = get_settings()
    second = get_settings()

    assert first is second


# Verifies development mode warns (instead of raising) when required runtime values are missing.
def test_validate_runtime_requirements_dev_env_warns_on_missing(
    caplog: pytest.LogCaptureFixture,
) -> None:
    settings = Settings(
        database_uri="postgresql://user:pass@localhost:5432/db",
        app_env="development",
    )

    with caplog.at_level(logging.WARNING):
        settings.validate_runtime_requirements()

    assert "Missing required backend configuration values" in caplog.text
    assert "SUPABASE_URL" in caplog.text


# Verifies non-development mode fails fast when required runtime values are missing.
def test_validate_runtime_requirements_non_dev_raises_on_missing() -> None:
    settings = Settings(
        database_uri="postgresql://user:pass@localhost:5432/db",
        app_env="production",
    )

    with pytest.raises(RuntimeError) as exc_info:
        settings.validate_runtime_requirements()

    assert "Missing required backend configuration values" in str(exc_info.value)
    assert "SUPABASE_SECRET" in str(exc_info.value)


# Verifies runtime validation passes cleanly when all required values are present.
def test_validate_runtime_requirements_succeeds_when_complete() -> None:
    settings = Settings(
        database_uri="postgresql://user:pass@localhost:5432/db",
        app_env="production",
        supabase_url="https://example.supabase.co",
        supabase_secret="secret",
        supabase_jwt_signing_key="jwt-key",
    )

    settings.validate_runtime_requirements()
