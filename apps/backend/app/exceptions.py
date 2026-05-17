from typing import cast
from starlette.requests import Request
from starlette.responses import JSONResponse
from fastapi.exceptions import HTTPException as FastAPIHTTPException, RequestValidationError

# FastAPI's HTTPException alternative to provide more structured error responses and better control over the error handling process across the application, especially for authentication-related errors.
class HTTPException(Exception):
    def __init__(self, status: int, message: str, code: str = "SERVER_ERROR"):
        self.status = status
        self.message = message
        self.code = code

async def http_exception_handler(_: Request, exc: Exception):
    exc = cast(HTTPException, exc)
    return JSONResponse(
        status_code=exc.status,
        content={"message": exc.message, "code": exc.code},
    )

async def fastapi_http_exception_handler(_: Request, exc: Exception):
    exc = cast(FastAPIHTTPException, exc)
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": str(exc.detail), "code": "FASTAPI_HTTP_ERROR"},
    )

async def validation_exception_handler(_: Request, exc: Exception):
    exc = cast(RequestValidationError, exc)
    return JSONResponse(
        status_code=422,
        content={"message": "Validation Error", "code": "VALIDATION_ERROR"},
    )