from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Path, status
from sqlmodel import Session

from app.core.database import get_session
from app.core.deps import require_role
from app.exceptions import HTTPException
from app.models.enums import UserRole
from app.schemas.auth_schema import AuthenticatedUser
from app.services.problem_service import ProblemsService

router = APIRouter()


@router.delete("/{problem_id}", tags=["Problems"], status_code=status.HTTP_202_ACCEPTED)
def delete_problem(
    user: Annotated[AuthenticatedUser, Depends(require_role(UserRole.ADMIN))],
    problem_id: Annotated[UUID, Path(...)],
    session: Annotated[Session, Depends(get_session)],
):
    """
    Delete an existing problem.

    Args:
        user (AuthenticatedUser): The current authenticated user.
        problem_id (UUID): The ID of the problem to delete.

    Returns:
        True if the problem was deleted, False otherwise.

    Raises:
        HTTPException: If there is an error deleting the problem.
    """
    try:
        # Initialize the ProblemsService with the current user and database session
        problems_service = ProblemsService(user=user, session=session)

        # Delete the problem using the service
        deleted = problems_service.delete_problem(problem_id)
        return deleted
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            message=f"An error occurred while deleting the problem: {str(e)}",
            code="PROBLEM_DELETION_ERROR",
        ) from e
