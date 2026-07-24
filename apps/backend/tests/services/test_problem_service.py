from types import SimpleNamespace
from uuid import uuid4

import pytest

from app.models.enums import UserRole
from app.schemas.problem_service_schemas import ProblemListSchema
from app.services import problem_service as service_module


class FakeRepo:
    def __init__(self, user, session):
        self.user = user
        self.session = session
        self.get_all_called_with = None
        self.get_by_id_result = None
        self.create_result = True
        self.update_result = True
        self.delete_result = True

    def get_all(self, filters):
        self.get_all_called_with = filters
        return [
            ProblemListSchema(
                id=uuid4(),
                title="Two Sum",
                difficulty="easy",
                updated_at="2026-01-01T00:00:00Z",
            )
        ]

    def get_by_id(self, problem_id):
        return self.get_by_id_result

    def create(self, problem_data):
        return self.create_result

    def update(self, problem_id, problem_data):
        return self.update_result

    def delete_by_id(self, problem_id):
        return self.delete_result


def test_get_all_problems_returns_repo_result(monkeypatch):
    monkeypatch.setattr(service_module, "problem_repository", FakeRepo)
    user = SimpleNamespace(role=UserRole.ADMIN)
    session = SimpleNamespace()

    service = service_module.ProblemsService(user, session)

    result = service.get_all_problems()

    assert len(result) == 1
    assert result[0].title == "Two Sum"


def test_create_problem_denied_for_non_admin(monkeypatch):
    monkeypatch.setattr(service_module, "problem_repository", FakeRepo)
    user = SimpleNamespace(role=UserRole.STUDENT)
    session = SimpleNamespace()

    service = service_module.ProblemsService(user, session)

    assert service.create_problem({"title": "New Problem"}) is False


def test_create_problem_allowed_for_admin(monkeypatch):
    monkeypatch.setattr(service_module, "problem_repository", FakeRepo)
    user = SimpleNamespace(role=UserRole.ADMIN)
    session = SimpleNamespace()

    service = service_module.ProblemsService(user, session)

    assert service.create_problem({"title": "New Problem"}) is True


def test_get_one_problem_returns_none_when_missing(monkeypatch):
    monkeypatch.setattr(service_module, "problem_repository", FakeRepo)
    user = SimpleNamespace(role=UserRole.ADMIN)
    session = SimpleNamespace()

    service = service_module.ProblemsService(user, session)
    service.problem_repository.get_by_id_result = None

    assert service.get_one_problem(uuid4()) is None
