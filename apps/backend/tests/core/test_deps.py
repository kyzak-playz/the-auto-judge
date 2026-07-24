from types import SimpleNamespace

import pytest
from starlette.requests import Request

from app.core.deps import require_role
from app.exceptions import HTTPException
from app.models.enums import UserRole


def _make_request() -> Request:
    return Request(
        {
            "type": "http",
            "method": "GET",
            "path": "/",
            "headers": [],
            "query_string": b"",
            "client": ("testclient", 0),
            "server": ("testserver", 80),
            "scheme": "http",
            "http_version": "1.1",
            "root_path": "",
        }
    )


def test_require_role_raises_when_user_missing() -> None:
    request = _make_request()

    with pytest.raises(HTTPException) as exc_info:
        require_role("admin")(request)

    assert exc_info.value.status == 401
    assert exc_info.value.code == "USER_NOT_FOUND"


def test_require_role_raises_when_role_mismatch() -> None:
    request = _make_request()
    request.state.user = SimpleNamespace(role=UserRole.STUDENT)

    with pytest.raises(HTTPException) as exc_info:
        require_role("admin")(request)

    assert exc_info.value.status == 403
    assert exc_info.value.code == "INSUFFICIENT_PERMISSIONS"


@pytest.mark.parametrize(
    "user",
    [
        SimpleNamespace(role=UserRole.ADMIN),
        {"role": UserRole.ADMIN},
        {"role": "admin"},
    ],
)
def test_require_role_returns_user_for_matching_role(user) -> None:
    request = _make_request()
    request.state.user = user

    assert require_role("admin")(request) is user
