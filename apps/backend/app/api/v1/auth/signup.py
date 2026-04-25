from fastapi import APIRouter, HTTPException, status, Response, Depends
from supabase import AsyncClient
from app.core.supabase_client import create_supabase_client
from app.schemas.auth_schema import SignInRequest, SignInResponse

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

        # sign_up may return no session (e.g., email confirmation flow)
        if auth_response is None or auth_response.session is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Signup created, but no active session. Verify your email first.",
            )
        # check if user already exists (Supabase returns a 400 error with a specific message in this case)
        if auth_response.user is None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="Email is already registered.",
            )

        # Set the refresh token in an HTTP-only cookie
        response.set_cookie(
            key="refresh_token",
            value=auth_response.session.refresh_token,
            httponly=True,
            max_age=auth_response.session.expires_in,
            expires=auth_response.session.expires_in,
            samesite="strict",
            secure=True,  # Set to True in production with HTTPS
            )

        response.status_code = status.HTTP_201_CREATED # Set status code to 201 Created for successful sign-up
        
        return SignInResponse(
            access_token=auth_response.session.access_token,
            token_type=auth_response.session.token_type,
            expires_in=auth_response.session.expires_in,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )
