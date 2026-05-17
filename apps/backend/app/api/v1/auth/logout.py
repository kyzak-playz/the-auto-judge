"""
Logout module

Purpose:
    This module provides the API endpoint for logging out users by clearing the refresh token cookie. It ensures that users can securely end their sessions and prevents unauthorized access to protected resources after logout.

Responsibilities:
    - Define the API route for user logout.
    - Clear the refresh token cookie to invalidate the user's session.
    - Return a success message upon successful logout.

Notes:
    - This module is part of the authentication system and should be used in conjunction with the login and sign-in modules to provide a complete authentication flow.
    - Ensure that the frontend application properly handles the logout process by calling this endpoint and clearing any client-side authentication state as needed.
"""
from typing import Annotated
from fastapi import APIRouter, Response, status, Cookie, Header
from app.core.supabase_client import create_supabase_client
from supabase import AsyncClient, AuthApiError

# custom erro
from app.exceptions import HTTPException

router = APIRouter()

@router.post("/logout", tags=["auth"])
async def logout(access_token: Annotated[str, Header(...)], refresh_token: Annotated[str, Cookie(...)], response: Response):
    """
    Logout the user by clearing the refresh token cookie and revoking the session.
    
    Args:
        - Access token from the Authorization header.
        - Refresh token from the HTTP-only cookie.
        - Response object to set cookies and status codes.
    
    Returns:
        - A JSON message indicating successful logout.
    
    Raises:
        - 400: Bad request.
        - 422: Validation error.
        - 500: Internal server error.
    """
    try:
        supabase: AsyncClient = await create_supabase_client()
        # Set a temporary user session
        user = await supabase.auth.set_session(access_token=access_token, refresh_token=refresh_token)
        if user is None:
            raise HTTPException(
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                message="Failed to set user session with provided tokens.",
                code="SUPABASE_SESSION_ERROR"
            )
        # Revoke the refresh token to invalidate the session
        await supabase.auth.sign_out({"scope": "local"})
        # Clear the refresh token cookie
        response.delete_cookie(key="refresh_token")
        response.status_code = status.HTTP_202_ACCEPTED # Set status code to 202 Accepted for successful logout
        return {"message": "Logout successful"}
    
    # Handle specific exceptions
    except AuthApiError as e:   # known Supabase error
        raise HTTPException(
            status=e.status,
            message=e.message,
            code=e.code or "AUTH_ERROR"
        ) from e  # Preserve original exception for debugging purposes
    
    except Exception as e: # fallback for unexpected errors
        raise HTTPException(
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            message="An error occurred during logout.",
            code="SERVER_ERROR"
        ) from e  # Preserve original exception for debugging purposes
