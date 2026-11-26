from fastapi import APIRouter

from .get_submission import router as get_submission_router
from .submit import router as submit_router

router = APIRouter()
router.include_router(get_submission_router)
router.include_router(submit_router)

__all__ = ["router"]
