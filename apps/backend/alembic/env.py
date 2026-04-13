from logging.config import fileConfig
from sqlalchemy import pool
from sqlmodel import SQLModel, create_engine

from alembic import context

from app.core.config import settings
import app.models  # noqa: F401


def _sqlalchemy_database_uri(raw_uri: str) -> str:
    """Convert DATABASE_URI to an SQLAlchemy-compatible driver URL."""
    if raw_uri.startswith("postgresql://"):
        return raw_uri.replace("postgresql://", "postgresql+psycopg://", 1)
    return raw_uri


# Alembic config object, populated from alembic.ini.
config = context.config

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Register all model metadata for autogenerate.
target_metadata = SQLModel.metadata

config.set_main_option(
    "sqlalchemy.url", _sqlalchemy_database_uri(settings.database_uri)
)


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    url = config.get_main_option("sqlalchemy.url")

    # Fail early with a clear environment-variable reference.
    if not url:
        raise ValueError(
            "sqlalchemy.url not configured. "
            "Ensure DATABASE_URI is set in .env.local and _sqlalchemy_database_uri() "
            "has called config.set_main_option() before run_migrations_online()."
        )

    connectable = create_engine(url, poolclass=pool.NullPool)

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
