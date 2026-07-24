from unittest.mock import MagicMock

import pytest
from sqlmodel import Session

from app.core import database


# Verifies PostgreSQL URLs are rewritten to the psycopg SQLAlchemy driver format.
def test_sqlalchemy_database_uri_converts_postgresql_scheme() -> None:
    raw = "postgresql://user:pass@localhost:5432/db"

    converted = database._sqlalchemy_database_uri(raw)

    assert converted == "postgresql+psycopg://user:pass@localhost:5432/db"


# Verifies non-PostgreSQL URLs are left untouched by the converter.
def test_sqlalchemy_database_uri_non_postgresql_unchanged() -> None:
    raw = "sqlite:///tmp/test.db"

    converted = database._sqlalchemy_database_uri(raw)

    assert converted == raw


# Verifies the session generator yields a Session-like object from the context manager.
def test_get_session_yields_session_object(monkeypatch: pytest.MonkeyPatch) -> None:
    session_instance = MagicMock(spec=Session)

    class DummySessionContext:
        def __enter__(self):
            return session_instance

        def __exit__(self, exc_type, exc, tb):
            return False

    monkeypatch.setattr(database, "Session", lambda _: DummySessionContext())

    generator = database.get_session()
    yielded = next(generator)

    assert yielded is session_instance


# Verifies metadata table creation delegates to SQLModel.metadata.create_all with the module engine.
def test_create_db_and_tables_calls_metadata_create_all(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    create_all_mock = MagicMock()
    monkeypatch.setattr(database.SQLModel.metadata, "create_all", create_all_mock)

    database.create_db_and_tables()

    create_all_mock.assert_called_once_with(database.engine)


# Verifies connectivity check runs a lightweight SELECT 1 query using the engine connection.
def test_check_database_connection_executes_select_1(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    execute_mock = MagicMock()

    class DummyConnectionContext:
        def __enter__(self):
            conn = MagicMock()
            conn.execute = execute_mock
            return conn

        def __exit__(self, exc_type, exc, tb):
            return False

    connect_mock = MagicMock(return_value=DummyConnectionContext())
    monkeypatch.setattr(database.engine, "connect", connect_mock)

    database.check_database_connection()

    execute_mock.assert_called_once()
