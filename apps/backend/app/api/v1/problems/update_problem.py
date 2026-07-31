from typing import Annotated
from fastapi import APIRouter, Depends, status, Path, Body
from app.core.deps import get_current_user
from app.exceptions import HTTPException
from app.services.problem_service import ProblemsService
from app.schemas.problem_service_schemas import ProblemListSchema, ProblemUpdateSchema
from app.core.database import get_session
from app.schemas.auth_schema import SupabaseUser
from uuid import UUID



router = APIRouter()

@router.patch("/{problem_id}", tags=["Problems"], status_code=status.HTTP_200_OK, response_model=ProblemListSchema)
def update_problem(user: Annotated[SupabaseUser, Depends(get_current_user)], problem_id: Annotated[UUID, Path(...)], problem_data: Annotated[ProblemUpdateSchema, Body(...)], session = Depends(get_session)):
    """
    Update an existing problem.

    Args:
        user (SupabaseUser): The current authenticated user.
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
            code="PROBLEM_UPDATE_ERROR"
        )