from sqlalchemy.engine import Engine
from collections.abc import Generator
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


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session


def create_db_and_tables() -> None:
    SQLModel.metadata.create_all(engine)
