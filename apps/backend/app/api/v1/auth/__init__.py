"""
Authentication API endpoints for handling user authentication tasks.
"""

from fastapi import APIRouter

# Importing routers for authentication endpoints
from .signup import router as signup_router
from .login import router as login_router
from .logout import router as logout_router
from .refresh import router as refresh_router

router = APIRouter()

# Include the authentication routers in the main router
router.include_router(signup_router)
router.include_router(login_router)
router.include_router(logout_router)
router.include_router(refresh_router)

# Define __all__ for explicit exports when using 'from auth import *'
__all__ = ["router"]