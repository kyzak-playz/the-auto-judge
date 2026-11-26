from collections.abc import Generator

from sqlalchemy import text
from sqlalchemy.engine import Engine
from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings


def _sqlalchemy_database_uri(raw_uri: str) -> str:
    if raw_uri.startswith("postgresql://"):
        return raw_uri.replace("postgresql://", "postgresql+psycopg://", 1)
    return raw_uri


def _build_engine() -> Engine:
    return create_engine(
        _sqlalchemy_database_uri(settings.database_uri),
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=15,
        pool_timeout=30,
        pool_recycle=1800,
    )


engine = _build_engine()


def get_session() -> Generator[Session]:
    """
    Dependency function to provide a SQLAlchemy session for database operations.
    This function is used as a dependency in FastAPI routes to ensure that a session is created and closed properly for each request.
    Yields:
        A SQLAlchemy Session object for database operations.

    Notes:
        - The session is created using the SQLModel engine defined in the application.
        - The session is automatically closed after the request is completed, ensuring proper resource management.
    """
    with Session(engine) as session:
        yield session


def create_db_and_tables() -> None:
    """
    Create the database and tables based on the SQLModel metadata.

    Warning:
        This function will create the database and tables if they do not exist.
        It is recommended to use this function only during the initial setup of the application.
    """
    SQLModel.metadata.create_all(engine)


def check_database_connection() -> None:
    """
    Check the database connection by executing a simple query.
    """
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
