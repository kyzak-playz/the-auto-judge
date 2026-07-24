from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest
from fastapi.testclient import TestClient

from app import main
from app.api.v1.auth import login as login_module
from app.api.v1.auth import logout as logout_module
from app.core.supabase_client import create_supabase_client


class FakeAuthApiError(Exception):
    def __init__(self, status: int, message: str, code: str = "AUTH_ERROR") -> None:
        super().__init__(message)
        self.status = status
        self.message = message
        self.code = code


def _make_session(
    access_token: str = "access", refresh_token: str = "refresh", expires_in: int = 180
):
    return SimpleNamespace(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=expires_in,
    )


def _make_supabase_client(**auth_method_returns):
    auth = SimpleNamespace(
        sign_in_with_password=AsyncMock(
            return_value=auth_method_returns.get("sign_in_with_password")
        ),
        sign_up=AsyncMock(return_value=auth_method_returns.get("sign_up")),
        refresh_session=AsyncMock(
            return_value=auth_method_returns.get("refresh_session")
        ),
        set_session=AsyncMock(return_value=auth_method_returns.get("set_session")),
        sign_out=AsyncMock(return_value=None),
    )
    return SimpleNamespace(auth=auth)


@pytest.fixture(autouse=True)
def _clear_dependency_overrides():
    main.app.dependency_overrides.clear()
    yield
    main.app.dependency_overrides.clear()


def test_login_returns_tokens(monkeypatch: pytest.MonkeyPatch) -> None:
    supabase = _make_supabase_client(
        sign_in_with_password=SimpleNamespace(session=_make_session()),
    )
    main.app.dependency_overrides[create_supabase_client] = lambda: supabase

    with TestClient(main.app) as client:
        response = client.post(
            "/api/v1/auth/login",
            json={"email": "user@example.com", "password": "secret"},
        )

    assert response.status_code == 200
    assert response.json() == {
        "access_token": "access",
        "refresh_token": "refresh",
        "expires_in": 180,
    }


def test_login_converts_supabase_auth_error(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(login_module, "AuthApiError", FakeAuthApiError)
    supabase = _make_supabase_client()
    supabase.auth.sign_in_with_password.side_effect = FakeAuthApiError(
        401, "Invalid credentials", "INVALID"
    )
    main.app.dependency_overrides[create_supabase_client] = lambda: supabase

    with TestClient(main.app) as client:
        response = client.post(
            "/api/v1/auth/login",
            json={"email": "user@example.com", "password": "bad"},
        )

    assert response.status_code == 401
    assert response.json() == {"message": "Invalid credentials", "code": "INVALID"}


def test_signup_returns_created_session(monkeypatch: pytest.MonkeyPatch) -> None:
    supabase = _make_supabase_client(
        sign_up=SimpleNamespace(
            session=_make_session(
                access_token="signup-access",
                refresh_token="signup-refresh",
                expires_in=60,
            )
        ),
    )
    main.app.dependency_overrides[create_supabase_client] = lambda: supabase

    with TestClient(main.app) as client:
        response = client.post(
            "/api/v1/auth/signup",
            json={"email": "user@example.com", "password": "secret"},
        )

    assert response.status_code == 201
    assert response.json() == {
        "access_token": "signup-access",
        "refresh_token": "signup-refresh",
        "expires_in": 60,
    }


def test_signup_raises_when_session_is_missing(monkeypatch: pytest.MonkeyPatch) -> None:
    supabase = _make_supabase_client(sign_up=SimpleNamespace(session=None))
    main.app.dependency_overrides[create_supabase_client] = lambda: supabase

    with TestClient(main.app) as client:
        response = client.post(
            "/api/v1/auth/signup",
            json={"email": "user@example.com", "password": "secret"},
        )

    assert response.status_code == 400
    assert response.json() == {
        "message": "Signup created but no active session.",
        "code": "BAD_REQUEST",
    }


def test_refresh_returns_new_session(monkeypatch: pytest.MonkeyPatch) -> None:
    supabase = _make_supabase_client(
        refresh_session=SimpleNamespace(
            session=_make_session(
                access_token="new-access", refresh_token="new-refresh", expires_in=90
            )
        ),
    )
    main.app.dependency_overrides[create_supabase_client] = lambda: supabase

    with TestClient(main.app) as client:
        response = client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": "refresh-token"},
        )

    assert response.status_code == 200
    assert response.json() == {
        "access_token": "new-access",
        "refresh_token": "new-refresh",
        "expires_in": 90,
    }


def test_refresh_rejects_missing_session(monkeypatch: pytest.MonkeyPatch) -> None:
    supabase = _make_supabase_client(refresh_session=SimpleNamespace(session=None))
    main.app.dependency_overrides[create_supabase_client] = lambda: supabase

    with TestClient(main.app) as client:
        response = client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": "refresh-token"},
        )

    assert response.status_code == 401
    assert response.json() == {
        "message": "Invalid refresh token.",
        "code": "INVALID_REFRESH_TOKEN",
    }


def test_logout_signs_out_and_returns_accepted(monkeypatch: pytest.MonkeyPatch) -> None:
    supabase = _make_supabase_client(
        set_session=SimpleNamespace(user=SimpleNamespace(id="user-1"))
    )
    monkeypatch.setattr(
        logout_module, "create_supabase_client", AsyncMock(return_value=supabase)
    )

    with TestClient(main.app) as client:
        response = client.post(
            "/api/v1/auth/logout",
            headers={"Access-Token": "Bearer access-token"},
            json={"refresh_token": "refresh-token"},
        )

    assert response.status_code == 202
    assert response.json() == {"message": "Logout successful"}
    supabase.auth.set_session.assert_awaited_once_with(
        access_token="access-token",
        refresh_token="refresh-token",
    )
    supabase.auth.sign_out.assert_awaited_once_with({"scope": "local"})


def test_logout_converts_supabase_auth_error(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(logout_module, "AuthApiError", FakeAuthApiError)
    supabase = _make_supabase_client()
    supabase.auth.set_session.side_effect = FakeAuthApiError(
        403, "Forbidden", "FORBIDDEN"
    )
    monkeypatch.setattr(
        logout_module, "create_supabase_client", AsyncMock(return_value=supabase)
    )

    with TestClient(main.app) as client:
        response = client.post(
            "/api/v1/auth/logout",
            headers={"Access-Token": "Bearer access-token"},
            json={"refresh_token": "refresh-token"},
        )

    assert response.status_code == 403
    assert response.json() == {"message": "Forbidden", "code": "FORBIDDEN"}
