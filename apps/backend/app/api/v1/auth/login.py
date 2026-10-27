from typing import Annotated

from fastapi import APIRouter, Depends, Form, status
from supabase import AsyncClient, AuthApiError

from app.core.supabase_client import create_supabase_client

# custom error
from app.exceptions import HTTPException
from app.schemas.auth_schema import LoginRequest, LoginResponse

router = APIRouter()


@router.post(
    "/login",
    tags=["auth"],
    status_code=status.HTTP_200_OK,
    response_model=LoginResponse,
)
async def login(
    request: Annotated[LoginRequest, Form()],
    supabase: Annotated[AsyncClient, Depends(create_supabase_client)],
):
    """
    Authenticate a user and return access and refresh tokens.

    ### Args:
        request (LoginRequest): The login request containing the username and password.
        supabase (Client): The Supabase client instance, injected via FastAPI's dependency injection system. Stored in the application state and initialized during startup.
    ### Returns:
        - Refresh and access token for the user.
        - HTTP 200 OK on success.
    ### Raises:
        - HTTP 401 Unauthorized if the username or password is invalid.
        - HTTP 500 Internal Server Error for any unexpected errors.
        - HTTP 422 Unprocessable Entity if the request body is invalid.
    """
    try:
        # normal logic
        auth_response = await supabase.auth.sign_in_with_password({"email": request.username, "password": request.password})

        if auth_response is None or auth_response.session is None:
            raise HTTPException(
                status=status.HTTP_401_UNAUTHORIZED,
                message="Invalid email or password",
                code="UNAUTHORIZED",
            )

        return LoginResponse(
            access_token=auth_response.session.access_token,
            refresh_token=auth_response.session.refresh_token,
            expires_in=auth_response.session.expires_in,
        )
    # Handle specific exceptions
    except AuthApiError as e:  # known Supabase error
        raise HTTPException(
            status=e.status, message=e.message, code=e.code or "AUTH_ERROR"
        ) from e  # Preserve original exception for debugging purposes

    except Exception as e:  # fallback for unexpected errors
        raise HTTPException(
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            message="An error occurred during login.",
            code="SERVER_ERROR",
        ) from e
