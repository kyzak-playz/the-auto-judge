"""add_gen_random_uuid_default_to_problem_id

Revision ID: 60d9fc2927ee
Revises: c5aa2779363e
Create Date: 2026-10-17 16:35:36.160467

"""
from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

# revision identifiers, used by Alembic.
revision: str = '60d9fc2927ee'
down_revision: str | Sequence[str] | None = 'c5aa2779363e'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""

    op.alter_column(
        "problem",
        "id",
        existing_type=postgresql.UUID(as_uuid=True),
        server_default=sa.text("gen_random_uuid()"),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column(
        "problem",
        "id",
        existing_type=postgresql.UUID(as_uuid=True),
        server_default=None,
    )
