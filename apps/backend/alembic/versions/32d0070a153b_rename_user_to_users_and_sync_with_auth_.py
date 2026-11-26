"""rename user to users and sync with auth.users table with a trigger

Revision ID: 32d0070a153b
Revises: 60d9fc2927ee
Create Date: 2026-11-23 17:10:04.156655

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '32d0070a153b'
down_revision: Union[str, Sequence[str], None] = '60d9fc2927ee'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # 1. Add 'user' value to existing user_role_enum
    with op.get_context().autocommit_block():
        op.execute("ALTER TYPE user_role_enum ADD VALUE IF NOT EXISTS 'user';")

    # 2. Rename table 'user' -> 'users' and update indexes/constraints
    op.rename_table("user", "users")
    op.execute("ALTER INDEX IF EXISTS ix_user_username RENAME TO ix_users_username;")
    op.execute("ALTER INDEX IF EXISTS ix_user_email RENAME TO ix_users_email;")
    op.create_unique_constraint("uq_users_username", "users", ["username"])

    # 3. Update default role to 'user'
    op.execute("ALTER TABLE public.users ALTER COLUMN role SET DEFAULT 'user'::user_role_enum;")

    # 4. Backfill any existing auth.users into public.users and clean up orphaned test rows
    op.execute("""
        DELETE FROM public.users
        WHERE id NOT IN (SELECT id FROM auth.users);
    """)
    op.execute("""
        INSERT INTO public.users (id, email, username)
        SELECT
            au.id,
            au.email,
            COALESCE(
                NULLIF(trim(au.raw_user_meta_data ->> 'username'), ''),
                NULLIF(trim(au.raw_user_meta_data ->> 'name'), ''),
                split_part(au.email, '@', 1)
            ) || '_' || substr(au.id::text, 1, 6)
        FROM auth.users au
        WHERE NOT EXISTS (
            SELECT 1 FROM public.users pu WHERE pu.id = au.id
        );
    """)

    # 5. Link public.users.id -> auth.users.id (deletes public.users row when auth.users is deleted)
    op.create_foreign_key(
        "fk_users_auth_users_id",
        "users",
        "users",
        ["id"],
        ["id"],
        source_schema="public",
        referent_schema="auth",
        ondelete="CASCADE",
    )

    # 6. Point submission.user_id foreign key to public.users
    op.drop_constraint("submission_user_id_fkey", "submission", type_="foreignkey")
    op.create_foreign_key(
        "submission_user_id_fkey",
        "submission",
        "users",
        ["user_id"],
        ["id"],
    )

    # 7. Trigger: auto-insert new signups from auth.users -> public.users
    op.execute("""
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS trigger
        LANGUAGE plpgsql
        SECURITY DEFINER SET search_path = public
        AS $$
        DECLARE
            base_username text;
        BEGIN
            base_username := COALESCE(
                NULLIF(trim(NEW.raw_user_meta_data ->> 'username'), ''),
                NULLIF(trim(NEW.raw_user_meta_data ->> 'name'), ''),
                NULLIF(split_part(COALESCE(NEW.email, ''), '@', 1), ''),
                'user'
            );

            INSERT INTO public.users (id, email, username)
            VALUES (
                NEW.id,
                NEW.email,
                base_username || '_' || substr(NEW.id::text, 1, 6)
            );

            RETURN NEW;
        END;
        $$;
    """)

    op.execute("""
        CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW
        EXECUTE FUNCTION public.handle_new_user();
    """)

    # 8. Trigger: deleting a row in public.users also deletes the user from auth.users
    op.execute("""
        CREATE OR REPLACE FUNCTION public.handle_user_deleted()
        RETURNS trigger
        LANGUAGE plpgsql
        SECURITY DEFINER SET search_path = auth, public
        AS $$
        BEGIN
            DELETE FROM auth.users WHERE id = OLD.id;
            RETURN OLD;
        END;
        $$;
    """)

    op.execute("""
        CREATE TRIGGER on_public_user_deleted
        AFTER DELETE ON public.users
        FOR EACH ROW
        EXECUTE FUNCTION public.handle_user_deleted();
    """)


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("DROP TRIGGER IF EXISTS on_public_user_deleted ON public.users;")
    op.execute("DROP FUNCTION IF EXISTS public.handle_user_deleted();")
    op.execute("DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;")
    op.execute("DROP FUNCTION IF EXISTS public.handle_new_user();")

    op.drop_constraint("submission_user_id_fkey", "submission", type_="foreignkey")
    op.create_foreign_key(
        "submission_user_id_fkey",
        "submission",
        "user",
        ["user_id"],
        ["id"],
    )

    op.drop_constraint("fk_users_auth_users_id", "users", schema="public", type_="foreignkey")
    op.execute("ALTER TABLE public.users ALTER COLUMN role SET DEFAULT 'student'::user_role_enum;")

    op.drop_constraint("uq_users_username", "users", type_="unique")
    op.execute("ALTER INDEX IF EXISTS ix_users_email RENAME TO ix_user_email;")
    op.execute("ALTER INDEX IF EXISTS ix_users_username RENAME TO ix_user_username;")
    op.rename_table("users", "user")