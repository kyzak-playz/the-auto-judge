from typing import Annotated
from fastapi import APIRouter, Depends, Path
from app.core.deps import get_current_user
from app.exceptions import HTTPException
from app.services.problem_service import ProblemsService
from app.schemas.problem_service_schemas import ProblemDetailSchema
from app.core.database import get_session
from app.schemas.auth_schema import SupabaseUser
from uuid import UUID



router = APIRouter()

@router.get("/{problem_id}", tags=["Problems"], response_model=ProblemDetailSchema)
def get_problem_by_id(user: Annotated[SupabaseUser, Depends(get_current_user)], problem_id: Annotated[UUID, Path(...)], session = Depends(get_session)):
    """
    Get a problem by its ID.

    Args:
        user (SupabaseUser): The current authenticated user.
        problem_id (UUID): The ID of the problem to retrieve.

    Returns:
        The problem with the specified ID.

    Raises:
        HTTPException: If there is an error retrieving problems.
    """
    try:
        # Initialize the ProblemsService with the current user and database session
        problems_service = ProblemsService(user=user, session=session)

        # Retrieve the problem by ID using the service
        problem = problems_service.get_one_problem(problem_id)
        return problem
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status=500,
            message=f"An error occurred while retrieving problems: {str(e)}",
            code="PROBLEMS_RETRIEVAL_ERROR"
        )