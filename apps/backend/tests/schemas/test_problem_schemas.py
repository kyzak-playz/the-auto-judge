from uuid import uuid4

import pytest
from pydantic import ValidationError

from app.models.enums import ProblemDifficulty
from app.models.problem import Problem
from app.schemas.problem_service_schemas import (
    ProblemCreateSchema,
    ProblemDetailSchema,
    ProblemUpdateSchema,
)


TEST_CASE = {
    "inputs": [['"1 + 1"']],
    "fn_name": "calculate",
    "outputs": [2],
}


def test_problem_create_and_update_schemas_match_stored_test_case_shape() -> None:
    create_payload = ProblemCreateSchema(
        title="Calculator",
        description="Evaluate an expression.",
        difficulty=ProblemDifficulty.EASY,
        test_case=TEST_CASE,
    )
    problem = Problem.model_validate(create_payload.model_dump())
    update_payload = ProblemUpdateSchema(test_case=TEST_CASE)

    assert problem.test_case == TEST_CASE
    assert update_payload.model_dump(exclude_unset=True) == {
        "test_case": TEST_CASE,
    }


def test_problem_model_default_uses_test_case_contract() -> None:
    problem = Problem(title="Calculator")

    assert problem.test_case == {
        "inputs": [],
        "fn_name": "",
        "outputs": [],
    }


def test_problem_detail_schema_includes_persisted_test_case() -> None:
    detail_payload = {
        "id": uuid4(),
        "title": "Calculator",
        "description": "Evaluate an expression.",
        "difficulty": ProblemDifficulty.EASY,
        "test_case": TEST_CASE,
        "created_at": "2026-01-01T00:00:00Z",
        "updated_at": "2026-01-02T00:00:00Z",
    }

    detail = ProblemDetailSchema.model_validate(detail_payload)

    assert detail.test_case == TEST_CASE


def test_problem_update_allows_omitted_fields_but_rejects_null_values() -> None:
    assert ProblemUpdateSchema().model_dump(exclude_unset=True) == {}

    with pytest.raises(ValidationError):
        ProblemUpdateSchema(title=None)
