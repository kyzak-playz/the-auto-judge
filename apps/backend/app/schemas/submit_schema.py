"""
Submission payload schema for handling code submissions and related requests in the backend application.
"""

from pydantic import BaseModel, Field


class SubmitSchema(BaseModel):
    problem_id: str
    code: str
    language: str = "python"


class SubmissionStartSchema(BaseModel):
    submission_id: str
    status: str = "queued"


class SubmissionListItemSchema(BaseModel):
    submission_id: str
    problem_id: str
    problem_title: str
    status: str
    submitted_at: str
    language: str
    passed_tests: int = Field(ge=0)
    total_tests: int = Field(ge=0)


class SubmissionTestResultSchema(BaseModel):
    name: str
    input: str
    expected: str
    actual: str
    passed: bool
    time: str


class SubmissionResultSchema(BaseModel):
    submission_id: str
    status: str
    passed_tests: int = Field(ge=0)
    total_tests: int = Field(ge=0)
    execution_time_ms: float = Field(ge=0)
    tests: list[SubmissionTestResultSchema]


class SubmissionDetailSchema(SubmissionResultSchema):
    problem_id: str
    problem_title: str
    code: str
    language: str
    submitted_at: str
