from datetime import datetime
from typing import ClassVar
from uuid import UUID, uuid4

from sqlalchemy import Column, DateTime, Enum as SQLEnum, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID as PGUUID
from sqlmodel import Field, SQLModel
from sqlalchemy.types import TypeDecorator

from app.models.enums import ProblemDifficulty
from app.types.test_case import TestCase

class TestCaseListType(TypeDecorator):
    impl = JSONB
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        # Python -> Database
        return [tc.model_dump() for tc in value]

    def process_result_value(self, value, dialect):
        if value is None:
            return None
        # Database -> Python
        return [TestCase.model_validate(tc) for tc in value]

class Problem(SQLModel, table=True):
    __tablename__: ClassVar[str] = "problem"

    id: UUID = Field(
        default_factory=uuid4,
        sa_column=Column(PGUUID(as_uuid=True), primary_key=True, nullable=False),
    )
    title: str = Field(nullable=False)
    description: str | None = Field(default=None, sa_column=Column(Text, nullable=True))
    difficulty: ProblemDifficulty = Field(
        sa_column=Column(
            SQLEnum(
                ProblemDifficulty,
                name="problem_difficulty_enum",
                native_enum=True,
            ),
            nullable=False
        ),
    )
    test_case: list[TestCase] = Field(
        default_factory=list,
        sa_column=Column(TestCaseListType, nullable=False)
    )
    created_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True), nullable=False, server_default=func.now()
        ),
    )
    updated_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
        ),
    )
