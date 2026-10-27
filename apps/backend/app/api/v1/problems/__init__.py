"""
Problems API Router
"""

from fastapi import APIRouter

from .create_problem import router as create_problem_router
from .delete_problem import router as delete_problem_router

# Importing routers for authentication endpoints
from .get_all_problems import router as get_all_problems_router
from .get_problem_by_id import router as get_problem_by_id_router
from .update_problem import router as update_problem_router

router = APIRouter()

# Include the authentication routers in the main router
router.include_router(get_all_problems_router)
router.include_router(get_problem_by_id_router)
router.include_router(create_problem_router)
router.include_router(delete_problem_router)
router.include_router(update_problem_router)

# Define __all__ for explicit exports when using 'from auth import *'
__all__ = ["router"]
