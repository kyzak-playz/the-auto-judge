from datetime import datetime, timezone
from typing import Any, ClassVar
from uuid import UUID, uuid4

from sqlalchemy import Column, DateTime, Enum as SQLEnum, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID as PGUUID
from sqlmodel import Field, SQLModel

from app.models.enums import ProblemDifficulty


class Problem(SQLModel, table=True):
    __tablename__: ClassVar[str] = "problem"

    id: UUID = Field(
        default_factory=uuid4,
        sa_column=Column(PGUUID(as_uuid=True), primary_key=True, nullable=False),
    )
    title: str = Field(nullable=False)
    description: str | None = Field(default=None, sa_column=Column(Text, nullable=True))
    difficulty: ProblemDifficulty = Field(
        default=ProblemDifficulty.MEDIUM,
        sa_column=Column(
            SQLEnum(
                ProblemDifficulty,
                name="problem_difficulty_enum",
                native_enum=True,
            ),
            nullable=False,
            default=ProblemDifficulty.MEDIUM,
        ),
    )
    test_case: dict[str, Any] = Field(
        sa_column=Column(JSONB, nullable=False, default=dict)
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
