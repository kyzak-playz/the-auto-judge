from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient

from app import main


class _StubSettings:
    def __init__(self, app_env: str = "development") -> None:
        self.app_env = app_env
        self.validate_runtime_requirements = MagicMock()


# Verifies app metadata title remains as expected for service identification.
def test_app_created_with_expected_title() -> None:
    assert main.app.title == "The Auto Judge Backend"


# Verifies startup lifespan calls runtime settings validation.
def test_lifespan_calls_validate_runtime_requirements_on_startup(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    stub_settings = _StubSettings(app_env="development")
    check_db_mock = MagicMock()
    monkeypatch.setattr(main, "settings", stub_settings)
    monkeypatch.setattr(main, "check_database_connection", check_db_mock)

    with TestClient(main.app):
        pass

    stub_settings.validate_runtime_requirements.assert_called_once()


# Verifies startup lifespan performs database connectivity check.
def test_lifespan_checks_database_connection_on_startup(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    stub_settings = _StubSettings(app_env="development")
    check_db_mock = MagicMock()
    monkeypatch.setattr(main, "settings", stub_settings)
    monkeypatch.setattr(main, "check_database_connection", check_db_mock)

    with TestClient(main.app):
        pass

    check_db_mock.assert_called_once()


# Verifies development mode only logs a warning if database connectivity fails on startup.
def test_lifespan_warns_on_db_failure_in_dev(monkeypatch: pytest.MonkeyPatch) -> None:
    stub_settings = _StubSettings(app_env="development")
    monkeypatch.setattr(main, "settings", stub_settings)
    monkeypatch.setattr(
        main, "check_database_connection", MagicMock(side_effect=Exception("boom"))
    )
    warning_mock = MagicMock()
    monkeypatch.setattr(main.logger, "warning", warning_mock)

    with TestClient(main.app):
        pass

    warning_mock.assert_called_once()


# Verifies non-development mode raises a RuntimeError when startup database check fails.
def test_lifespan_raises_on_db_failure_in_non_dev(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    stub_settings = _StubSettings(app_env="production")
    monkeypatch.setattr(main, "settings", stub_settings)
    monkeypatch.setattr(
        main, "check_database_connection", MagicMock(side_effect=Exception("boom"))
    )

    with pytest.raises(RuntimeError) as exc_info:
        with TestClient(main.app):
            pass

    assert "Database connectivity check failed during startup." in str(exc_info.value)
