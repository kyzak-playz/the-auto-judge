from fastapi import APIRouter, status

router = APIRouter()

"""
This endpoint returns a list of all submissions.
"""
@router.get("/", status_code=status.HTTP_200_OK)
def get_submission():
    return {"message": "This is a placeholder for the get_submission endpoint."}
