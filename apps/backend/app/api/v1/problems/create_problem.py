from typing import Annotated

from fastapi import APIRouter, Body, Depends, status
from sqlmodel import Session

from app.core.database import get_session
from app.core.deps import require_role
from app.exceptions import HTTPException
from app.models.enums import UserRole
from app.schemas.auth_schema import AuthenticatedUser
from app.schemas.problem_service_schemas import ProblemCreateSchema, ProblemListSchema
from app.services.problem_service import ProblemsService

router = APIRouter()


@router.post(
    "/",
    tags=["Problems"],
    status_code=status.HTTP_201_CREATED,
    response_model=ProblemListSchema,
)
def create_problem(
    user: Annotated[AuthenticatedUser, Depends(require_role(UserRole.ADMIN))],
    problem_data: Annotated[ProblemCreateSchema, Body(...)],
    session: Annotated[Session, Depends(get_session)],
):
    """
    Create a new problem.

    Args:
        user (AuthenticatedUser): The current authenticated user.
        problem_data (ProblemCreateSchema): The data for the new problem.

    Returns:
        The created problem.

    Raises:
        HTTPException: If there is an error creating the problem.
    """
    try:
        # Initialize the ProblemsService with the current user and database session
        problems_service = ProblemsService(user=user, session=session)

        # Create the problem using the service
        problem = problems_service.create_problem(problem_data)
        return problem
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status=500,
            message=f"An error occurred while creating the problem: {str(e)}",
            code="PROBLEM_CREATION_ERROR",
        ) from e
