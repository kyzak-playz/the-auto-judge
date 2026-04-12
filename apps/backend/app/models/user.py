from datetime import datetime, timezone
from uuid import UUID, uuid4

from sqlalchemy import Column, DateTime, Enum as SQLEnum, func
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlmodel import Field, SQLModel

from app.models.enums import UserRole


class User(SQLModel, table=True):
    __tablename__ = "user"

    id: UUID = Field(
        default_factory=uuid4,
        sa_column=Column(PGUUID(as_uuid=True), primary_key=True, nullable=False),
    )
    username: str = Field(index=True, nullable=False)
    email: str = Field(index=True, unique=True, nullable=False)
    role: UserRole = Field(
        default=UserRole.STUDENT,
        sa_column=Column(
            SQLEnum(UserRole, name="user_role_enum", native_enum=True),
            nullable=False,
            default=UserRole.STUDENT,
        ),
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
