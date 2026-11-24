from collections.abc import Callable
from typing import Annotated
from uuid import UUID

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session

from app.core.database import get_session
from app.core.supabase_client import supabase_user
from app.exceptions import HTTPException
from app.models.enums import UserRole
from app.models.user import User
from app.schemas.auth_schema import AuthenticatedUser

# OAuth2 scheme for handling token-based authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_authenticated_user_id(
    token: Annotated[str, Depends(oauth2_scheme)],
) -> UUID:
    """
    Validate the access token with Supabase Auth and return its user ID.

    Args:
        token (str): The OAuth2 token provided in the request.

    Returns:
        UUID: The authenticated Supabase user's ID.
    Raises:
        HTTPException: If the token is invalid or expired.
    """
    user = await supabase_user(token)
    if not user or not user.id:
        raise HTTPException(
            status=401,
            message="Unauthorized: Invalid or expired token",
            code="INVALID_TOKEN",
        )

    return UUID(user.id)


def get_current_user(
    user_id: Annotated[UUID, Depends(get_authenticated_user_id)],
    session: Annotated[Session, Depends(get_session)],
) -> AuthenticatedUser:
    """Load the authenticated user's current application profile from public.users."""
    user = session.get(User, user_id)
    if user is None:
        raise HTTPException(
            status=403,
            message="Forbidden: User profile not found",
            code="USER_PROFILE_NOT_FOUND",
        )

    return AuthenticatedUser.model_validate(user)


def require_role(*roles: UserRole) -> Callable[..., AuthenticatedUser]:
    """
    Return a dependency that requires the authenticated user to have one of
    the given roles.
    """

    def dependency(user: Annotated[AuthenticatedUser, Depends(get_current_user)]) -> AuthenticatedUser:
        if user.role not in roles:
            raise HTTPException(
                status=403,
                message="Forbidden: Insufficient permissions",
                code="INSUFFICIENT_PERMISSIONS",
            )

        return user

    return dependency
