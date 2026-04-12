"""create initial schema models

Revision ID: 0f1be5216f30
Revises:
Create Date: 2026-04-12 08:40:54.632141

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "0f1be5216f30"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    user_role_enum = postgresql.ENUM(
        "student", "admin", name="user_role_enum", create_type=False
    )
    problem_difficulty_enum = postgresql.ENUM(
        "easy", "medium", "hard", name="problem_difficulty_enum", create_type=False
    )
    submission_status_enum = postgresql.ENUM(
        "pending",
        "running",
        "accepted",
        "wrong_answer",
        "runtime_error",
        "time_limit_exceeded",
        name="submission_status_enum",
        create_type=False,
    )

    op.execute(
        """
        DO $$
        BEGIN
            CREATE TYPE user_role_enum AS ENUM ('student', 'admin');
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END
        $$;
        """
    )
    op.execute(
        """
        DO $$
        BEGIN
            CREATE TYPE problem_difficulty_enum AS ENUM ('easy', 'medium', 'hard');
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END
        $$;
        """
    )
    op.execute(
        """
        DO $$
        BEGIN
            CREATE TYPE submission_status_enum AS ENUM (
                'pending',
                'running',
                'accepted',
                'wrong_answer',
                'runtime_error',
                'time_limit_exceeded'
            );
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END
        $$;
        """
    )

    op.create_table(
        "user",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("username", sa.String(), nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("role", user_role_enum, server_default="student", nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )
    op.create_index("ix_user_username", "user", ["username"], unique=False)

    op.create_table(
        "problem",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column(
            "difficulty",
            problem_difficulty_enum,
            server_default="medium",
            nullable=False,
        ),
        sa.Column("test_case", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "submission",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("problem_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("source_code", sa.Text(), nullable=False),
        sa.Column("language", sa.String(), nullable=False),
        sa.Column(
            "status", submission_status_enum, server_default="pending", nullable=False
        ),
        sa.Column("hints_used", sa.Integer(), server_default="0", nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["problem_id"], ["problem.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["user.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_submission_language", "submission", ["language"], unique=False)
    op.create_index(
        "ix_submission_problem_id", "submission", ["problem_id"], unique=False
    )
    op.create_index("ix_submission_status", "submission", ["status"], unique=False)
    op.create_index("ix_submission_user_id", "submission", ["user_id"], unique=False)

    op.create_table(
        "result",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("submission_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("score", sa.Integer(), nullable=False),
        sa.Column(
            "ai_feedback", postgresql.JSONB(astext_type=sa.Text()), nullable=True
        ),
        sa.Column("exec_time", sa.Float(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint("score >= 0 AND score <= 100", name="score_range"),
        sa.ForeignKeyConstraint(["submission_id"], ["submission.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("submission_id"),
    )
    op.create_index("ix_result_submission_id", "result", ["submission_id"], unique=True)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index("ix_result_submission_id", table_name="result")
    op.drop_table("result")

    op.drop_index("ix_submission_user_id", table_name="submission")
    op.drop_index("ix_submission_status", table_name="submission")
    op.drop_index("ix_submission_problem_id", table_name="submission")
    op.drop_index("ix_submission_language", table_name="submission")
    op.drop_table("submission")

    op.drop_table("problem")

    op.drop_index("ix_user_username", table_name="user")
    op.drop_table("user")

    op.execute("DROP TYPE IF EXISTS submission_status_enum")
    op.execute("DROP TYPE IF EXISTS problem_difficulty_enum")
    op.execute("DROP TYPE IF EXISTS user_role_enum")
