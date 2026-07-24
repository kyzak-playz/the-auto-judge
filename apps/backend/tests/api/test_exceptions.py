import asyncio
import json

from fastapi.exceptions import HTTPException as FastAPIHTTPException
from fastapi.testclient import TestClient
from starlette.requests import Request

from app import main
from app.exceptions import (
    HTTPException,
    fastapi_http_exception_handler,
    http_exception_handler,
    validation_exception_handler,
)


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


def test_custom_http_exception_stores_status_message_and_code() -> None:
    exc = HTTPException(status=418, message="teapot", code="I_AM_A_TEAPOT")

    assert exc.status == 418
    assert exc.message == "teapot"
    assert exc.code == "I_AM_A_TEAPOT"


def test_custom_http_exception_handler_returns_expected_json() -> None:
    response = asyncio.run(
        http_exception_handler(
            _make_request(),
            HTTPException(status=409, message="conflict", code="CONFLICT"),
        )
    )

    assert response.status_code == 409
    assert json.loads(response.body) == {"message": "conflict", "code": "CONFLICT"}


def test_fastapi_http_exception_handler_returns_expected_json() -> None:
    response = asyncio.run(
        fastapi_http_exception_handler(
            _make_request(),
            FastAPIHTTPException(status_code=404, detail="Not found"),
        )
    )

    assert response.status_code == 404
    assert json.loads(response.body) == {
        "message": "Not found",
        "code": "FASTAPI_HTTP_ERROR",
    }


def test_validation_exception_handler_returns_expected_json() -> None:
    with TestClient(main.app) as client:
        response = client.post("/api/v1/auth/login", json={})

    assert response.status_code == 422
    assert response.json() == {
        "message": "Validation Error",
        "code": "VALIDATION_ERROR",
    }
