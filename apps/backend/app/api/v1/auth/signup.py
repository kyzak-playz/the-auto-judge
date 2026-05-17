from fastapi import APIRouter, status, Response, Depends
from supabase import AsyncClient, AuthApiError
from app.core.supabase_client import create_supabase_client
from app.schemas.auth_schema import SignInRequest, SignInResponse
# custom error
from app.exceptions import HTTPException

router = APIRouter()


@router.post("/signup", tags=["auth"], response_model=SignInResponse, status_code=status.HTTP_201_CREATED)
async def sign_up(request: SignInRequest, response: Response, supabase: AsyncClient = Depends(create_supabase_client)) -> SignInResponse:
    """
    Create a new user account. 
    
    ### Args:
        Request: SignInRequest - The request body containing the user's email and password.
        Response: Response - The FastAPI Response object used to set cookies and status codes.
        Supabase: AsyncClient - The Supabase client instance injected via dependency injection.
    
    ### Returns:
        SignInResponse: A response model containing the access token, token type, and expiration time.
    
    ### Raises:
        201: Created. User account successfully created and session established.
        400: Bad request. Signup created but no active session (e.g., email confirmation required).
        422: Unprocessable entity. Email is already registered.
        500: Internal server error. Any unexpected errors during the signup process.
    """
    try:
        # Create a new user account using Supabase authentication service
        auth_response = await supabase.auth.sign_up(
            {"email": request.email, "password": request.password}
        )

        # Check if the sign-up was successful and a session was created
        if not auth_response.session:
            raise HTTPException(
                status=status.HTTP_400_BAD_REQUEST,
                message="Signup created but no active session.",
                code="BAD_REQUEST"
            )

        response.status_code = status.HTTP_201_CREATED # Set status code to 201 Created for successful sign-up
        
        return SignInResponse(
            access_token=auth_response.session.access_token,
            expires_in=auth_response.session.expires_in,
            refresh_token=auth_response.session.refresh_token
        )
    # Handle specific exceptions
    except AuthApiError as e:   # known Supabase error
        raise HTTPException(
            status=e.status,
            message=e.message,
            code=e.code or "AUTH_ERROR"
        ) from e  # Preserve original exception for debugging purposes

    except Exception as e:
        raise HTTPException(
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            message="An error occurred during signup.",
            code="SERVER_ERROR"
        ) from e # Preserve original exception for debugging purposes