from datetime import datetime, timezone
from typing import Any
from uuid import UUID, uuid4

from sqlalchemy import (
    CheckConstraint,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID as PGUUID
from sqlmodel import Field, SQLModel


class Result(SQLModel, table=True):
    __tablename__ = "result"
    __table_args__ = (
        CheckConstraint("score >= 0 AND score <= 100", name="score_range"),
    )

    id: UUID = Field(
        default_factory=uuid4,
        sa_column=Column(PGUUID(as_uuid=True), primary_key=True, nullable=False),
    )
    submission_id: UUID = Field(
        sa_column=Column(
            PGUUID(as_uuid=True),
            ForeignKey("submission.id"),
            nullable=False,
            index=True,
            unique=True,
        )
    )
    score: int = Field(sa_column=Column(Integer, nullable=False))
    ai_feedback: dict[str, Any] | None = Field(
        default=None, sa_column=Column(JSONB, nullable=True)
    )
    exec_time: float | None = Field(
        default=None, sa_column=Column(Float, nullable=True)
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
