from datetime import datetime, timezone
from typing import ClassVar
from uuid import UUID, uuid4

from sqlalchemy import Column, DateTime, Enum as SQLEnum, ForeignKey, Text, func
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlmodel import Field, SQLModel

from app.models.enums import SubmissionStatus


class Submission(SQLModel, table=True):
    __tablename__: ClassVar[str] = "submission"

    id: UUID = Field(
        default_factory=uuid4,
        sa_column=Column(PGUUID(as_uuid=True), primary_key=True, nullable=False),
    )
    user_id: UUID = Field(
        sa_column=Column(
            PGUUID(as_uuid=True), ForeignKey("user.id"), nullable=False, index=True
        )
    )
    problem_id: UUID = Field(
        sa_column=Column(
            PGUUID(as_uuid=True), ForeignKey("problem.id"), nullable=False, index=True
        )
    )
    source_code: str = Field(sa_column=Column(Text, nullable=False))
    language: str = Field(nullable=False, index=True)
    status: SubmissionStatus = Field(
        default=SubmissionStatus.PENDING,
        sa_column=Column(
            SQLEnum(SubmissionStatus, name="submission_status_enum", native_enum=True),
            nullable=False,
            default=SubmissionStatus.PENDING,
            index=True,
        ),
    )
    hints_used: int = Field(
        default=0, sa_column=Column(default=0, nullable=False, server_default="0")
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(
            DateTime(timezone=True), nullable=False, server_default=func.now()
        ),
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(
            DateTime(timezone=True), nullable=False, server_default=func.now()
        ),
    )
