from fastapi import APIRouter, status
from pydantic import BaseModel, Field

from ...workers.celery_app import simulate_file_write_task


router = APIRouter(prefix="/tasks", tags=["tasks"])


class TriggerTaskRequest(BaseModel):
    message: str = Field(default="ping", min_length=1)


class TriggerTaskResponse(BaseModel):
    task_id: str
    status: str


@router.post("/simulate", status_code=status.HTTP_202_ACCEPTED)
async def trigger_simulate_task(request: TriggerTaskRequest) -> TriggerTaskResponse:
    async_result = simulate_file_write_task.delay(message=request.message)
    return TriggerTaskResponse(task_id=async_result.id, status="queued")
