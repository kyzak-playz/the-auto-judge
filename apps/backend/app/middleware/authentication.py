"""
Authentication Middleware

Purpose:
    To intercept incoming HTTP requests and perform authentication checks before allowing access to protected resources.

Responsibilities:
    - Check and extract access token from the request headers.
    - If token doesn't exists, return a 401 Unauthorized response.
    - If token exists, check if it's expired or invalid.
    - If everything is valid, fetch user information and attach it to the request state for use in route handlers.
"""

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.supabase_client import get_current_user
from app.exceptions import HTTPException

class AuthenticationMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):

        # If request is not for a protected endpoint, skip authentication
        if not request.url.path.startswith("/api/v1/protected"):
            return await call_next(request)

        # Extract the Authorization header
        auth_header = request.headers.get('Authorization')
        
        # Check if the Authorization header is present and starts with "Bearer "
        # prefix is case-insensitive    
        if not auth_header or not auth_header.lower().startswith("bearer "):
            raise HTTPException(
                status=401,
                message="Unauthorized: Missing or invalid Authorization header",
                code="IVALID_AUTH_HEADER"
            )
        
        # Extract the token from the header
        token = auth_header.split(" ")[1] if len(auth_header.split(" ")) > 1 else None
        
        if not token:
            raise HTTPException(
                status=401,
                message="Unauthorized: Invalid token format",
                code="INVALID_TOKEN_FORMAT"
            )
        
        # get user information from the token and attach it to the request state
        try:
            user = await get_current_user(token)
            request.state.user = user
            
        except Exception:
            raise HTTPException(
                status=401,
                message="Unauthorized: Invalid token",
                code="INVALID_TOKEN"
            )
        
        # Proceed to the next middleware or route handler
        response = await call_next(request)
        return response