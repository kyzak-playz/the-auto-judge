from datetime import datetime, timezone
from types import SimpleNamespace
from uuid import UUID, uuid4

from unittest.mock import MagicMock

from app.models.enums import ProblemDifficulty, UserRole
from app.models.problem import Problem
from app.repository.problem_repository import ProblemRepository
from app.schemas.problem_service_schemas import ProblemFilterSchema, ProblemUpdateSchema


class _ExecResult:
    def __init__(self, rows=None, first=None):
        self._rows = rows or []
        self._first = first

    def all(self):
        return self._rows

    def first(self):
        return self._first


def _make_repository(session=None) -> ProblemRepository:
    return ProblemRepository(
        SimpleNamespace(role=UserRole.ADMIN), session or MagicMock()
    )


def test_create_adds_problem_and_commits() -> None:
    session = MagicMock()
    repository = _make_repository(session)
    problem = Problem(title="Two Sum")

    assert repository.create(problem) is True
    session.add.assert_called_once_with(problem)
    session.commit.assert_called_once()
    session.refresh.assert_called_once_with(problem)


def test_get_all_applies_filters_and_maps_rows() -> None:
    session = MagicMock()
    updated_at = datetime(2026, 1, 1, tzinfo=timezone.utc)
    rows = [
        (uuid4(), "Two Sum", "easy", updated_at),
    ]
    session.exec.return_value = _ExecResult(rows=rows)
    repository = _make_repository(session)
    filters = ProblemFilterSchema(difficulty=ProblemDifficulty.EASY, page=2, limit=7)

    result = repository.get_all(filters)

    query_text = str(session.exec.call_args.args[0]).lower()
    assert "order by" in query_text
    assert "offset" in query_text
    assert "limit" in query_text
    assert "difficulty" in query_text
    assert len(result) == 1
    assert result[0].title == "Two Sum"
    assert result[0].difficulty == "easy"
    assert result[0].updated_at == updated_at


def test_get_by_id_returns_problem_when_found() -> None:
    session = MagicMock()
    problem = Problem(title="Two Sum")
    session.exec.return_value = _ExecResult(first=problem)
    repository = _make_repository(session)
    problem_id = uuid4()

    result = repository.get_by_id(problem_id)

    query_text = str(session.exec.call_args.args[0]).lower()
    assert "where" in query_text
    assert "problem.id" in query_text
    assert result is problem


def test_get_by_id_returns_none_when_missing() -> None:
    session = MagicMock()
    session.exec.return_value = _ExecResult(first=None)
    repository = _make_repository(session)

    assert repository.get_by_id(uuid4()) is None


def test_update_applies_partial_changes() -> None:
    session = MagicMock()
    existing = Problem(title="Old title", description="Old description")
    repository = _make_repository(session)
    repository.get_by_id = MagicMock(return_value=existing)
    update_data = ProblemUpdateSchema(title="Updated title")

    assert repository.update(uuid4(), update_data) is True
    assert existing.title == "Updated title"
    assert existing.description == "Old description"
    session.add.assert_called_once_with(existing)
    session.commit.assert_called_once()
    session.refresh.assert_called_once_with(existing)


def test_update_returns_false_when_problem_missing() -> None:
    repository = _make_repository()
    repository.get_by_id = MagicMock(return_value=None)

    assert (
        repository.update(uuid4(), ProblemUpdateSchema(title="Updated title")) is False
    )


def test_delete_deletes_existing_problem() -> None:
    session = MagicMock()
    existing = Problem(title="Old title")
    repository = _make_repository(session)
    repository.get_by_id = MagicMock(return_value=existing)

    assert repository.delete_by_id(uuid4()) is True
    session.delete.assert_called_once_with(existing)
    session.commit.assert_called_once()


def test_delete_returns_false_when_problem_missing() -> None:
    repository = _make_repository()
    repository.get_by_id = MagicMock(return_value=None)

    assert repository.delete_by_id(uuid4()) is False
