from collections.abc import Callable

from fastapi import Request

from app.exceptions import HTTPException


def require_role(role: str) -> Callable[[Request], object]:
    """
    Return a FastAPI dependency that requires the authenticated user to have
    the given role.

    The authentication middleware is expected to place the trusted user object
    on ``request.state.user`` after validating the session.
    """

    def dependency(request: Request):
        user = getattr(request.state, "user", None)

        if not user:
            raise HTTPException(
                status=401,
                message="Unauthorized: User information not found",
                code="USER_NOT_FOUND",
            )

        current_role = getattr(user, "role", None)
        if current_role is None and isinstance(user, dict):
            current_role = user.get("role")

        current_role = getattr(current_role, "value", current_role)

        if current_role != role:
            raise HTTPException(
                status=403,
                message="Forbidden: Insufficient permissions",
                code="INSUFFICIENT_PERMISSIONS",
            )

        return user

    return dependency
