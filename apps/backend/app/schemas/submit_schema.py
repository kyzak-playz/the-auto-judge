"""
Submission payload schema for handling code submissions and related requests in the backend application.
"""

from pydantic import BaseModel

from .problem_service_schemas import ProblemDetailSchema as ProblemSchema


class SubmitSchema(BaseModel):
    """
    Code submission schema for handling user submissions.
    """

    id: str
    code: str


class SubmissionListSchema(BaseModel):
    id: str
    code: str
    name: str
    submitted_at: str
    problem: ProblemSchema
