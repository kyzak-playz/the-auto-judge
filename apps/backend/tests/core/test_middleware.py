import json
import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest
from fastapi import FastAPI, Request
from starlette.responses import JSONResponse

from app.exceptions import HTTPException
from app.middleware import authentication as middleware_module
from app.middleware.authentication import AuthenticationMiddleware


def _make_request(path: str, headers: dict[str, str] | None = None) -> Request:
    raw_headers = []
    for key, value in (headers or {}).items():
        raw_headers.append((key.lower().encode("latin-1"), value.encode("latin-1")))

    return Request(
        {
            "type": "http",
            "method": "GET",
            "path": path,
            "headers": raw_headers,
            "query_string": b"",
            "client": ("testclient", 0),
            "server": ("testserver", 80),
            "scheme": "http",
            "http_version": "1.1",
            "root_path": "",
        }
    )


async def _call_dispatch(
    path: str, headers: dict[str, str] | None = None, call_next=None
):
    app = FastAPI()
    middleware = AuthenticationMiddleware(app)
    request = _make_request(path, headers)

    async def default_call_next(request: Request):
        return JSONResponse({"status": "ok"})

    return await middleware.dispatch(request, call_next or default_call_next)


def test_middleware_skips_unprotected_paths(monkeypatch: pytest.MonkeyPatch) -> None:
    get_current_user_mock = AsyncMock()
    monkeypatch.setattr(middleware_module, "get_current_user", get_current_user_mock)

    response = asyncio.run(_call_dispatch("/public"))

    assert response.status_code == 200
    assert json.loads(response.body) == {"status": "ok"}
    get_current_user_mock.assert_not_awaited()


def test_middleware_rejects_missing_access_token_header() -> None:
    with pytest.raises(HTTPException) as exc_info:
        asyncio.run(_call_dispatch("/api/v1/protected/ping"))

    assert exc_info.value.status == 401
    assert exc_info.value.code == "INVALID_ACCESS_TOKEN_HEADER"


def test_middleware_rejects_malformed_bearer_header() -> None:
    with pytest.raises(HTTPException) as exc_info:
        asyncio.run(
            _call_dispatch(
                "/api/v1/protected/ping",
                headers={"Access-Token": "Token abc"},
            )
        )

    assert exc_info.value.status == 401
    assert exc_info.value.code == "INVALID_ACCESS_TOKEN_HEADER"


def test_middleware_populates_request_state_for_valid_token(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    user = SimpleNamespace(email="student@example.com", role="student")
    monkeypatch.setattr(
        middleware_module, "get_current_user", AsyncMock(return_value=user)
    )

    async def call_next(request: Request):
        return JSONResponse(
            {
                "email": getattr(request.state.user, "email", None),
                "role": getattr(request.state.user, "role", None),
            }
        )

    response = asyncio.run(
        _call_dispatch(
            "/api/v1/protected/ping",
            headers={"Access-Token": "Bearer access-token"},
            call_next=call_next,
        )
    )

    assert response.status_code == 200
    assert json.loads(response.body) == {
        "email": "student@example.com",
        "role": "student",
    }


def test_middleware_rejects_invalid_token(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(
        middleware_module, "get_current_user", AsyncMock(side_effect=Exception("boom"))
    )

    with pytest.raises(HTTPException) as exc_info:
        asyncio.run(
            _call_dispatch(
                "/api/v1/protected/ping",
                headers={"Access-Token": "Bearer access-token"},
            )
        )

    assert exc_info.value.status == 401
    assert exc_info.value.code == "INVALID_TOKEN"
