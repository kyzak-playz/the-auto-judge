from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Body, Depends, Path, status
from sqlmodel import Session

from app.core.database import get_session
from app.core.deps import require_role
from app.exceptions import HTTPException
from app.models.enums import UserRole
from app.schemas.auth_schema import AuthenticatedUser
from app.schemas.problem_service_schemas import ProblemListSchema, ProblemUpdateSchema
from app.services.problem_service import ProblemsService

router = APIRouter()


@router.patch(
    "/{problem_id}",
    tags=["Problems"],
    status_code=status.HTTP_200_OK,
    response_model=ProblemListSchema,
)
def update_problem(
    user: Annotated[AuthenticatedUser, Depends(require_role(UserRole.ADMIN))],
    problem_id: Annotated[UUID, Path(...)],
    problem_data: Annotated[ProblemUpdateSchema, Body(...)],
    session: Annotated[Session, Depends(get_session)],
):
    """
    Update an existing problem.

    Args:
        user (AuthenticatedUser): The current authenticated user.
        problem_id (UUID): The ID of the problem to update.
        problem_data (ProblemUpdateSchema): The updated data for the problem.

    Returns:
        The updated problem.

    Raises:
        HTTPException: If there is an error updating the problem.
    """
    try:
        # Initialize the ProblemsService with the current user and database session
        problems_service = ProblemsService(user=user, session=session)

        # Update the problem using the service
        updated_problem = problems_service.update_problem(problem_id, problem_data)
        return updated_problem
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            message=f"An error occurred while updating the problem: {str(e)}",
            code="PROBLEM_UPDATE_ERROR",
        ) from e
