from datetime import UTC, datetime
from typing import ClassVar
from uuid import UUID

from sqlalchemy import Column, DateTime, Enum as SQLEnum, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlmodel import Field, SQLModel, Table

from app.models.enums import UserRole


class User(SQLModel, table=True):
    __tablename__: ClassVar[str] = "users"

    id: UUID = Field(
        sa_column=Column(PGUUID(as_uuid=True), ForeignKey("auth.users.id", ondelete="CASCADE"), primary_key=True, nullable=False),
    )
    username: str = Field(index=True, nullable=False, unique=True)
    email: str = Field(index=True, unique=True, nullable=False)
    role: UserRole = Field(
        default=UserRole.USER,
        sa_column=Column(
            SQLEnum(
                UserRole,
                name="user_role_enum",
                native_enum=True,
                # This is necessary because the default value of the role field is a UserRole enum,
                # but the database expects a string. The values_callable converts the enum to a string when saving to the database.
                values_callable=lambda x: [v.value for v in x],
            ),
            nullable=False,
            default=UserRole.USER,
            server_default=UserRole.USER.value
        ),
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        sa_column=Column(DateTime(timezone=True), nullable=False, server_default=func.now()),
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        sa_column=Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()),
    )



# Stub table so SQLAlchemy/Alembic can resolve ForeignKey("auth.users.id")
# Ensure alembic/env.py filters out schema == "auth" in include_object!
auth_users_stub = Table(
    "users",
    SQLModel.metadata,
    Column("id", PGUUID(as_uuid=True), primary_key=True),
    schema="auth",
)
