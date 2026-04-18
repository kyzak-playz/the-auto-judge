import importlib
import json
from pathlib import Path
from unittest.mock import MagicMock
import pytest
from fastapi.testclient import TestClient

from app import main


celery_module = importlib.import_module("app.workers.celery_app")

class _StubSettings:
    def __init__(self, app_env: str = "development") -> None:
        self.app_env = app_env
        self.validate_runtime_requirements = MagicMock()


def test_simulate_file_write_task_writes_json_file(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    monkeypatch.setattr(celery_module, "TASK_RESULTS_DIR", tmp_path)

    result = celery_module.simulate_file_write_task.apply(
        kwargs={"message": "hello-from-test"}
    ).get()

    result_file = Path(result["result_file"])
    assert result_file.exists()

    payload = json.loads(result_file.read_text(encoding="utf-8"))
    assert payload["task_id"] == result["task_id"]
    assert payload["message"] == "hello-from-test"
    assert payload["processed_at"]


def test_trigger_simulate_task_returns_task_id(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    stub_settings = _StubSettings(app_env="development")
    check_db_mock = MagicMock()
    monkeypatch.setattr(main, "settings", stub_settings)
    monkeypatch.setattr(main, "check_database_connection", check_db_mock)

    class _StubAsyncResult:
        id = "task-123"

    delay_mock = MagicMock(return_value=_StubAsyncResult())
    monkeypatch.setattr(
        "app.api.v1.tasks.simulate_file_write_task.delay",
        delay_mock,
    )

    with TestClient(main.app) as client:
        response = client.post("/tasks/simulate", json={"message": "queue-it"})

    assert response.status_code == 202
    assert response.json() == {"task_id": "task-123", "status": "queued"}
    delay_mock.assert_called_once_with(message="queue-it")
