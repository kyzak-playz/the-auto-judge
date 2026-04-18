import os
import json
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

from celery import Celery


def _redis_url() -> str:
    return os.getenv("REDIS_URL", "redis://redis:6379/0")


celery_app = Celery(
    "the_auto_judge",
    broker=_redis_url(),
    backend=_redis_url(),
)

TASK_RESULTS_DIR = Path(
    os.getenv(
        "TASK_RESULTS_DIR",
        str(Path(tempfile.gettempdir()) / "auto-judge-task-results"),
    )
)

celery_app.conf.update(
    accept_content=["json"],
    result_serializer="json",
    task_serializer="json",
    task_track_started=True,
    timezone="UTC",
    enable_utc=True,
    worker_prefetch_multiplier=1,
)


@celery_app.task(name="app.workers.simulate_file_write_task", bind=True)
def simulate_file_write_task(self, message: str = "ping") -> dict[str, str]:
    task_id = self.request.id or str(uuid4())
    TASK_RESULTS_DIR.mkdir(parents=True, exist_ok=True)

    payload = {
        "task_id": task_id,
        "message": message,
        "processed_at": datetime.now(timezone.utc).isoformat(),
    }

    result_file = TASK_RESULTS_DIR / f"{task_id}.json"
    result_file.write_text(json.dumps(payload, indent=2), encoding="utf-8")

    return {
        "task_id": task_id,
        "result_file": str(result_file),
    }
