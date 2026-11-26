from uuid import uuid4

import pytest

from app.core.deps import get_current_user, require_role
from app.exceptions import HTTPException
from app.models.enums import UserRole
from app.schemas.auth_schema import AuthenticatedUser


def test_get_current_user_rejects_missing_profile() -> None:
    session = type("SessionStub", (), {"get": lambda *_: None})()

    with pytest.raises(HTTPException) as exc_info:
        get_current_user(uuid4(), session)

    assert exc_info.value.status == 403
    assert exc_info.value.code == "USER_PROFILE_NOT_FOUND"


def test_require_role_raises_when_role_mismatch() -> None:
    user = AuthenticatedUser(
        id=uuid4(),
        username="student",
        email="student@example.com",
        role=UserRole.STUDENT,
    )

    with pytest.raises(HTTPException) as exc_info:
        require_role(UserRole.ADMIN)(user)

    assert exc_info.value.status == 403
    assert exc_info.value.code == "INSUFFICIENT_PERMISSIONS"


def test_require_role_allows_any_matching_role() -> None:
    user = AuthenticatedUser(
        id=uuid4(),
        username="member",
        email="member@example.com",
        role=UserRole.USER,
    )

    assert require_role(UserRole.ADMIN, UserRole.USER)(user) is user
