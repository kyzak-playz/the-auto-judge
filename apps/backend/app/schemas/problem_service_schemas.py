from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from uuid import UUID
from typing import Optional
from app.models.enums import ProblemDifficulty

class ProblemFilterSchema(BaseModel):
    """
    Schema for filtering problems based on difficulty, pagination, and limit.\n
    Options:- 
    - difficulty: Filter problems by their difficulty level (Easy, Medium, Hard).
    - page: Specify the page number for pagination (default is 1).
    - limit: Specify the number of problems to return per page (default is 10).
    """
    difficulty: Optional[ProblemDifficulty] = Field(
        default=None, 
        description="Filter by problem difficulty"
    )
    page: int = Field(
        default=1,
        ge=1,
        description="Page number for pagination"
    )
    limit: int = Field(
        default=10,
        ge=1,
        le=100,
        description="Number of problems to return per page"
    )

class ProblemBaseSchema(BaseModel):
    title: str = Field(..., description="The title of the problem")
    description: str = Field(..., description="The description of the problem")
    difficulty: ProblemDifficulty = Field(..., description="The difficulty level")
    test_case: list[dict] = Field(..., description="The test cases")

class ProblemUpdateSchema(BaseModel):
    title: str | None = None
    description: str | None = None
    difficulty: ProblemDifficulty | None = None
    test_case: list[dict] | None = None

class ProblemListSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID = Field(..., description="The unique identifier of the problem")
    title: str = Field(..., description="The title of the problem")
    difficulty: ProblemDifficulty = Field(..., description="The difficulty level of the problem")
    updated_at: datetime = Field(..., description="The last updated timestamp of the problem")

class ProblemCreateSchema(ProblemBaseSchema):
    pass

class ProblemDetailSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    description: str
    difficulty: ProblemDifficulty
    test_case: list[dict]
    created_at: datetime
    updated_at: datetime