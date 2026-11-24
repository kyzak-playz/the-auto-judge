from typing import Annotated

from fastapi import APIRouter, Depends

from app.core.deps import get_current_user
from app.schemas.auth_schema import AuthenticatedUser

router = APIRouter()


@router.get("/me", tags=["auth"], response_model=AuthenticatedUser)
def read_current_user(
    user: Annotated[AuthenticatedUser, Depends(get_current_user)],
) -> AuthenticatedUser:
    return user
