"""add initial rls policies

Revision ID: bf3f1bab7a24
Revises: 0f1be5216f30
Create Date: 2026-04-13 17:35:06.513068

"""

from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "bf3f1bab7a24"
down_revision: Union[str, Sequence[str], None] = "0f1be5216f30"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("ALTER TABLE problem ENABLE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE submission ENABLE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE result ENABLE ROW LEVEL SECURITY")
    op.execute('ALTER TABLE "user" ENABLE ROW LEVEL SECURITY')

    # Public problems can be read by anon/authenticated clients.
    op.execute(
        """
        CREATE POLICY problem_public_read_policy
        ON problem
        FOR SELECT
        TO anon, authenticated
        USING (true)
        """
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("DROP POLICY IF EXISTS problem_public_read_policy ON problem")

    op.execute('ALTER TABLE "user" DISABLE ROW LEVEL SECURITY')
    op.execute("ALTER TABLE result DISABLE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE submission DISABLE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE problem DISABLE ROW LEVEL SECURITY")
