import importlib
import json
from pathlib import Path

import pytest


celery_module = importlib.import_module("app.workers.celery_app")


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
