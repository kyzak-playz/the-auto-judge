from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient

from app import main
from app.api.v1.submission import submit as submission_module


def test_submission_start_and_socket_result(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(
        main,
        "settings",
        SimpleNamespace(
            validate_runtime_requirements=lambda: None,
            app_env="development",
        ),
    )
    monkeypatch.setattr(main, "check_database_connection", lambda: None)
    monkeypatch.setattr(submission_module, "_MOCK_PROGRESS_INTERVAL_SECONDS", 0)

    with TestClient(main.app) as client:
        response = client.post(
            "/api/v1/submission/",
            json={
                "problem_id": "problem-123",
                "code": "print('hello')",
                "language": "python",
            },
        )

        assert response.status_code == 202
        submission_id = response.json()["submission_id"]

        submissions_response = client.get("/api/v1/submission/")
        assert submissions_response.status_code == 200
        assert len(submissions_response.json()) == 3

        details_response = client.get(f"/api/v1/submission/{submission_id}")
        assert details_response.status_code == 200
        assert details_response.json()["submission_id"] == submission_id
        assert details_response.json()["problem_title"] == "Two Sum"

        with client.websocket_connect(f"/api/v1/submission/{submission_id}/ws") as websocket:
            updates = [websocket.receive_json() for _ in range(11)]

    assert [update["progress"] for update in updates[:10]] == list(range(10, 101, 10))
    assert updates[-1] == {
        "status": "completed",
        "progress": 100,
        "result": {
            "submission_id": submission_id,
            "status": "accepted",
            "passed_tests": 3,
            "total_tests": 3,
            "execution_time_ms": 0.42,
            "tests": [
                {
                    "name": "Basic pair",
                    "input": "[2, 7, 11, 15], target = 9",
                    "expected": "[0, 1]",
                    "actual": "[0, 1]",
                    "passed": True,
                    "time": "0.42 ms",
                },
                {
                    "name": "Duplicate values",
                    "input": "[3, 3], target = 6",
                    "expected": "[0, 1]",
                    "actual": "[0, 1]",
                    "passed": True,
                    "time": "0.18 ms",
                },
                {
                    "name": "No matching pair",
                    "input": "[1, 2, 3], target = 10",
                    "expected": "[]",
                    "actual": "[]",
                    "passed": True,
                    "time": "0.15 ms",
                },
            ],
        },
    }
