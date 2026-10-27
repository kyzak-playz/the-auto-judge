import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.exceptions import (
    HTTPException as FastAPIHTTPException,
    RequestValidationError,
)

# routers must be imported after settings to ensure configuration is loaded before any API calls are made
from app.api.v1.auth import router as auth_router
from app.api.v1.problems import router as problems_router
from app.core.config import settings
from app.core.database import check_database_connection
from app.exceptions import (
    HTTPException,
    fastapi_http_exception_handler,
    http_exception_handler,
    validation_exception_handler,
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI):
    settings.validate_runtime_requirements()

    try:
        check_database_connection()

    except Exception as exc:
        message = "Database connectivity check failed during startup."
        if settings.app_env.lower() in {"development", "dev", "local"}:
            logger.warning("%s %s", message, exc)
            yield
            return
        raise RuntimeError(message) from exc

    yield


app = FastAPI(title="The Auto Judge Backend", lifespan=lifespan)


# Exception Handlers
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(FastAPIHTTPException, fastapi_http_exception_handler)  # Handle FastAPI's built-in HTTP exceptions with our custom handler
app.add_exception_handler(RequestValidationError, validation_exception_handler)
# Routers
app.include_router(auth_router, prefix="/api/v1/auth")
app.include_router(problems_router, prefix="/api/v1/problems")
