from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.core.database import get_session
from app.core.deps import get_current_user
from app.exceptions import HTTPException
from app.schemas.auth_schema import SupabaseUser
from app.schemas.problem_service_schemas import ProblemFilterSchema, ProblemListSchema
from app.services.problem_service import ProblemsService

router = APIRouter()


@router.get("/", tags=["Problems"], status_code=200, response_model=list[ProblemListSchema])
def get_all_problems(
    user: Annotated[SupabaseUser, Depends(get_current_user)],
    filters: Annotated[ProblemFilterSchema, Query()],
    session: Annotated[Session, Depends(get_session)],
):
    """
    Get all problems with optional filters.

    Args:
        user (SupabaseUser): The current authenticated user.
        filters (ProblemFilterSchema): Optional filters for querying problems.

    Returns:
        List of problems matching the filters.

    Raises:
        HTTPException: If there is an error retrieving problems.
    """
    try:
        # Initialize the ProblemsService with the current user and database session
        problems_service = ProblemsService(user=user, session=session)

        # Retrieve all problems using the service
        problems = problems_service.get_all_problems(filters)
        return problems
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status=500,
            message=f"An error occurred while retrieving problems: {str(e)}",
            code="PROBLEMS_RETRIEVAL_ERROR",
        ) from e
