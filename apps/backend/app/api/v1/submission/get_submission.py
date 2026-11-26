from fastapi import APIRouter, status

from app.api.v1.submission.mock_data import MOCK_SUBMISSION_LIST, get_mock_submission
from app.schemas.submit_schema import SubmissionDetailSchema, SubmissionListItemSchema

router = APIRouter()


@router.get(
    "/",
    tags=["Submissions"],
    status_code=status.HTTP_200_OK,
    response_model=list[SubmissionListItemSchema],
)
def get_submissions() -> list[SubmissionListItemSchema]:
    return MOCK_SUBMISSION_LIST


@router.get(
    "/{submission_id}",
    tags=["Submissions"],
    status_code=status.HTTP_200_OK,
    response_model=SubmissionDetailSchema,
)
def get_submission(submission_id: str) -> SubmissionDetailSchema:
    return get_mock_submission(submission_id)
