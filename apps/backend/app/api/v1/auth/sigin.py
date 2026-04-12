from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

class SignInRequest(BaseModel):
    email: str
    password: str

@router.post("/signin", tags=["auth"])
async def sign_in(request: SignInRequest) -> SignInRequest:
    # Implementation for sign-in logic
    print(f"Email: {request.email}, Password: {request.password}")
    return request