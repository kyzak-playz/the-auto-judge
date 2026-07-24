from sqlmodel import Session, select, desc
from app.models.problem import Problem
from app.schemas.problem_service_schemas import ProblemFilterSchema, ProblemUpdateSchema, ProblemListSchema
from uuid import UUID

class ProblemRepository:
    """
    Repository class for managing problems in the database.
    This class provides methods to create, retrieve, update, and delete problems.
    """
    def __init__(self, user, session: Session):
        self.user = user
        self.session = session
    
    def create(self, problem_data: Problem) -> bool:
        """
        Create a new problem in the database.
        """

        self.session.add(problem_data)
        self.session.commit()
        self.session.refresh(problem_data)
        return True

    def get_all(self, filters: ProblemFilterSchema | None = None) -> list[ProblemListSchema]:
        """
        Retrieve all problems from the database based on the provided filters.
        """

        filters = filters or ProblemFilterSchema() # Use default filters if none are provided

        # Calculate the offset for pagination
        offset = (filters.page - 1) * filters.limit

        # Build the query to retrieve problems with optional filtering by difficulty
        query = (
            select(
                Problem.id,
                Problem.title,
                Problem.difficulty,
                Problem.updated_at
                )
            .order_by(desc(Problem.created_at))
            .offset(offset)
            .limit(filters.limit)
        )

        # Apply difficulty filter if provided
        if filters.difficulty:
            query = query.where(Problem.difficulty == filters.difficulty)

        problems = list(self.session.exec(query).all())
        new_problems: list[ProblemListSchema] = []
        for problem_id, title, difficulty, updated_at in problems:
            new_problems.append(
                ProblemListSchema(
                    id=problem_id,
                    title=title,
                    difficulty=difficulty,
                    updated_at=updated_at,
                )
            )
        return new_problems

    def get_by_id(self, problem_id: UUID) -> Problem | None:
        """
        Retrieve a problem by its ID from the database.
        """

        # Build the query to retrieve a problem by its ID
        query = select(Problem).where(Problem.id == problem_id)
        problem = self.session.exec(query).first()
        if problem is None:
            return None  # Problem not found
        return problem

    def update(self, problem_id: UUID, problem_data: ProblemUpdateSchema) -> bool:
        """
        Update an existing problem with the provided data.
        """

        # Retrieve the existing problem by its ID
        problem = self.get_by_id(problem_id)
        if problem is None:
            return False  # Problem not found, cannot update

        # Update the fields of the existing problem with the new data
        data = problem_data.model_dump(exclude_unset=True)
        for key, value in data.items():
            setattr(problem, key, value)
        
        self.session.add(problem)
        self.session.commit()
        self.session.refresh(problem)

        return True

    def delete_by_id(self, problem_id: UUID) -> bool:
        """
        Delete a problem by its ID.
        """

        # check if the problem exists before attempting to delete
        problem = self.get_by_id(problem_id)
        if problem is None:
            return False  # Problem not found, cannot delete
        self.session.delete(problem)
        self.session.commit()
        return True