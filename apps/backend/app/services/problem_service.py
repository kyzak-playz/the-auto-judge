from app.repository.problem_repository import ProblemRepository as problem_repository
from app.schemas.problem_service_schemas import ProblemFilterSchema, ProblemListSchema
from app.schemas.auth_schema import SupabaseUser
from app.models.enums import UserRole
from sqlmodel import Session
from uuid import UUID

from app.exceptions import HTTPException

from app.models.problem import Problem

class ProblemsService:
    """"
    Service class for managing problems in the application.
    This class provides methods to create, retrieve, update, and delete problems,
    while also enforcing user role-based access control.
    """
    def __init__(self, user: SupabaseUser, session: Session):
        self.user = user
        self.session = session
        self.problem_repository = problem_repository(user, session)
    
    def get_all_problems(self, filters: ProblemFilterSchema | None = None) -> list[ProblemListSchema]:
        """
        Retrieve all problems from the database based on the provided filters.
        """
        problems = self.problem_repository.get_all(filters)
        if problems is None or len(problems) == 0:
            raise HTTPException(
                status=404,
                message="No problems found.",
                code="PROBLEMS_NOT_FOUND"
            )
        return problems

    def get_one_problem(self, problem_id: UUID) -> Problem | HTTPException:
        """
        Retrieve a single problem by its ID.
        """
        problem = self.problem_repository.get_by_id(problem_id)
        if problem is None:
            raise HTTPException(
                status=404,
                message=f"Problem with ID {problem_id} not found.",
                code="PROBLEM_NOT_FOUND"
            )
        return problem
    
    def create_problem(self, problem_data) -> bool:
        """
        Create a new problem in the database. (Admin only)
        """

        # check if the user is an admin before creating a problem
        if self.user.role != UserRole.ADMIN:
            HTTPException(
                status=403,
                message="Only admins can create problems.",
                code="FORBIDDEN"
            )
        is_created = self.problem_repository.create(problem_data)
        if not is_created:
            raise HTTPException(
                status=500,
                message="Failed to create the problem.",
                code="PROBLEM_CREATION_FAILED"
            )
        return True

    def update_problem(self, problem_id, problem_data) -> bool:
        """
        Update an existing problem by its ID. (Admin only)
        """
        if self.user.role != UserRole.ADMIN:
            raise HTTPException(
                status=403,
                message="Only admins can update problems.",
                code="FORBIDDEN"
            )
        
        is_updated = self.problem_repository.update(problem_id, problem_data)
        if not is_updated:
            raise HTTPException(
                status=500,
                message="Failed to update the problem.",
                code="PROBLEM_UPDATE_FAILED"
            )
        return True

    def delete_problem(self, problem_id) -> bool:
        """
        Delete a problem by its ID. (Admin only)
        """
        if self.user.role != UserRole.ADMIN:
            raise HTTPException(
                status=403,
                message="Only admins can delete problems.",
                code="FORBIDDEN"
            )
        is_deleted = self.problem_repository.delete_by_id(problem_id)
        if not is_deleted:
            raise HTTPException(
                status=500,
                message="Failed to delete the problem.",
                code="PROBLEM_DELETION_FAILED"
            )
        return True
    