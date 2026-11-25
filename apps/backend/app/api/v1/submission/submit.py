import asyncio
from typing import Annotated
from uuid import uuid4

from fastapi import APIRouter, Body, WebSocket, status

from app.api.v1.submission.mock_data import get_mock_submission
from app.schemas.submit_schema import (
    SubmissionStartSchema,
    SubmitSchema,
)

router = APIRouter()
_MOCK_PROGRESS_INTERVAL_SECONDS = 1


@router.post("/", tags=["Submissions"], status_code=status.HTTP_202_ACCEPTED, response_model=SubmissionStartSchema)
async def submit(
    payload: Annotated[SubmitSchema, Body(description="The submission payload")],
) -> SubmissionStartSchema:
    return SubmissionStartSchema(submission_id=str(uuid4()))


@router.websocket("/{submission_id}/ws")
async def submission_updates(websocket: WebSocket, submission_id: str) -> None:
    await websocket.accept()

    for progress in range(1, 11):
        await asyncio.sleep(_MOCK_PROGRESS_INTERVAL_SECONDS)
        await websocket.send_json(
            {
                "status": "running",
                "progress": progress * 10,
                "message": "Running test cases...",
            }
        )

    result = get_mock_submission(submission_id)
    await websocket.send_json(
        {
            "status": "completed",
            "progress": 100,
            "result": result.model_dump(
                include={
                    "submission_id",
                    "status",
                    "passed_tests",
                    "total_tests",
                    "execution_time_ms",
                    "tests",
                }
            ),
        }
    )
    await websocket.close()
