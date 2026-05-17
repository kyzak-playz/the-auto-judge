from typing_extensions import Annotated
from fastapi import APIRouter, status, Response, Depends, Cookie
from supabase import AsyncClient, AuthApiError
from app.core.supabase_client import create_supabase_client
from app.schemas.auth_schema import SignInResponse
# custom error
from app.exceptions import HTTPException

router = APIRouter()
@router.post("/refresh", tags=["auth"])
async def refresh_token(response: Response, refresh_token: Annotated[str, Cookie(...)], supabase: Annotated[AsyncClient, Depends(create_supabase_client)]) -> SignInResponse:
    """
    Refresh the access token using the refresh token stored in the HTTP-only cookie.
    
    ### Args:
        None (the refresh token is retrieved from the cookie)
    
    ### Returns:
        200: OK. Returns a new access token and updates the refresh token cookie.
    
    ### Raises:
        401: Unauthorized if the refresh token is missing or invalid.
        500: Internal server error for any unexpected errors.
    """
    try:
        # Use the refresh token to get a new access token
        new_session = await supabase.auth.refresh_session(refresh_token=refresh_token)
        # If the refresh token is invalid or expired, the Supabase client will raise an AuthApiError, which we catch and convert to our custom HTTPException.
        if new_session is None or new_session.session is None:
            raise HTTPException(
                status=status.HTTP_401_UNAUTHORIZED,
                message="Invalid refresh token.",
                code="INVALID_REFRESH_TOKEN"
            )
        
        return SignInResponse(
            access_token=new_session.session.access_token,
            refresh_token=new_session.session.refresh_token,
            expires_in=new_session.session.expires_in,
        )
    # Handle specific authentication errors from Supabase and convert them to our custom HTTPException for consistent error handling across the application.
    except AuthApiError as e: # Handle authentication-related errors from Supabase
        raise HTTPException(
            status=e.status,
            message=e.message,
            code=e.code or "AUTH_ERROR"
        ) from e
    except Exception as e: # Handle any other unexpected errors
        raise HTTPException(
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            message="An error occurred while refreshing the token.",
            code="SERVER_ERROR"
        ) from e