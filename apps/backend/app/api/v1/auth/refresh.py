from typing_extensions import Annotated

from fastapi import APIRouter, HTTPException, status, Response, Depends, Cookie
from supabase import AsyncClient
from app.core.supabase_client import create_supabase_client
from app.schemas.auth_schema import SignInResponse

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
        
        if new_session is None or new_session.session is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token.",
            )
        
        # Update the refresh token cookie with the new refresh token
        response.set_cookie(
            key="refresh_token",
            value=new_session.session.refresh_token,
            httponly=True,
            max_age=new_session.session.expires_in,
            expires=new_session.session.expires_in,
            samesite="strict",
            secure=True,  # Set to True in production with HTTPS
        )
        
        return SignInResponse(
            access_token=new_session.session.access_token,
            token_type=new_session.session.token_type,
            expires_in=new_session.session.expires_in,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )