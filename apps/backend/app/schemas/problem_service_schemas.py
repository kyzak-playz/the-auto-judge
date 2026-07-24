from datetime import datetime

from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional
from app.models.enums import ProblemDifficulty

class ProblemFilterSchema(BaseModel):
    difficulty: Optional[ProblemDifficulty] = Field(
        default=None, 
        description="Filter by problem difficulty"
    )
    page: int = Field(
        default=1, 
        description="Page number for pagination"
    )
    limit: int = Field(
        default=10, 
        description="Number of problems to return per page"
    )

class ProblemUpdateSchema(BaseModel):
    title: Optional[str] = Field(
        default=None, 
        description="The title of the problem"
    )
    description: Optional[str] = Field(
        default=None, 
        description="The description of the problem"
    )
    difficulty: Optional[ProblemDifficulty] = Field(
        default=None, 
        description="The difficulty level of the problem"
    )
    test_case: Optional[dict] = Field(
        default=None, 
        description="The test cases for the problem"
    )

class ProblemListSchema(BaseModel):
    id: UUID = Field(..., description="The unique identifier of the problem")
    title: str = Field(..., description="The title of the problem")
    difficulty: str = Field(..., description="The difficulty level of the problem")
    updated_at: datetime = Field(..., description="The last updated timestamp of the problem")