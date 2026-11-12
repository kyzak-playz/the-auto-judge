from typing import Annotated

from fastapi import APIRouter, Body, status

from app.schemas.submit_schema import SubmitSchema

router = APIRouter()


@router.post("/", status_code=status.HTTP_200_OK)
async def submit(payload: Annotated[SubmitSchema, Body(description="The submission payload")]) -> None:
    print(payload)
