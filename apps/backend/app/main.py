import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.core.config import settings
from app.core.database import check_database_connection

# routers must be imported after settings to ensure configuration is loaded before any API calls are made
from app.api.v1.auth import router as auth_router

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
app.include_router(auth_router, prefix="/api/v1/auth")
