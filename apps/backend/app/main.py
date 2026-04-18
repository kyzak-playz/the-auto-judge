import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from .api.v1.auth.sigin import router as signin_router
from .api.v1.tasks import router as tasks_router
from .core.config import settings
from .core.database import check_database_connection


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
app.include_router(signin_router)
app.include_router(tasks_router)
