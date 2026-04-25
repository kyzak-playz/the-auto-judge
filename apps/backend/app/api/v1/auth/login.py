from fastapi import APIRouter, HTTPException, status, Response, Depends
from supabase import AsyncClient, AuthApiError
from app.core.supabase_client import create_supabase_client
from app.schemas.auth_schema import (
    LoginRequest,
    LoginResponse
)

router = APIRouter()


@router.post("/login", tags=["auth"])
async def login(request: LoginRequest, response: Response, supabase: AsyncClient = Depends(create_supabase_client)) -> LoginResponse:
    """
    Authenticate a user and return access and refresh tokens.

    ### Args:
        request (LoginRequest): The login request containing the email and password.
        supabase (Client): The Supabase client instance, injected via FastAPI's dependency injection system. Stored in the application state and initialized during startup.
        response (Response): The FastAPI Response object used to set cookies and status codes for the HTTP response.
    ### Returns:
        - Refresh and access token for the user.
        - HTTP 200 OK on success.
    ### Raises:
        - HTTP 401 Unauthorized if the email or password is invalid.
        - HTTP 500 Internal Server Error for any unexpected errors.
        - HTTP 422 Unprocessable Entity if the request body is invalid.
    """
    try:
        # normal logic
        auth_response = await supabase.auth.sign_in_with_password(
            {"email": request.email, "password": request.password}
        )

        if auth_response is None or auth_response.session is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

        response.set_cookie(
            key="refresh_token",
            value=auth_response.session.refresh_token,
            httponly=True,
            max_age=auth_response.session.expires_in,
            expires=auth_response.session.expires_in,
            samesite="strict",
            secure=True,
        )
        return LoginResponse(
            access_token=auth_response.session.access_token,
            token_type=auth_response.session.token_type,
            expires_in=auth_response.session.expires_in,
        )
    # Handle specific exceptions
    except HTTPException:       # re-raise FastAPI exceptions untouched
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request body")

    except AuthApiError as e:   # known Supabase error
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
    
    except Exception as e:      # fallback for unexpected errors
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
